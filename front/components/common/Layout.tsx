import Navbar from '@/components/common/Navbar';
import React from 'react';

// Learn more about layout components pattern at https://nextjs.org/docs/pages/building-your-application/routing/pages-and-layouts

/**
 *  Main layout component
 *
 * @param {React.ReactNode} children - The content to display inside the layout
 */

class Layout extends React.Component<{ children: React.ReactNode }> {
  render() {
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-[#FAF5E4]">{this.props.children}</main>
      </>
    );
  }
}

export default Layout;
