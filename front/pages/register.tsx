import AuthLayout from '@/components/common/AuthLayout';
import Button from '@/components/common/Button';
import TextForm from '@/components/form/TextForm';
import React from 'react';
import Link from 'next/link';
import ImageUploadForm from '@/components/form/ImageUploadForm';

export default class Register extends React.Component<{}, {}> {
  render() {
    return (
      <AuthLayout>
        <h1 className="text-3xl font-semibold pl-8">Let’s sign you in.</h1>
        <h2 className="text-3xl font-light text-gray pl-8 pt-2">
          And find something to eat!
        </h2>
        <form className="flex flex-col justify-center align-middle items-center content-center">
          <div className="h-full pt-16 flex flex-col gap-4 w-3/4">
            <div className="flex justify-center">
              <ImageUploadForm imageUrl="/user.svg" />
            </div>
            <TextForm
              text="First name"
              placeholder="Enter first name"
              required
            />
            <TextForm text="Last name" placeholder="Enter Last name" required />
            <TextForm text="Username" placeholder="Enter Username" required />
            <TextForm
              text="Password"
              placeholder="Enter Password"
              required
              password
            />
          </div>

          <div className="py-24 flex flex-col w-3/4 justify-center content-center gap-2">
            <div className="text-center font-normal">
              {'Already have an account?   '}
              <Link href="/login" className="font-semibold">
                Login
              </Link>
            </div>
            <Button text="Sign up" primary />
          </div>
        </form>
      </AuthLayout>
    );
  }
}
