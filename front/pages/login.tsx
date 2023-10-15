import AuthLayout from '@/components/common/AuthLayout';
import Button from '@/components/common/Button';
import TextForm from '@/components/form/TextForm';
import React from 'react';
import Link from 'next/link';

export default class Login extends React.Component<{}, {}> {
  render() {
    return (
      <AuthLayout>
        <h1 className="text-3xl font-semibold pl-8">Let’s sign you in.</h1>
        <h2 className="text-3xl font-light text-gray pl-8 pt-2">
          And find something to eat!
        </h2>
        <form className="flex flex-col justify-center align-middle items-center content-center">
          <div className="h-full pt-16 flex flex-col gap-4 w-3/4">
            <TextForm text="Username" placeholder="Enter Username" />
            <TextForm text="Password" placeholder="Enter Password" password />
          </div>

          <div className="absolute bottom-16 flex flex-col w-3/4 justify-center content-center gap-2">
            <div className="text-center font-normal">
              {'Don’t have an account?    '}
              <Link href="/register" className="font-semibold">
                Register
              </Link>
            </div>
            <Button text="Login" primary />
          </div>
        </form>
      </AuthLayout>
    );
  }
}
