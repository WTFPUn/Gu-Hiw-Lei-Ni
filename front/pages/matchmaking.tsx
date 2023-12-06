import Button from '@/components/common/Button';
import Layout from '@/components/common/Layout';
import DropdownForm from '@/components/form/DropdownForm';
import { PartySystemContext, PartySystemContextType } from '@/contexts/party';
import { WithAuthProps, get_auth, withAuth } from '@/utils/auth';
import { WithRouterProps } from 'next/dist/client/with-router';
import { withRouter } from 'next/router';
import React from 'react';

type MatchmakingState = {
  isInMatchmaking: boolean;
  radius: number;
  budget: string;
};

type MatchmakingProps = {} & WithRouterProps & WithAuthProps;

class Matchmaking extends React.Component<MatchmakingProps, MatchmakingState> {
  private formRef: React.RefObject<HTMLFormElement>;
  static contextType?: React.Context<PartySystemContextType> =
    PartySystemContext;
  private checkInterval?: NodeJS.Timeout;
  constructor(props: MatchmakingProps) {
    super(props);
    this.state = {
      isInMatchmaking: false,
      radius: 4,
      budget: 'low',
    };

    this.formRef = React.createRef();
  }

  join_matchmaking() {
    const { matchmaking, currentPartyInfo } = this
      .context as PartySystemContextType;
    if (!currentPartyInfo && this.state.isInMatchmaking) {
      matchmaking?.(this.state.radius, this.state.budget);
    }
  }

  async submit_form(e: React.SyntheticEvent) {
    e.preventDefault();
    const form = this.formRef.current;

    if (form) {
      const formData = new FormData(form);
      const partyData = {
        radius: formData.get('distance'),
        budget: formData.get('price'),
      };
      try {
        if (partyData.radius == '') {
          throw Error('Please fill in all fields');
        }
        if (partyData.budget == '') {
          partyData.budget = null;
        }

        this.setState({
          isInMatchmaking: true,
          radius: +(partyData.radius ?? '4'),
          budget: partyData.budget as string,
        });
      } catch (e: any) {
        alert(e.message);
      }
    }
  }

  componentDidMount(): void {
    this.checkInterval = setInterval(() => {
      this.join_matchmaking();
    }, 3000);
  }
  componentWillUnmount(): void {
    if (this.checkInterval) clearInterval(this.checkInterval);
  }

  render() {
    const { router } = this.props;
    const { isInMatchmaking } = this.state;
    const { currentPartyInfo } = this.context as PartySystemContextType;

    if (router.isReady) {
      if (currentPartyInfo) {
        setTimeout(() => {
          router.push('/currentparty');
        }, 1500);
      }
    }

    return (
      <Layout type="party">
        {currentPartyInfo ? (
          <>
            <div className="flex flex-col justify-center align-middle items-center content-center">
              <div className="w-full min-h-[90vh] flex flex-col justify-center items-center gap-12">
                <h1 className="text-2xl font-semibold">
                  Here comes the Party!
                </h1>
                <img src="/partyfound.png" className="w-48 h-48" />
              </div>
              <div className="absolute bottom-10 flex flex-col w-3/4 justify-center content-center gap-2"></div>
            </div>
          </>
        ) : !isInMatchmaking ? (
          <>
            <h1 className="text-3xl font-semibold pl-8 pt-24">Matchmaking</h1>
            <h2 className="text-2xl font-light text-light-gray pl-8 pt-2">
              Let’s go PARTY!
            </h2>
            <form
              ref={this.formRef}
              onSubmit={e => this.submit_form(e)}
              className="flex flex-col justify-center align-middle items-center content-center"
            >
              <div className="h-full pt-16 flex flex-col gap-4 w-3/4">
                <DropdownForm
                  text="Distance"
                  placeholder=""
                  required
                  name="distance"
                  options={[
                    { text: '4 km', value: '4' },
                    { text: '3 km', value: '3' },
                    { text: '2 km', value: '2' },
                    { text: '1 km', value: '1' },
                  ]}
                  data-test="distance"
                />
                <DropdownForm
                  text="Budget"
                  placeholder=""
                  required
                  name="price"
                  options={[
                    { text: 'Any budget', value: '' },
                    { text: '$', value: 'low' },
                    { text: '$$$', value: 'medium' },
                    { text: '$$$$$', value: 'high' },
                  ]}
                  data-test="budget"
                />
              </div>

              <div className="absolute bottom-10 flex flex-col w-3/4 justify-center content-center gap-2">
                <Button
                  text="Confirm"
                  primary
                  onClick={e => this.submit_form(e)}
                  data-test="confirm-btn"
                />
              </div>
            </form>
          </>
        ) : (
          <>
            <div className="flex flex-col justify-center align-middle items-center content-center">
              <div className="w-full min-h-[90vh] flex flex-col justify-center items-center gap-12">
                <h1 className="text-2xl font-semibold">Finding a Party. . .</h1>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-32 h-32 animate-spin"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99"
                  />
                </svg>
              </div>
              <div className="absolute bottom-10 flex flex-col w-3/4 justify-center content-center gap-2">
                <Button
                  text="Cancel Matchmaking"
                  danger
                  onClick={e => this.setState({ isInMatchmaking: false })}
                  data-test="cancel-btn"
                />
              </div>
            </div>
          </>
        )}
      </Layout>
    );
  }
}

export default withRouter(withAuth(Matchmaking));
