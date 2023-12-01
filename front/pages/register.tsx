import AuthLayout from '@/components/common/AuthLayout';
import Button from '@/components/common/Button';
import TextForm from '@/components/form/TextForm';
import React from 'react';
import Link from 'next/link';
import ImageUploadForm from '@/components/form/ImageUploadForm';
import { withRouter } from 'next/router';
import { WithRouterProps } from '@/utils/router';

type RegisterProps = {} & WithRouterProps;

class Register extends React.Component<RegisterProps, {}> {
  private formRef: React.RefObject<HTMLFormElement>;
  constructor(props: RegisterProps) {
    super(props);
    this.formRef = React.createRef();
  }

  async submit_form(e: React.SyntheticEvent) {
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
        for (let fieldValue of Object.values(data)) {
          if (fieldValue == '') {
            throw Error('Please fill in all fields');
          }
        }
        if ((data.password as string)?.length < 8) {
          throw Error('Password must be at least 8 characters');
        }
        if (data.password !== data.confirm_password) {
          throw Error('Password does not match');
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
        this.props.router.push('/login');
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
          onSubmit={e => this.submit_form(e)}
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
            />
            <TextForm
              text="Last name"
              placeholder="Enter Last name"
              required
              name="lastName"
              data-test="last-name"
            />
            <TextForm
              text="Username"
              placeholder="Enter Username"
              required
              name="username"
              data-test="username"
            />
            <TextForm
              text="Password"
              placeholder="Enter Password"
              required
              password
              name="password"
              data-test="password"
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
            <div className="text-center font-normal">
              {'Already have an account?   '}
              <Link
                href="/login"
                data-test="login-page-btn"
                className="font-semibold"
              >
                Login
              </Link>
            </div>
            <Button
              text="Sign up"
              primary
              onClick={e => {
                this.submit_form(e);
              }}
              data-test="register-btn"
            />
          </div>
        </form>
      </AuthLayout>
    );
  }
}

export default withRouter(Register);
