import { classNames } from '@/utils/style';
import React from 'react';

type MarkerProps = {
  lat: number;
  lng: number;
  onClick?: (lat: number, lng: number) => void;
  children?: React.ReactNode;
  classname?: string;
  hide?: boolean;
};

type HiwMarkerProps = MarkerProps & {
  active?: boolean;
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
 * @param {boolean} hide - Whether the marker is hidden or not
 * @param {boolean} active - Whether the marker is active or not
 */
export class HiwMarker extends React.Component<HiwMarkerProps> {
  render() {
    return (
      <Marker
        lat={this.props.lat}
        lng={this.props.lng}
        onClick={this.props.onClick}
        classname={this.props.classname}
        hide={this.props.hide}
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
