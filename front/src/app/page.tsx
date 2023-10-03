/* eslint-disable react/react-in-jsx-scope */

import TestCls from './test_cls';

export default function home() {
  return (
    <div>
      <TestCls name="test" age={20} />
    </div>
  );
}
