import React from 'react';
import { classNames } from '@/utils/style';

export type DrawerContainerProps = {
  children?: React.ReactNode;
  className?: string;
  'data-test'?: string;
  forwardRef?: React.ForwardedRef<HTMLDivElement>;
};

/**
 * A reusable drawer container component that is used for map drawer.
 * @param {React.ReactNode} children - The body of the drawer.
 * @param {string} className - The class name of the drawer.
 * @param {React.ForwardedRef<HTMLDivElement>} forwardRef - The ref of the drawer.
 */
export default class DrawerContainer extends React.Component<DrawerContainerProps> {
  constructor(props: DrawerContainerProps) {
    super(props);
  }

  render() {
    const { forwardRef } = this.props; // prevent confusion with React.Component's ref

    return (
      <div
        className={classNames(
          'p-4 shadow-xl px-10 bg-cream rounded-t-2xl fixed bottom-0 left-0 sm:left-[12.5%] md:left-[20%] w-screen sm:w-[75vw] md:w-[60vw]',
          this.props.className ?? '',
        )}
        data-test={this.props['data-test']}
        ref={forwardRef}
      >
        {this.props.children}
      </div>
    );
  }
}
