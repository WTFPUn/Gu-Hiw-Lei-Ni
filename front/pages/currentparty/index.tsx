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
                partyInfo={{
                  location: 'location',
                  description: 'description',
                  distance: 1,
                  price: 1,
                  partySize: 1,
                  host: {
                    img: 'img',
                    name: 'name',
                  },
                  members: [
                    {
                      img: 'img',
                      name: 'name',
                    },
                  ],
                }}
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
