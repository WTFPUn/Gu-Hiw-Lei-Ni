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
  members?: Record<string, MemberType>;
  host?: MemberType;
  size?: number;
  created_timestamp?: string;
  status?: 'not_started' | 'in_progress' | 'finished' | 'cancelled';
  budget?: 'low' | 'medium' | 'high';
};

export type PartyMarkerInfo = {
  id: string;
  party_name: string;
} & Coords;

export type ClusterMarkerInfo = {
  cluster_coord: [number, number];
  parties: PartyMarkerInfo[];
};

export type Message = {
  type: string;
  message_id: string;
  message: string;
  timestamp: string;
};

export interface UserChatMessage extends Message {
  type: 'user_chat_message';
  user_id: string;
  user_first_name: string;
  user_last_name: string;
  user_name: string;
}

export interface SystemChatMessge extends Message {
  type: 'system_message';
  message: string;
}

type ChatMessage = UserChatMessage | SystemChatMessge;

export type ChatSession = {
  session_id: string;
  dialogues: ChatMessage[];
  status: 'open' | 'closed';
};

export type MessageSender = (
  type: string,
  service: string | null,
  data?: object,
  channel?: string[],
) => void;

export type PartySystemContextType = {
  /**
   * The current location of the user.
   * May be null if the user has not given permission to access location.
   * @property lat - The latitude of the user.
   * @property lng - The longitude of the user.
   */
  currentLocation?: Coords;
  /**
   * The current party info.
   * Null if the user is not in a party.
   */
  currentPartyInfo?: PartyInfo | null;
  /**
   * The current chat session.
   * Null if the user is not in a party and have not fetched the chat session.
   */
  currentChatSession?: ChatSession | null;
  /**
   * The query party info.
   * Null if the user is not querying a party.
   */
  queryPartyInfo?: PartyInfo | null;
  /**
   * The search range to search for nearby cluster of parties.
   */
  nearbyRadius?: number;
  /**
   * The nearby cluster of parties.
   */
  nearbyCluster?: ClusterMarkerInfo[];
  /**
   * sets the search range to search for nearby cluster of parties.
   */
  set_nearby_radius?: (radius: number) => void;
  /**
   * The last json message received from the websocket.
   */
  lastJsonMessage?: any;
  /**
   * Message sender function.
   * Sends a message to the websocket.
   * @param type - The type of the message.
   * @param service - The service of the message.
   * @param data - The data of the message.
   * @param channel - The channel of the message.
   */
  send_msg?: MessageSender;
  /**
   * Fetches the current party info.
   */
  fetch_current_party?: () => void;
  /**
   * Fetches the current chat session.
   * @requires currentPartyInfo
   */
  fetch_current_chat_session?: () => void;
  /**
   * Fetches nearby parties.
   * @param distance - The distance to search for nearby parties.
   * @requires currentLocation
   */
  fetch_nearby_parties?: (distance: number) => void;
  /**
   * Queries a party.
   * @param party_id - The id of the party to query.
   */
  query_party?: (party_id: string) => void;
  /**
   * Joins a party.
   * @param party_id
   */
  join_party?: (party_id: string) => void;
  /**
   * Leaves a party.
   * @requires currentPartyInfo
   */
  leave_party?: () => void;
  /**
   * Starts a party.
   * @param { PartyInfo } party - information of the party to create.
   */
  create_party?: (party: PartyInfo) => void;
  /**
   * Clears the query party info.
   */
  clear_query_party?: () => void;
  /**
   * Sends a chat message to the current party.
   * @requires currentPartyInfo
   * @param message - The message to send.
   */
  chat_message_party?: (message: string) => void;
  /**
   * Starts a party.
   * @requires currentPartyInfo
   */
  start_party?: () => void;
  /**
   * Closes a party.
   * @requires currentPartyInfo
   */
  close_party?: () => void;
  /**
   * Matchmaking
   * @requires currentLocation
   * @param radius - The radius to search for nearby parties.
   * @param budget - The budget of the user.
   */
  matchmaking?: (radius: number, budget: string) => void;
  /**
   * Kicks a member from the party.
   * @requires currentPartyInfo
   * @param user_id - The user id of the member to kick.
   */
  kick_member?: (user_id: string) => void;
};

export const PartySystemContext = React.createContext<PartySystemContextType>(
  {},
);

/**
 * PartyInfoProvider
 * A provider that provides the current party info.
 * and be able to facilitate the change of the current party info and handle notification state
 * using websockets
 *
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
    nearbyRadius: 4,
  });

  const send: MessageSender = (
    type: string,
    service: string | null,
    data?: object,
    channel?: string[],
  ) => {
    const token = localStorage.getItem('token');
    if (token)
      sendJsonMessage({
        type,
        token: token,
        service: service ?? undefined,
        data,
        channel,
      });
  };

  const handle_socket_open = () => {
    if (check_if_auth()) send('ws_connect', null, {});
    else setSystemState(state => ({ ...state, currentPartyInfo: null }));
  };

  const fetch_current_party = () => {
    console.log('fetching current party info');
    send('ws', 'partyhandler', { type: 'get_current_party' });
  };

  const fetch_current_chat_session = () => {
    if (systemState?.currentPartyInfo?.id) {
      console.log('fetch current chat session');
      send('get', 'chathandler', undefined, [
        'session',
        systemState?.currentPartyInfo?.id,
      ]);
    }
  };

  const join_party = (party_id: string) => {
    if (!systemState?.currentPartyInfo?.id) {
      console.log('joining party', party_id);
      send('ws', 'partyhandler', { type: 'join_party', party_id });
    }
  };

  const leave_party = () => {
    if (systemState?.currentPartyInfo?.id) {
      console.log('leaving party');
      send('ws', 'partyhandler', {
        type: 'leave_party',
        party_id: systemState?.currentPartyInfo?.id,
      });
    }
  };

  const create_party = (party: PartyInfo) => {
    if (!systemState?.currentPartyInfo?.id) {
      console.log('creating party', party);
      send('ws', 'partyhandler', { type: 'create_party', party });
    }
  };

  const close_party = () => {
    if (systemState?.currentPartyInfo?.id) {
      console.log('closing party');
      send('ws', 'partyhandler', {
        type: 'close_party',
        party_id: systemState?.currentPartyInfo?.id,
      });
    }
  };

  const start_party = () => {
    if (systemState?.currentPartyInfo?.id) {
      console.log('starting party');
      send('ws', 'partyhandler', {
        type: 'start_party',
        party_id: systemState?.currentPartyInfo?.id,
      });
    }
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
    setSystemState(state => {
      console.log('clearing query party');
      return { ...state, queryPartyInfo: null };
    });
  };

  const chat_message_party = (message: string) => {
    if (systemState?.currentPartyInfo?.id) {
      console.log('sending chat message', message);
      send('ws', 'chathandler', {
        type: 'send_message',
        session_id: systemState?.currentPartyInfo?.id,
        message: {
          type: 'user_chat_message',
          user_id: get_auth().user?.user_id,
          message,
        },
      });
    }
  };

  const search_nearby_parties = () => {
    if (systemState?.currentLocation) {
      send('ws', 'partyhandler', {
        type: 'search_party',
        lat: systemState.currentLocation.lat,
        lng: systemState.currentLocation.lng,
        radius: systemState.nearbyRadius ?? 4,
      });
    }
  };

  const set_nearby_radius = (radius: number) => {
    setSystemState(state => {
      return { ...state, nearbyRadius: radius };
    });
  };

  const matchmaking = (radius: number, budget: string) => {
    if (systemState?.currentLocation) {
      send('ws', 'partyhandler', {
        type: 'match_making',
        lat: systemState.currentLocation.lat,
        lng: systemState.currentLocation.lng,
        radius: radius ?? 4,
        budget: budget ?? undefined,
      });
    }
  };

  const kick_member = (user_id: string) => {
    if (systemState?.currentPartyInfo?.id) {
      send('ws', 'partyhandler', {
        type: 'kick_member',
        party_id: systemState?.currentPartyInfo?.id,
        user_id,
      });
    }
  };

  const handle_socket_message = async () => {
    const message = lastJsonMessage as any;
    // if message is null or undefined or invalid
    if (
      !(
        message?.type ||
        typeof message?.success == 'boolean' ||
        message?.cluster
      )
    ) {
      console.log('unhandled message', message);
      return;
    }

    console.log('message', message);
    // handling success response
    if (message.type == 'success') {
      if (typeof message.data == 'string') {
        // handling ws connect success message
        switch (message?.data) {
          case 'connected':
            console.log('successfully connected websocket');
          case 'reconnected':
            console.log('successfully authenticated websocket');
            fetch_current_party();
            break;
          default:
            console.error('unhandled success message', message);
            break;
        }
      } else if (typeof message.data == 'object') {
        switch (message.data?.type) {
          case 'party':
            console.log('query party');
            if (message.data?.data?.id) {
              let partyData = message?.data.data as PartyInfo;
              const partyImage = await get_place_photo_client(
                partyData?.place_id,
              );
              // inject image into party data
              partyData = {
                ...partyData,
                image: partyImage,
              };
              console.log('party data', partyData);
              // if user is in the party, set current party info to the party data
              if (
                Object.values(partyData?.members ?? {}).find(
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

          case 'chat':
            let chatSessionData = message?.data?.data as ChatSession;
            console.log('chat session', chatSessionData);
            setSystemState(state => {
              return { ...state, currentChatSession: chatSessionData };
            });
            break;
          default:
            console.error('unhandled success message data object', message);
            break;
        }
      }
    } else if (message.type == 'ws') {
      // unknown ws message
      console.error('unhandled service', message?.service, message?.data);
    } else if (message.type == 'party') {
      // used for current party info
      let partyData = message?.data as PartyInfo;
      const partyImage = await get_place_photo_client(partyData?.place_id);
      // inject image into party data
      partyData = {
        ...partyData,
        image: partyImage,
      };
      // if user is in the party, set current party info to the party data
      if (
        ['finished', 'cancelled'].includes(partyData?.status ?? '') ||
        !Object.keys(partyData.members ?? {}).includes(
          get_auth().user?.user_id ?? '',
        )
      ) {
        setSystemState(state => {
          return { ...state, currentPartyInfo: null };
        });
        return;
      } else if (partyData.id) {
        // is valid party with id
        setSystemState(state => {
          return { ...state, currentPartyInfo: partyData };
        });
        // fetch chat session for first time
        send('get', 'chathandler', undefined, ['session', partyData.id]);
      }
    } else if (message.type == 'chat') {
      let chatSessionData = message?.data as ChatSession;

      if (chatSessionData.session_id == systemState?.currentPartyInfo?.id) {
        console.log('updating chat session');
        setSystemState(state => {
          return { ...state, currentChatSession: chatSessionData };
        });
      } else {
        console.error('unhandled chat session', chatSessionData);
        setSystemState(state => {
          return { ...state, currentChatSession: null };
        });
      }
    } else if (message.success == true) {
      // handling user action success message
      switch (message?.message) {
        case 'Successfully leave party':
          console.log('successfully left party');
          fetch_current_party();
          setSystemState(state => {
            return { ...state, currentChatSession: null };
          });
          break;
      }
    } else if (message.success == false) {
      // handling user action success message
      switch (message?.message) {
        case 'User is not currently in party':
          console.log('user is not currently in party');
          setSystemState(state => {
            return { ...state, currentPartyInfo: null };
          });
          break;
      }
    } else if (typeof message?.cluster?.data == 'object') {
      setSystemState(state => {
        return { ...state, nearbyCluster: message.cluster.data };
      });
    }
  };

  const update_current_location = () => {
    if (navigator?.geolocation) {
      navigator.geolocation.getCurrentPosition(
        position => {
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

  // handle incoming socket message
  React.useEffect(() => {
    handle_socket_message();
  }, [lastJsonMessage]);

  // handle token change and set function in context
  React.useEffect(() => {
    let updateInterval: NodeJS.Timeout;
    update_current_location();
    updateInterval = setInterval(() => {
      update_current_location();
    }, 1000);

    window.addEventListener('tokenChange', handle_socket_open);
    return () => {
      clearInterval(updateInterval);
      window.removeEventListener('tokenChange', handle_socket_open);
    };
  }, []);

  React.useEffect(() => {
    if (get_auth().auth_status) {
      search_nearby_parties();
    }
  }, [systemState?.currentLocation, systemState?.nearbyRadius]);

  // value that is return to the context
  // this value is memoized to prevent unnecessary rerender
  const value = useMemo<PartySystemContextType>(() => {
    const isConnected = readyState == ReadyState.OPEN;
    const isInParty = systemState?.currentPartyInfo != null;
    const isHost =
      systemState?.currentPartyInfo?.host?.user_id == get_auth().user?.user_id;

    const userCommand = isConnected
      ? {
          send_msg: send,
          fetch_current_party,
          query_party,
          clear_query_party,
          create_party: !isInParty ? create_party : undefined,
          join_party,
          leave_party: isInParty ? leave_party : undefined,
          chat_message_party: isInParty ? chat_message_party : undefined,
          fetch_current_chat_session: isInParty
            ? fetch_current_chat_session
            : undefined,
          start_party: isHost ? start_party : undefined,
          close_party: isHost ? close_party : undefined,
          set_nearby_radius,
          matchmaking: !isInParty ? matchmaking : undefined,
          kick_member: isHost ? kick_member : undefined,
        }
      : {};

    return {
      ...systemState,
      lastJsonMessage,
      ...userCommand,
    };
  }, [systemState, lastJsonMessage, readyState]);

  return (
    <PartySystemContext.Provider value={value}>
      {children}
    </PartySystemContext.Provider>
  );
}
