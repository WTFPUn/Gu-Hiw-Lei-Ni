import React from 'react';
import { RowItem, Table } from '../common/Table';
import { PartyInfo } from '@/contexts/party';

type InfoTableProps = {
  partyInfo: PartyInfo;
};

function Member(props: {
  img?: string;
  first_name: string;
  last_name: string;
}) {
  return (
    <div className="flex gap-2 items-center">
      <img
        src={props.img ?? '/meat.png'}
        alt=""
        className="w-8 h-8 bg-slate-500 rounded-full"
      />
      <div className="text-sm font-medium">
        {props.first_name + ' ' + props.last_name}
      </div>
    </div>
  );
}

class InfoTable extends React.Component<InfoTableProps> {
  render() {
    const { partyInfo } = this.props;

    const members = Object.values(partyInfo.members ?? {}).map?.(member => {
      return (
        <>
          <Member {...member} /> <br />
        </>
      );
    });
    return (
      <Table>
        <RowItem name="Location">
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
              partyInfo?.location || '',
            )}&query_place_id=${partyInfo.place_id}`}
            target="_blank"
            className=" underline text-red-600 cursor-pointer"
          >
            {partyInfo.location}
          </a>
        </RowItem>
        <RowItem name="Description">{partyInfo.description}</RowItem>
        {partyInfo?.distance != undefined && (
          <RowItem name="Distance">{partyInfo.distance + ' km'}</RowItem>
        )}
        <RowItem name="Price">
          <img
            src={
              partyInfo.budget == 'low'
                ? '/price1.svg'
                : partyInfo.budget == 'medium'
                ? '/price2.svg'
                : partyInfo.budget == 'high'
                ? '/price3.svg'
                : ''
            }
            alt=""
            className="w-16 h-8"
          />
        </RowItem>
        <RowItem name="Party Size">{partyInfo.size}</RowItem>
        <RowItem name="Host">
          {
            <div className="flex">
              {partyInfo.host ? <Member {...partyInfo.host} /> : <></>}
            </div>
          }
        </RowItem>
        {members && (
          <RowItem name="Members">
            <div className="flex flex-wrap flex-col">{members}</div>
          </RowItem>
        )}
      </Table>
    );
  }
}

export default InfoTable;
