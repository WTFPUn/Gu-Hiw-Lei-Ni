import { Coords } from 'google-map-react';
import React from 'react';

export type PartyInfo = {
  name: string;
  description: string;
  location: Coords;
  distance: number;
  members: any[];
};

export type PartySystemContextType = {
  currentPartyInfo: PartyInfo | null;
  setCurrentParty: (party: PartyInfo | null) => void;
};

export const PartySystemContext = React.createContext<PartySystemContextType>({
  currentPartyInfo: null,
  setCurrentParty: (party: PartyInfo | null) => {},
});

/**
 * PartyInfoProvider
 * A provider that provides the current party info.
 * and be able to facilitate the change of the current party info and handle notification state
 * using websockets
 *
 * @todo implement websocket connection and to the frontend
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
  const [systemState, setSystemState] = React.useState<PartySystemContextType>({
    currentPartyInfo: null,
    setCurrentParty: (party: PartyInfo | null) => {},
  });

  const setParty = (party: PartyInfo | null) => {
    setSystemState(state => {
      return { ...state, currentPartyInfo: party };
    });
  };

  React.useEffect(() => {
    setSystemState(state => {
      return { ...state, setCurrentParty: setParty };
    });
  }, []);

  return (
    <PartySystemContext.Provider value={systemState}>
      {children}
    </PartySystemContext.Provider>
  );
}
