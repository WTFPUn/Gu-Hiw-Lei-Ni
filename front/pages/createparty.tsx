import Button from '@/components/common/Button';
import Layout from '@/components/common/Layout';
import TextForm from '@/components/form/TextForm';
import InfoTable from '@/components/party/InfoTable';
import { WithRouterProps } from 'next/dist/client/with-router';
import { withRouter } from 'next/router';
import React from 'react';

class PartyDetail extends React.Component<WithRouterProps> {
  render() {
    const { router } = this.props;

    return (
      <Layout type="party">
        <h1 className="text-3xl font-semibold pl-8 pt-24">Create Party</h1>
        <h2 className="text-2xl font-light text-light-gray pl-8 pt-2">
          And find someone to eat with!
        </h2>
        <form className="flex flex-col justify-center align-middle items-center content-center">
          <div className="h-full pt-16 flex flex-col gap-4 w-3/4">
            <TextForm
              text="Party Name"
              placeholder="Enter name"
              required
              name="firstName"
            />
            <TextForm
              text="Party Description"
              placeholder="Enter description"
              required
              name="lastName"
            />
            <TextForm
              text="Price"
              placeholder="Enter Password"
              required
              password
              name="password"
            />
            <TextForm
              text="Party Size"
              placeholder="Enter Password"
              required
              password
              name="confirmPassword"
            />
          </div>

          <div className="py-24 flex flex-col w-3/4 justify-center content-center gap-2">
            <div className="text-center font-normal">
              {'Already have an account?   '}
            </div>
            <Button text="Sign up" primary />
          </div>
        </form>
      </Layout>
    );
  }
}

export default withRouter(PartyDetail);
