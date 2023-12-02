import { PartyInfo } from '@/contexts/party';
import { classNames } from '@/utils/style';
import { Coords } from 'google-map-react';
import React from 'react';

type MarkerProps = {
  lat: number;
  lng: number;
  onClick?: (lat: number, lng: number) => void;
  children?: React.ReactNode;
  classname?: string;
  hide?: boolean;
  'data-test'?: string;
  id?: string;
};

type HiwMarkerProps = {
  lat: number;
  lng: number;
  onClick?: (lat: number, lng: number, partyId: string) => void;
  active?: boolean;
  partyId: string;
  classname?: string;
  children?: React.ReactNode;
  'data-test'?: string;
  hide?: boolean;
};

type ClusterMarkerProps = {
  lat: number;
  lng: number;
  onClick?: (lat: number, lng: number) => void;
  clusterMarker?: boolean;
  partiesSize?: number;
  classname?: string;
  children?: React.ReactNode;
  'data-test'?: string;
  hide?: boolean;
};

/**
 * Marker component
 *
 * @param {number} lat - Latitude of the marker
 * @param {number} lng - Longitude of the marker
 * @param {() => void} onClick - Function to call when the marker is clicked
 * @param {React.ReactNode} children - The content to display inside the marker
 * @param {string} classname - Classname to apply to the marker
 * @param {boolean} hide - Whether the marker is hidden or not
 */
export class Marker extends React.Component<MarkerProps> {
  render() {
    if (this.props.hide) {
      return <></>;
    }

    return (
      <div
        className={classNames(
          this.props.onClick ? 'cursor-pointer' : '',
          this.props?.classname || '',
        )}
        onClick={() =>
          this.props.onClick &&
          this.props.onClick(this.props.lat, this.props.lng)
        }
        data-test={this.props['data-test']}
      >
        <div className="absolute -translate-x-1/4 -translate-y-1/4">
          {this.props.children}
        </div>
      </div>
    );
  }
}

/**
 * HiwMarker component
 *
 * @param {number} lat - Latitude of the marker
 * @param {number} lng - Longitude of the marker
 * @param {() => void} onClick - Function to call when the marker is clicked
 * @param {React.ReactNode} children - The content to display inside the marker
 * @param {string} classname - Classname to apply to the marker
 * @param {string} partyId - The party id
 * @param {boolean} hide - Whether the marker is hidden or not
 * @param {boolean} active - Whether the marker is active or not
 */
export class HiwMarker extends React.Component<HiwMarkerProps> {
  render() {
    return (
      <Marker
        lat={this.props.lat}
        lng={this.props.lng}
        onClick={(lat, lng) =>
          this.props.onClick?.(lat, lng, this.props.partyId)
        }
        classname={this.props.classname}
        hide={this.props.hide}
        data-test={this.props['data-test']}
      >
        {this.props.active ? (
          <img src="/meat.png" width={32} height={32} />
        ) : (
          <img src="/marker.png" width={32} height={32} />
        )}
        {this.props.children}
      </Marker>
    );
  }
}

export class ClusterMarker extends React.Component<ClusterMarkerProps> {
  render() {
    return (
      <Marker
        lat={this.props.lat}
        lng={this.props.lng}
        onClick={(lat, lng) => this.props.onClick?.(lat, lng)}
        classname={this.props.classname}
        hide={this.props.hide}
        data-test={this.props['data-test']}
      >
        <div className="">
          <img src="/cluster.svg" className="" width={32} height={32} />
          <div className="text-white text-center w-5 font-bold absolute top-1/4 left-0 translate-x-1/4 ">
            {this.props?.partiesSize ?? ''}
          </div>
        </div>
      </Marker>
    );
  }
}
