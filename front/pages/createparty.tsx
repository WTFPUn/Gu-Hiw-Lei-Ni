import Button from '@/components/common/Button';
import Layout from '@/components/common/Layout';
import DropdownForm from '@/components/form/DropdownForm';
import TextForm from '@/components/form/TextForm';
import InfoTable from '@/components/party/InfoTable';
import {
  CreatePartyData,
  PartyInfo,
  PartySystemContext,
  PartySystemContextType,
} from '@/contexts/party';
import { get_auth } from '@/utils/auth';
import { calculateDistance } from '@/utils/map';
import { Coords } from 'google-map-react';
import { WithRouterProps } from 'next/dist/client/with-router';
import { withRouter } from 'next/router';
import React from 'react';

type CreatePartyState = {
  submitted: boolean;
};

type CreatePartyProps = {} & WithRouterProps;

class CreateParty extends React.Component<CreatePartyProps, CreatePartyState> {
  private formRef: React.RefObject<HTMLFormElement>;
  static contextType?: React.Context<PartySystemContextType> =
    PartySystemContext;
  private checkInterval?: NodeJS.Timeout;
  constructor(props: WithRouterProps) {
    super(props);
    this.state = {
      submitted: false,
    };
    this.formRef = React.createRef();
  }

  async submitForm(e: React.SyntheticEvent) {
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
        if (
          partyData.party_name == '' ||
          partyData.description == '' ||
          partyData.location == '' ||
          partyData.budget == '' ||
          partyData.size == ''
        ) {
          throw Error('Please fill in all fields');
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
          let done = false;

          this.checkInterval = setInterval(
            partySystem => {
              console.log('still checking result');

              partySystem.fetch_current_party?.();
              if (partySystem.currentPartyInfo) {
                attempts = 11; // to prevent it from being cleared again
                done = true;
                this.setState({ submitted: false });
                this.props.router.push('/currentparty');
                return;
              } else if (
                attempts >= MAXATTEMPTS &&
                !partySystem.currentPartyInfo &&
                done == false
              ) {
                clearInterval(this.checkInterval);
                // alert('Failed to create party');
                this.setState({ submitted: false });
                return;
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
      if (partySystem.currentPartyInfo) {
        router.push('/currentparty');
      }
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
          onSubmit={e => this.submitForm(e)}
          className="flex flex-col justify-center align-middle items-center content-center"
        >
          <div className="h-full pt-16 flex flex-col gap-4 w-3/4">
            <TextForm
              text="Location"
              name="location"
              value={address as string}
            />
            <TextForm
              text="Party Name"
              placeholder="Enter name"
              required
              name="partyname"
            />
            <TextForm
              text="Description"
              placeholder="Enter short description"
              required
              name="party description"
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
            />
            <TextForm
              text="Party Size"
              placeholder="Enter number of people (including you)"
              min={'2'}
              max={'64'}
              number
              required
              name="partysize"
            />
          </div>

          <div className="py-24 flex flex-col w-3/4 justify-center content-center gap-2">
            {!this.state.submitted ? (
              <Button
                text="Create Party"
                primary
                onClick={e => this.submitForm(e)}
              />
            ) : (
              <Button text="Please Wait" onClick={e => {}} />
            )}
          </div>
        </form>
      </Layout>
    );
  }
}

export default withRouter(CreateParty);
