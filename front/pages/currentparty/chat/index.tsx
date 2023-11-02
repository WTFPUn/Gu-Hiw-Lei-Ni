import Button from '@/components/common/Button';
import Layout from '@/components/common/Layout';
import InfoTable from '@/components/party/InfoTable';
import { WithRouterProps } from 'next/dist/client/with-router';
import { withRouter } from 'next/router';
import React from 'react';

class PartyDetail extends React.Component<WithRouterProps> {
  render() {
    const { router } = this.props;

    return (
      <Layout type="chat">
        <div className="flex flex-col p-4 shadow-xl px-10 rounded-t-2xl fixed bottom-0 left-0 sm:left-[12.5%] md:left-[20%] w-screen sm:w-[75vw] md:w-[60vw]"></div>
      </Layout>
    );
  }
}

export default withRouter(PartyDetail);
