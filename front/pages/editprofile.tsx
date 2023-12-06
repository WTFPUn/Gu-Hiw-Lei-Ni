import Button from '@/components/common/Button';
import Layout from '@/components/common/Layout';
import DropdownForm from '@/components/form/DropdownForm';
import ImageUploadForm from '@/components/form/ImageUploadForm';
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

type EditProfileState = {
  submitted: boolean;
};

type EditProfileProps = {} & WithRouterProps & WithAuthProps;

class EditProfile extends React.Component<EditProfileProps, EditProfileState> {
  private formRef: React.RefObject<HTMLFormElement>;
  constructor(props: EditProfileProps) {
    super(props);
    this.state = {
      submitted: false,
    };
    this.formRef = React.createRef();
  }

  async submit_form(e: React.SyntheticEvent) {
    e.preventDefault();
    const form = this.formRef.current;
    const { user } = get_auth();

    if (form) {
      const formData = new FormData(form);
      const data = {
        first_name: formData.get('firstName'),
        last_name: formData.get('lastName'),
        confirm_password: formData.get('confirmPassword'),
      };
      try {
        for (let fieldValue of Object.values(data)) {
          if (fieldValue == '') {
            throw Error('Please fill in all fields');
          }
        }

        if (
          data.first_name == user?.first_name &&
          data.last_name == user?.last_name
        ) {
          throw Error('Please change make changes to your profile');
        } else if (data.first_name == user?.first_name) {
          data.first_name = null;
        } else if (data.last_name == user?.last_name) {
          data.last_name = null;
        }

        const res = await fetch(
          process.env.NEXT_PUBLIC_API_URL + '/profile/editprofile',
          {
            method: 'POST',
            body: JSON.stringify({
              data,
              token: localStorage.getItem('token') ?? '',
            }),
            headers: {
              'Content-Type': 'application/json',
            },
          },
        );
        if (!res.ok) {
          const text = await res.text();
          throw Error('Cannot create edit profile: ' + text);
        } else {
          alert('Profile edited successfully, please login again');
          localStorage.removeItem('token');
          this.props.router.push('/login');
        }
      } catch (e: any) {
        alert(e.message);
      }
    }
  }

  render() {
    const { router } = this.props;

    if (router.isReady) {
      if (!get_auth().auth_status) router.push('/login');
    }

    return (
      <Layout type="party">
        <h1 className="text-3xl font-semibold pl-8 pt-24">Profile</h1>
        <h2 className="text-2xl font-light text-light-gray pl-8 pt-2"></h2>
        <form
          ref={this.formRef}
          onSubmit={e => this.submit_form(e)}
          className="flex flex-col justify-center align-middle items-center content-center"
        >
          <div className="h-full pt-16 flex flex-col gap-4 w-3/4">
            <div className="flex justify-center">
              <ImageUploadForm imageUrl="/user.svg" />
            </div>
            <TextForm
              text="First name"
              placeholder="Enter first name"
              required
              name="firstName"
              data-test="first-name"
              defaultValue={get_auth()?.user?.first_name ?? ''}
            />
            <TextForm
              text="Last name"
              placeholder="Enter Last name"
              required
              name="lastName"
              data-test="last-name"
              defaultValue={get_auth()?.user?.last_name ?? ''}
            />
            <TextForm
              text="Username"
              placeholder="Enter Username"
              required
              name="username"
              data-test="username"
              disabled={true}
              value={get_auth()?.user?.user_name ?? ''}
            />
            <TextForm
              text="Confirm Password"
              placeholder="Enter Password"
              required
              password
              name="confirmPassword"
              data-test="confirm-password"
            />
          </div>

          <div className="py-24 flex flex-col w-3/4 justify-center content-center gap-2">
            <Button
              text="Edit"
              primary
              onClick={e => this.submit_form(e)}
              data-test="edit-profile-btn"
            />
          </div>
        </form>
      </Layout>
    );
  }
}

export default withRouter(withAuth(EditProfile));
