import React from 'react';
import Layout from '@/components/common/Layout';
import TextForm from '@/components/form/TextForm';

export default class Profile extends React.Component<{}, {}> {
  render() {
    return (
      <Layout>
        <TextForm text="Test" placeholder="Test" />
        Profile
      </Layout>
    );
  }
}
