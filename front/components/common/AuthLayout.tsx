import React from 'react';
import { ArrowLongLeftIcon } from '@heroicons/react/24/solid';
import { withRouter } from 'next/router';
import { WithRouterProps } from 'next/dist/client/with-router';

// Learn more about layout components pattern at https://nextjs.org/docs/pages/building-your-application/routing/pages-and-layouts

interface AuthLayoutProps extends WithRouterProps {
  children: React.ReactNode;
}

/**
 *  Auth layout component
 *
 * @param {React.ReactNode} children - The content to display inside the layout
 *
 */

class AuthLayout extends React.Component<AuthLayoutProps> {
  render() {
    const router = this.props.router;

    return (
      <>
        <div
          className="absolute p-4 cursor-pointer"
          onClick={() => router.back()}
        >
          <ArrowLongLeftIcon className="h-8 w-8 text-primary" />
        </div>
        <main className="min-h-screen pt-28 bg-[#FAF5E4]">
          {this.props.children}
        </main>
      </>
    );
  }
}

export default withRouter(AuthLayout);
