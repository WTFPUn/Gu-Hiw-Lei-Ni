import { check_if_auth, get_auth } from '@/utils/auth';
import { Coords } from 'google-map-react';
import React, { useMemo } from 'react';
import useWebSocket, { ReadyState } from 'react-use-websocket';

export type PartyInfo = {
  party_name: string;
  host_id?: string;
  description: string;
  lat: number;
  lng: number;
  place_id?: string;
  location?: string;
  distance?: number;
  members?: any[];
  size?: number;
  status?: 'not_started' | 'in_progress' | 'finished' | 'cancelled';
  budget?: 'low' | 'medium' | 'high';
};

type MessageSender = (
  type: string,
  service: string | null,
  data: object,
  channel?: string[],
) => void;

export type PartySystemContextType = {
  currentPartyInfo: PartyInfo | null;
  lastJsonMessage?: any;
  send_msg?: MessageSender;
  fetch_current_party?: () => void;
};

export const PartySystemContext = React.createContext<PartySystemContextType>({
  currentPartyInfo: null,
  send_msg: (type: string, service: string | null, data: object) => {},
  fetch_current_party: () => {},
});

export interface JoinPartyData {
  type: 'join_party';
  party_id: string;
}

export interface CreatePartyData {
  type: 'create_party';
  party: PartyInfo;
}

/**
 * PartyInfoProvider
 * A provider that provides the current party info.
 * and be able to facilitate the change of the current party info and handle notification state
 * using websockets
 *
 * @todo implement fetching of party info
 * @todo implement the notification state
 *
 * @param {React.ReactNode} children - The body of the provider.
 *
 */
export default function PartySystemProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const {
    sendMessage,
    sendJsonMessage,
    lastMessage,
    lastJsonMessage,
    readyState,
    getWebSocket,
  } = useWebSocket((process.env.NEXT_PUBLIC_WS_API_URL as string) + '/ws', {
    onOpen: () => handle_socket_open(),
    //Will attempt to reconnect on all close events, such as server shutting down
    shouldReconnect: closeEvent => true,
  });

  const [systemState, setSystemState] = React.useState<PartySystemContextType>({
    currentPartyInfo: null,
  });

  const handle_socket_open = () => {
    if (check_if_auth()) send('ws_connect', null, {});
  };

  const handle_socket_message = () => {
    const message = lastJsonMessage as any;
    // if message is null or undefined or invalid
    if (!message?.type) {
      console.log('unhandled message', message);
      return;
    }
    console.log('message', message);
    if (message.type == 'success' && message?.data == 'connected') {
      console.log('successfully authenticated websocket');
    } else if (message.type == 'ws') {
      switch (message?.service) {
        case 'partyhandler':
          return;
        default:
          console.log('unhandled service', message?.service, message?.data);
      }
    }
  };

  const send = (
    type: string,
    service: string | null,
    data: object,
    channel?: string[],
  ) => {
    const authInfo = get_auth();
    const token = localStorage.getItem('token');
    sendJsonMessage({
      type,
      token: authInfo.auth_status ? token : undefined,
      service: service ?? undefined,
      data,
      channel,
    });
  };

  const setParty = (party: PartyInfo | null) => {
    setSystemState(state => {
      return { ...state, currentPartyInfo: party };
    });
  };

  const fetch_current_party_info = () => {
    console.log('fetching current party info');
    send('ws', 'partyhandler', { type: 'get_current_party' });
  };

  React.useEffect(() => {
    handle_socket_message();
  }, [lastJsonMessage]);

  // handle token change and set function in context
  React.useEffect(() => {
    setSystemState(state => {
      return { ...state, set_current_party: setParty, send_msg: send };
    });
    window.addEventListener('tokenChange', handle_socket_open);
    return () => {
      window.removeEventListener('tokenChange', handle_socket_open);
    };
  }, []);

  const value = useMemo(() => {
    const messenger =
      readyState == ReadyState.OPEN
        ? {
            send_msg: send,
            fetch_current_party: fetch_current_party_info,
          }
        : {};

    return {
      ...systemState,
      lastJsonMessage,
      ...messenger,
    };
  }, [systemState, lastJsonMessage, readyState]);

  return (
    <PartySystemContext.Provider value={value}>
      {children}
    </PartySystemContext.Provider>
  );
}
