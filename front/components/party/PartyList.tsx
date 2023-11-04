import { classNames } from '@/utils/style';
import React from 'react';
type PartyListProps = {
  children?: React.ReactNode;
  className?: string;
};

type PartyItemProps = {
  name: string;
  distance: number;
  onClick?: () => void;
};

export function PartyItem(props: PartyItemProps) {
  return (
    <div
      onClick={props.onClick}
      className={
        'flex justify-between border-b-2 border-secondary py-3 text-dark-gray cursor-pointer'
      }
    >
      <span className="font-medium">{props.name}</span>
      <span className="font-normal text-xs">{props.distance + ' km.'}</span>
    </div>
  );
}

export default class PartyList extends React.Component<PartyListProps> {
  constructor(props: PartyListProps) {
    super(props);
  }
  render() {
    return (
      <div
        className={classNames(
          'border-2 border-secondary bg-transparent rounded-r-xl rounded-xl px-4 py-1 mt-2 h-full overflow-y-auto',
          this.props.className ?? '',
        )}
      >
        {this.props.children}
      </div>
    );
  }
}
