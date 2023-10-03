import React from 'react';

type TestProps = {
  name: string;
  age: number;
};

type TestState = {
  count: number;
};

class TestCls extends React.Component<TestProps, TestState> {
  render() {
    return (
      <div>
        <h1>Test</h1>
      </div>
    );
  }
}

export default TestCls;
