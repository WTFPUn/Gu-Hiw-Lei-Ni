import AuthLayout from '@/components/common/AuthLayout';
import Button from '@/components/common/Button';
import TextForm from '@/components/form/TextForm';
import React from 'react';
import Link from 'next/link';
import { login } from '@/utils/auth';
import { withRouter } from 'next/router';
import { WithRouterProps } from '@/utils/router';

class Login extends React.Component<WithRouterProps, {}> {
  private formRef: React.RefObject<HTMLFormElement>;
  constructor(props: WithRouterProps) {
    super(props);
    this.formRef = React.createRef();
  }

  async submit_form(e: React.SyntheticEvent) {
    e.preventDefault();
    const form = this.formRef.current;
    if (form) {
      const formData = new FormData(form);
      const data = {
        user_name: formData.get('username'),
        password: formData.get('password'),
      };
      try {
        if (data.user_name === '' || data.password === '') {
          throw Error('Please fill in all fields');
        }
        const status = await login(
          data.user_name as string,
          data.password as string,
        );

        if (status == false) {
          throw Error('Invalid username or password');
        }
        this.props.router.push('/home');
      } catch (e: any) {
        alert(e.message);
      }
    }
  }

  render() {
    return (
      <AuthLayout>
        <h1 className="text-3xl font-semibold pl-8">Let’s sign you in.</h1>
        <h2 className="text-3xl font-light text-light-gray pl-8 pt-2">
          And find something to eat!
        </h2>
        <form
          ref={this.formRef}
          className="flex flex-col justify-center align-middle items-center content-center"
        >
          <div className="h-full pt-16 flex flex-col gap-4 w-3/4">
            <TextForm
              text="Username"
              placeholder="Enter Username"
              name="username"
            />
            <TextForm
              text="Password"
              placeholder="Enter Password"
              password
              name="password"
            />
          </div>

          <div className="absolute bottom-10 flex flex-col w-3/4 justify-center content-center gap-2">
            <div className="text-center font-normal">
              {'Don’t have an account?    '}
              <Link href="/register" className="font-semibold">
                Register
              </Link>
            </div>
            <Button
              text="Login"
              primary
              onClick={e => {
                this.submit_form(e);
              }}
            />
          </div>
        </form>
      </AuthLayout>
    );
  }
}

export default withRouter(Login);
