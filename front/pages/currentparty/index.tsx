import Button from '@/components/common/Button';
import Layout from '@/components/common/Layout';
import InfoTable from '@/components/party/InfoTable';
import { PartySystemContext, PartySystemContextType } from '@/contexts/party';
import { calculateDistance } from '@/utils/map';
import { Coords } from 'google-map-react';
import { WithRouterProps } from 'next/dist/client/with-router';
import { withRouter } from 'next/router';
import React from 'react';

class PartyDetail extends React.Component<WithRouterProps> {
  static contextType?: React.Context<PartySystemContextType> =
    PartySystemContext;
  constructor(props: WithRouterProps) {
    super(props);
  }

  render() {
    const { router } = this.props;
    const partySystem = this.context as PartySystemContextType;

    if (!partySystem?.currentPartyInfo) {
      router.push('/home');
    }

    return (
      <Layout type="party">
        <div className="h-screen flex flex-col justify-center w-screen content-between items-center pb-4">
          <div className="grow w-3/4 pt-16">
            <div className="max-w-full h-[25vh] p-0.5 border-2 rounded-lg border-secondary">
              <img src="/meat.png" className="w-full h-full object-cover" />
            </div>
            <div className="flex flex-col justify-center items-center pt-6 pb-2 ">
              <div className="text-2xl font-semibold">Hiw</div>
              <div className="text-lg text-light-gray">Hiw</div>
            </div>
            <div className="h-full w-full">
              <hr className="text-primary font-medium" />
              <InfoTable
                partyInfo={
                  {
                    distance: partySystem?.currentLocation
                      ? calculateDistance(partySystem?.currentLocation, {
                          lat: partySystem?.currentPartyInfo?.lat as number,
                          lng: partySystem?.currentPartyInfo?.lng as number,
                        }).toFixed(2)
                      : undefined,
                    ...partySystem?.currentPartyInfo,
                  } as any
                }
              />
            </div>
          </div>

          <div className="flex flex-col w-3/4 justify-center content-center gap-2">
            <Button
              text="Chat"
              primary
              onClick={() => router.push('/currentparty/chat')}
            />
            {/* <Button text="Leave" danger onClick={() => router.push('/home')} /> */}
          </div>
        </div>
      </Layout>
    );
  }
}

export default withRouter(PartyDetail);
