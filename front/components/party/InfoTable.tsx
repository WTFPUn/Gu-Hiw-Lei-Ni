import React from 'react';
import { RowItem, Table } from '../common/Table';

type InfoTableProps = {
  partyInfo: {
    location: string;
    description: string;
    distance: number;
    price: number;
    partySize: number;
    host: {
      img: string;
      name: string;
    };
    members: {
      img: string;
      name: string;
    }[];
  };
};

function Member(props: { img: string; name: string }) {
  return (
    <div className="flex gap-2 justify-center items-center">
      <img
        src={props.img}
        alt=""
        className="w-8 h-8 bg-slate-500 rounded-full"
      />
      <div className="text-sm font-medium">{props.name}</div>
    </div>
  );
}

class InfoTable extends React.Component<InfoTableProps> {
  render() {
    const { partyInfo } = this.props;

    const members = partyInfo.members.map(member => {
      return <Member {...member} />;
    });
    return (
      <Table>
        <RowItem name="Location">
          <span className=" underline text-red-600 cursor-pointer">
            {partyInfo.location}
          </span>
        </RowItem>
        <RowItem name="Description">{partyInfo.description}</RowItem>
        <RowItem name="Distance">{partyInfo.distance + ' km'}</RowItem>
        <RowItem name="Price">
          <img
            src={
              partyInfo.price == 1
                ? '/price1.svg'
                : partyInfo.price == 2
                ? '/price2.svg'
                : partyInfo.price == 3
                ? '/price3.svg'
                : ''
            }
            alt=""
            className="w-16 h-8"
          />
        </RowItem>
        <RowItem name="Party Size">{partyInfo.partySize}</RowItem>
        <RowItem name="Host">
          {
            <div className="flex">
              <Member {...partyInfo.host} />
            </div>
          }
        </RowItem>
        <RowItem name="Members">
          <div className="flex flex-wrap">{members}</div>
        </RowItem>
      </Table>
    );
  }
}

export default InfoTable;
