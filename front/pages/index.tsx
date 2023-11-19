import Button from '@/components/common/Button';
import React from 'react';
import { withRouter } from 'next/router';
import { WithRouterProps } from 'next/dist/client/with-router';
import Image from 'next/image';

class Landing extends React.Component<WithRouterProps, {}> {
  render() {
    const router = this.props.router;

    return (
      <main className="h-screen flex flex-col justify-center align-middle content-center items-center gap-16">
        {/* <div className=" w-32 h-32 rounded-full pt-32"></div> */}
        <Image alt="logo" src="/guhiw.png" width={128} height={128} />
        <div className="flex flex-col justify-center text-center gap-2">
          <h1 className="font-semibold text-2xl">Welcome to Gu-Hiw!</h1>
          <p className="font-xl text-light-gray">
            Find some friends to eat with you
          </p>
        </div>
        <div className="absolute pb-8 bottom-5 flex flex-col w-3/4 gap-4">
          <Button text="Login" primary onClick={() => router.push('/login')} />
          <Button text="Register" onClick={() => router.push('/register')} />
        </div>
      </main>
    );
  }
}

export default withRouter(Landing);
