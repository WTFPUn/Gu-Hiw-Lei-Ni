import Navbar from '@/components/common/Navbar';
import React from 'react';

// Learn more about layout components pattern at https://nextjs.org/docs/pages/building-your-application/routing/pages-and-layouts

/**
 *  Main layout component
 *
 * @param {React.ReactNode} children - The content to display inside the layout
 * @todo fetch { Session } session - User session object from the server to pass to the navbar
 */

class Layout extends React.Component<{ children: React.ReactNode }> {
  render() {
    return (
      <>
        <Navbar />
        <main className="min-h-screen pt-16 bg-[#FAF5E4]">
          {this.props.children}
        </main>
      </>
    );
  }
}

export default Layout;
