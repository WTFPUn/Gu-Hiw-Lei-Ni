import Image from 'next/image';
import { Inter } from 'next/font/google';
import React from 'react';
import Layout from '@/components/common/Layout';

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
  return <Layout>test</Layout>;
}
