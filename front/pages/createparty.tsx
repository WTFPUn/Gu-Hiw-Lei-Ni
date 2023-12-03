import Button from '@/components/common/Button';
import Layout from '@/components/common/Layout';
import DropdownForm from '@/components/form/DropdownForm';
import TextForm from '@/components/form/TextForm';
import InfoTable from '@/components/party/InfoTable';
import {
  PartyInfo,
  PartySystemContext,
  PartySystemContextType,
} from '@/contexts/party';
import { WithAuthProps, get_auth, withAuth } from '@/utils/auth';
import { calculateDistance } from '@/utils/map';
import { Coords } from 'google-map-react';
import { WithRouterProps } from 'next/dist/client/with-router';
import { withRouter } from 'next/router';
import React from 'react';

type CreatePartyState = {
  submitted: boolean;
};

type CreatePartyProps = {} & WithRouterProps & WithAuthProps;

class CreateParty extends React.Component<CreatePartyProps, CreatePartyState> {
  private formRef: React.RefObject<HTMLFormElement>;
  static contextType?: React.Context<PartySystemContextType> =
    PartySystemContext;
  private checkInterval?: NodeJS.Timeout;
  constructor(props: CreatePartyProps) {
    super(props);
    this.state = {
      submitted: false,
    };
    this.formRef = React.createRef();
  }

  async submit_form(e: React.SyntheticEvent) {
    e.preventDefault();
    const form = this.formRef.current;
    if (!this.check_valid_create_location()) {
      alert('You are too far away from the location');
      return;
    }

    if (form && this.check_valid_create_location() && !this.state.submitted) {
      const formData = new FormData(form);
      const partyData = {
        party_name: formData.get('partyname'),
        description: formData.get('party description'),
        location: formData.get('location'),
        host_id: get_auth()?.user?.user_id,
        budget: formData.get('price'),
        size: formData.get('partysize'),
        place_id: this.props.router.query.place_id as string,
        lat: +(this.props.router.query.lat as string),
        lng: +(this.props.router.query.lng as string),
      };
      try {
        for (let fieldValue of Object.values(partyData)) {
          if (fieldValue == '') {
            throw Error('Please fill in all fields');
          }
        }
        if (
          partyData?.size &&
          !(+partyData?.size >= 2 && +partyData?.size <= 64)
        ) {
          throw Error('Party size must be between 2 and 64');
        }
        if (!confirm('Are you sure you want to create this party?')) return;
        this.setState({ submitted: true });
        const partySystem = this.context as PartySystemContextType;
        if (partySystem.send_msg && partySystem.fetch_current_party) {
          console.log('sending create party');
          partySystem?.create_party?.(partyData as unknown as PartyInfo);

          // Verifying if create party successfully
          const MAXATTEMPTS = 3;
          let attempts = 0;

          this.checkInterval = setInterval(
            partySystem => {
              console.log('still checking result');

              if (partySystem.currentPartyInfo) {
                attempts = 11; // to prevent it from being cleared again
                this.setState({ submitted: false });
                this.props.router.push('/currentparty');
                return;
              } else if (
                attempts >= MAXATTEMPTS &&
                !partySystem.currentPartyInfo
              ) {
                this.setState({ submitted: false });
                return;
              } else if (
                attempts < MAXATTEMPTS &&
                !partySystem.currentPartyInfo
              ) {
                partySystem.fetch_current_party?.();
                clearInterval(this.checkInterval);
              }
              attempts++;
            },
            2000,
            partySystem,
          );
        }
      } catch (e: any) {
        alert(e.message);
      }
    }
  }

  check_valid_create_location = () => {
    const { lat, lng } = this.props.router.query;
    const { currentLocation } = this.context as PartySystemContextType;
    if (!currentLocation || !lat || !lng) return false;
    const distance = calculateDistance(currentLocation, {
      lat: +lat,
      lng: +lng,
    });
    console.log(distance);
    if (distance > 4) {
      return false;
    }
    return true;
  };

  render() {
    const { router } = this.props;
    const { lat, lng, place_id, address } = router.query;

    const partySystem = this.context as PartySystemContextType;

    if (router.isReady) {
      if (!lat || !lng || !place_id || !address) router.push('/home');
      else if (partySystem.currentPartyInfo) {
        router.push('/currentparty');
      } else if (!get_auth().auth_status) router.push('/login');
    }

    console.log(router.query);
    return (
      <Layout type="party">
        <h1 className="text-3xl font-semibold pl-8 pt-24">Create Party</h1>
        <h2 className="text-2xl font-light text-light-gray pl-8 pt-2">
          And find someone to eat with!
        </h2>
        <form
          ref={this.formRef}
          onSubmit={e => this.submit_form(e)}
          className="flex flex-col justify-center align-middle items-center content-center"
        >
          <div className="h-full pt-16 flex flex-col gap-4 w-3/4">
            <TextForm
              text="Location"
              name="location"
              value={address as string}
              data-test="location"
            />
            <TextForm
              text="Party Name"
              placeholder="Enter name"
              required
              name="partyname"
              data-test="party-name"
            />
            <TextForm
              text="Description"
              placeholder="Enter short description"
              required
              name="party description"
              data-test="party-description"
            />
            <DropdownForm
              text="Budget"
              placeholder=""
              required
              name="price"
              options={[
                { text: '$', value: 'low' },
                { text: '$$$', value: 'medium' },
                { text: '$$$$$', value: 'high' },
              ]}
              data-test="budget"
            />
            <TextForm
              text="Party Size"
              placeholder="Enter number of people (including you)"
              min={'2'}
              max={'64'}
              number
              required
              name="partysize"
              data-test="party-size"
            />
          </div>

          <div className="py-24 flex flex-col w-3/4 justify-center content-center gap-2">
            {!this.state.submitted ? (
              <Button
                text="Create Party"
                primary
                onClick={e => this.submit_form(e)}
                data-test="create-party-btn"
              />
            ) : (
              <Button
                text="Please Wait"
                onClick={e => {}}
                data-test="wait-party-btn"
              />
            )}
          </div>
        </form>
      </Layout>
    );
  }
}

export default withRouter(withAuth(CreateParty));
