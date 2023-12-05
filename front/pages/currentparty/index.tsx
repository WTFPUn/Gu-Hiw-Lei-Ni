import Button from '@/components/common/Button';
import Layout from '@/components/common/Layout';
import InfoTable from '@/components/party/InfoTable';
import { PartySystemContext, PartySystemContextType } from '@/contexts/party';
import { WithAuthProps, get_auth, withAuth } from '@/utils/auth';
import {
  calculateDistance,
  get_place_image,
  get_place_info,
} from '@/utils/map';
import { Coords } from 'google-map-react';
import { WithRouterProps } from 'next/dist/client/with-router';
import { withRouter } from 'next/router';
import React from 'react';

type PartyDetailProps = {} & WithRouterProps & WithAuthProps;

type PartyDetailState = {
  isCurrentlyAction: boolean;
};

class PartyDetail extends React.Component<PartyDetailProps, PartyDetailState> {
  static contextType?: React.Context<PartySystemContextType> =
    PartySystemContext;
  constructor(props: PartyDetailProps) {
    super(props);
    this.state = {
      isCurrentlyAction: false,
    };
    this.handle_start_party = this.handle_start_party.bind(this);
    this.handle_close_party = this.handle_close_party.bind(this);
  }

  handle_start_party() {
    if (!this.state.isCurrentlyAction) {
      this.setState({ isCurrentlyAction: true });
      const partySystem = this.context as PartySystemContextType;
      partySystem.start_party?.();
      const interval = setInterval(() => {
        partySystem.fetch_current_party?.();
        this.setState({ isCurrentlyAction: false });
        clearInterval(interval);
      }, 1000);
    }
  }

  handle_close_party() {
    if (!this.state.isCurrentlyAction) {
      this.setState({ isCurrentlyAction: true });
      const partySystem = this.context as PartySystemContextType;
      partySystem.close_party?.();
      const interval = setInterval(() => {
        partySystem.fetch_current_party?.();
        this.setState({ isCurrentlyAction: false });
        clearInterval(interval);
      }, 1000);
    }
  }

  render() {
    const { router } = this.props;
    const partySystem = this.context as PartySystemContextType;
    const { currentPartyInfo, start_party, close_party } = partySystem;

    const isHost = currentPartyInfo?.host?.user_id == get_auth()?.user?.user_id;
    if (router.isReady) {
      if (!partySystem?.currentPartyInfo) router.push('/home');
      else if (!get_auth().auth_status) router.push('/login');
    }

    return (
      <Layout type="party">
        <div className="min-h-screen flex flex-col justify-center w-screen content-between items-center pb-4">
          <div className="grow w-3/4 pt-16">
            <div className="max-w-full h-[25vh] p-0.5 border-2 rounded-lg border-secondary">
              <img
                src={currentPartyInfo?.image ?? '/meat.png'}
                className="w-full h-full object-cover rounded-sm"
                data-test="party-img"
              />
            </div>
            <div className="flex flex-col justify-center items-center pt-6 pb-2 ">
              <div className="text-2xl font-semibold" data-test="party-name">
                {currentPartyInfo?.party_name}
              </div>
              {currentPartyInfo?.created_timestamp && (
                <div
                  className="text-md text-light-gray"
                  data-test="party-timestamp"
                >
                  {new Date(
                    currentPartyInfo?.created_timestamp,
                  ).toLocaleString()}
                </div>
              )}
            </div>
            <div className="h-full w-full">
              <hr className="text-primary font-medium" />
              <InfoTable
                partyInfo={
                  {
                    distance: partySystem?.currentLocation
                      ? calculateDistance(partySystem?.currentLocation, {
                          lat: currentPartyInfo?.lat as number,
                          lng: currentPartyInfo?.lng as number,
                        }).toFixed(2)
                      : undefined,
                    ...currentPartyInfo,
                  } as any
                }
                onRemoveMember={partySystem?.kick_member}
              />
            </div>
          </div>
          <div className="flex flex-col w-3/4 justify-center content-center gap-2">
            {isHost && currentPartyInfo?.status == 'not_started' && (
              <>
                <Button
                  text="Start Party"
                  primary
                  onClick={this.handle_start_party}
                  data-test="start-party-btn"
                />
                <Button
                  text="Cancel Party"
                  danger
                  onClick={this.handle_close_party}
                  data-test="cancel-party-btn"
                />
              </>
            )}
            {isHost && currentPartyInfo?.status == 'in_progress' && (
              <>
                <Button
                  text="End Party"
                  danger
                  onClick={this.handle_close_party}
                  data-test="end-party-btn"
                />
              </>
            )}
            <Button
              text="Chat"
              primary={!isHost}
              onClick={() => router.push('/currentparty/chat')}
              data-test="chat-party-btn"
            />
            {/* <Button text="Leave" danger onClick={() => router.push('/home')} /> */}
          </div>
        </div>
      </Layout>
    );
  }
}

export default withRouter(withAuth(PartyDetail));
