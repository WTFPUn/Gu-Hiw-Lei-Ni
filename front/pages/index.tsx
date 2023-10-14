import Image from 'next/image';
import { Inter } from 'next/font/google';
import React from 'react';

const inter = Inter({ subsets: ['latin'] });

class TestCls extends React.Component<'', ''> {
  render() {
    return (
      <div>
        <h1>Test</h1>
      </div>
    );
  }
}

export default function Home() {
  return (
    <main
      className={`flex min-h-screen flex-col items-center justify-between p-24 ${inter.className}`}
    ></main>
  );
}
