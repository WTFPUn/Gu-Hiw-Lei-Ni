import { check_if_auth, get_auth } from '@/utils/auth';
import { get_place_photo_client } from '@/utils/map';
import { Coords } from 'google-map-react';
import React, { useMemo } from 'react';
import useWebSocket, { ReadyState } from 'react-use-websocket';

export type MemberType = {
  first_name: string;
  last_name: string;
  user_id: string;
};

export type PartyInfo = {
  id: string;
  party_name: string;
  host_id?: string;
  description: string;
  lat: number;
  lng: number;
  place_id?: string;
  location?: string;
  image?: string;
  distance?: number;
  members?: MemberType[];
  host?: MemberType;
  size?: number;
  created_timestamp?: string;
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
  currentLocation?: Coords;
  currentPartyInfo?: PartyInfo | null;
  queryPartyInfo?: PartyInfo | null;
  nearbyParties?: PartyInfo[];
  lastJsonMessage?: any;
  send_msg?: MessageSender;
  fetch_current_party?: () => void;
  fetch_nearby_parties?: (distance: number) => void;
  query_party?: (party_id: string) => void;
  join_party?: (party_id: string) => void;
  create_party?: (party: PartyInfo) => void;
  leave_party?: () => void;
  clear_query_party?: () => void;
};

export const PartySystemContext = React.createContext<PartySystemContextType>(
  {},
);

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

  const [systemState, setSystemState] = React.useState<PartySystemContextType>(
    {},
  );

  const send = (
    type: string,
    service: string | null,
    data?: object,
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

  const handle_socket_open = () => {
    if (check_if_auth()) send('ws_connect', null, {});
    else setSystemState(state => ({ ...state, currentPartyInfo: null }));
  };

  const fetch_current_party_info = () => {
    console.log('fetching current party info');
    send('ws', 'partyhandler', { type: 'get_current_party' });
  };

  const join_party = (party_id: string) => {
    console.log('joining party', party_id);
    send('ws', 'partyhandler', { type: 'join_party', party_id });
  };

  const leave_party = () => {
    console.log('leaving party');
    if (systemState.currentPartyInfo)
      send('ws', 'partyhandler', { type: 'leave_party' });
  };

  const create_party = (party: PartyInfo) => {
    console.log('creating party', party);
    send('ws', 'partyhandler', { type: 'create_party', party });
  };

  const query_party = (party_id: string) => {
    // if party id is the same as current party info, set query party info to current party info
    console.log('querying party', party_id);
    if (party_id == systemState?.currentPartyInfo?.id) {
      console.log('party same as current party info');
      setSystemState(state => {
        return { ...state, queryPartyInfo: systemState.currentPartyInfo };
      });
      return;
    }
    send('get', 'partyhandler', undefined, ['party', party_id]);
  };

  const clear_query_party = () => {
    console.log('clearing query party');
    setSystemState(state => {
      return { ...state, queryPartyInfo: null };
    });
  };

  const handle_socket_message = async () => {
    const message = lastJsonMessage as any;
    // if message is null or undefined or invalid
    if (!message?.type) {
      console.log('unhandled message', message);
      return;
    }

    console.log('message', message);
    if (message.type == 'success') {
      if (typeof message.data == 'string') {
        switch (message?.data) {
          case 'connected':
          case 'reconnected':
            console.log('successfully authenticated websocket');
            break;
          default:
            console.error('unhandled success message', message);
            break;
        }
      } else if (typeof message.data == 'object') {
        switch (message.data?.type) {
          case 'party':
            console.log('query party');
            if (message.data?.id) {
              let partyData = message?.data as PartyInfo;
              const partyImage = await get_place_photo_client(
                partyData?.place_id,
              );
              // inject image into party data
              partyData = {
                ...partyData,
                image: partyImage,
              };

              // if user is in the party, set current party info to the party data
              if (
                partyData.members?.find(
                  member => member.user_id == get_auth().user?.user_id,
                )
              ) {
                // in the done state, clear current party info
                if (
                  ['finished', 'cancelled'].includes(partyData?.status ?? '')
                ) {
                  setSystemState(state => {
                    return {
                      ...state,
                      currentPartyInfo: null,
                      queryPartyInfo: partyData,
                    };
                  });
                  return;
                } else {
                  setSystemState(state => {
                    return {
                      ...state,
                      currentPartyInfo: partyData,
                      queryPartyInfo: partyData,
                    };
                  });
                }
              } else {
                setSystemState(state => {
                  return { ...state, queryPartyInfo: partyData };
                });
              }
            }
            break;
          default:
            console.error('unhandled success message data object', message);
            break;
        }
      }

      fetch_current_party_info();
    } else if (message.type == 'ws') {
      console.error('unhandled service', message?.service, message?.data);
    } else if (message.type == 'party') {
      let partyData = message?.data as PartyInfo;

      const partyImage = await get_place_photo_client(partyData?.place_id);
      // inject image into party data
      partyData = {
        ...partyData,
        image: partyImage,
      };
      // if user is in the party, set current party info to the party data
      if (['finished', 'cancelled'].includes(partyData?.status ?? '')) {
        setSystemState(state => {
          return { ...state, currentPartyInfo: null };
        });
        return;
      }
      if (partyData.id) {
        setSystemState(state => {
          return { ...state, currentPartyInfo: partyData };
        });
      }
    }
  };

  const update_current_location = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        position => {
          // console.log(position.coords);
          setSystemState(state => {
            return {
              ...state,
              currentLocation: {
                lat: position.coords.latitude,
                lng: position.coords.longitude,
              },
            };
          });
        },
        console.log,
        { enableHighAccuracy: true },
      );
    }
  };

  React.useEffect(() => {
    handle_socket_message();
  }, [lastJsonMessage]);

  // handle token change and set function in context
  React.useEffect(() => {
    let updateInterval: NodeJS.Timeout;
    update_current_location();
    updateInterval = setInterval(() => {
      update_current_location();
    }, 10000);

    window.addEventListener('tokenChange', handle_socket_open);
    return () => {
      clearInterval(updateInterval);
      window.removeEventListener('tokenChange', handle_socket_open);
    };
  }, []);

  const value = useMemo<PartySystemContextType>(() => {
    const messenger =
      readyState == ReadyState.OPEN
        ? {
            send_msg: send,
            fetch_current_party: fetch_current_party_info,
            join_party,
            leave_party,
            query_party,
            clear_query_party,
            create_party,
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
