import Navbar from '@/components/common/Navbar';
import React from 'react';
import AuthLayout from './AuthLayout';
import Head from 'next/head';

// Learn more about layout components pattern at https://nextjs.org/docs/pages/building-your-application/routing/pages-and-layouts

type LayoutProps = {
  type?: 'auth' | 'normal' | 'chat' | 'party' | 'map';
  children?: React.ReactNode;
  title?: string;
};

/**
 *  Main layout component
 *
 * @param {React.ReactNode} children - The content to display inside the layout
 *
 */

class Layout extends React.Component<LayoutProps> {
  constructor(props: LayoutProps) {
    super(props);
  }
  render() {
    if (this.props.type == 'auth') {
      return <AuthLayout>{this.props.children}</AuthLayout>;
    }

    return (
      <>
        <Navbar type={this.props.type} title={this.props.title} />
        <main className="min-h-[100dvh] min-w-screen overflow-x-hidden overflow-hidden bg-cream text-dark-gray">
          {this.props.children}
        </main>
      </>
    );
  }
}

export default Layout;
