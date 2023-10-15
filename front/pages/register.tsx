import AuthLayout from '@/components/common/AuthLayout';
import Button from '@/components/common/Button';
import TextForm from '@/components/form/TextForm';
import React from 'react';
import Link from 'next/link';
import ImageUploadForm from '@/components/form/ImageUploadForm';

export default class Register extends React.Component<{}, {}> {
  private formRef: React.RefObject<HTMLFormElement>;
  constructor(props: {}) {
    super(props);
    this.formRef = React.createRef();
  }

  async submitForm(e: React.SyntheticEvent) {
    e.preventDefault();
    const form = this.formRef.current;
    if (form) {
      const formData = new FormData(form);
      const data = {
        first_name: formData.get('firstName'),
        last_name: formData.get('lastName'),
        user_name: formData.get('username'),
        password: formData.get('password'),
        confirm_password: formData.get('confirmPassword'),
      };
      try {
        if (data.password !== data.confirm_password) {
          throw Error('Password does not match');
        }
        if (
          data.first_name === '' ||
          data.last_name === '' ||
          data.user_name === '' ||
          data.password === '' ||
          data.confirm_password === ''
        ) {
          throw Error('Please fill in all fields');
        }
        const res = await fetch(
          process.env.NEXT_PUBLIC_API_URL + '/auth/register',
          {
            method: 'POST',
            body: JSON.stringify(data),
            headers: {
              'Content-Type': 'application/json',
            },
          },
        );
        if (!res.ok) {
          const text = await res.text();
          throw Error('Cannot create new user: ' + text);
        }
        console.log(res);
      } catch (e: any) {
        alert(e.message);
      }

      console.log(data);
    }
  }

  render() {
    return (
      <AuthLayout>
        <h1 className="text-3xl font-semibold pl-8">Register</h1>
        <form
          ref={this.formRef}
          className="flex flex-col justify-center align-middle items-center content-center"
          onSubmit={e => this.submitForm(e)}
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
            />
            <TextForm
              text="Last name"
              placeholder="Enter Last name"
              required
              name="lastName"
            />
            <TextForm
              text="Username"
              placeholder="Enter Username"
              required
              name="username"
            />
            <TextForm
              text="Password"
              placeholder="Enter Password"
              required
              password
              name="password"
            />
            <TextForm
              text="Confirm Password"
              placeholder="Enter Password"
              required
              password
              name="confirmPassword"
            />
          </div>

          <div className="py-24 flex flex-col w-3/4 justify-center content-center gap-2">
            <div className="text-center font-normal">
              {'Already have an account?   '}
              <Link href="/login" className="font-semibold">
                Login
              </Link>
            </div>
            <Button
              text="Sign up"
              primary
              onClick={e => {
                this.submitForm(e);
              }}
            />
          </div>
        </form>
      </AuthLayout>
    );
  }
}
