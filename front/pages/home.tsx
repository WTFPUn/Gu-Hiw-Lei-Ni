import React from 'react';
import Layout from '@/components/common/Layout';
import TextForm from '@/components/form/TextForm';
import GoogleMapReact from 'google-map-react';
import { Disclosure, Transition } from '@headlessui/react';
import { HiwMarker, Marker } from '@/components/maps/marker';
import { classNames } from '@/utils/style';
import DropdownForm from '@/components/form/DropdownForm';
import Button from '@/components/common/Button';
import InfoTable from '@/components/party/InfoTable';
import { withRouter } from 'next/router';
import { WithRouterProps } from '@/utils/router';
import { WithAuthProps, withAuth } from '@/utils/auth';

type Coords = {
  lat: number;
  lng: number;
};

type HomeState = {
  center: Coords | null;
  selectedMarker: Coords | null;
  currentLocation: Coords | null;
  zoom: number | null;
};

const testLocations = [
  {
    lat: 13.7379,
    lng: 100.5604,
  },
  {
    lat: 13.6513,
    lng: 100.4964,
  },
];

type HomeProps = WithRouterProps & WithAuthProps;
class Home extends React.Component<HomeProps, HomeState> {
  private updateInterval: NodeJS.Timeout | null = null;
  constructor(props: HomeProps) {
    super(props);
    this.state = {
      center: {
        lat: 13.6513,
        lng: 100.4964,
      },
      currentLocation: null,
      zoom: 11,
      selectedMarker: null,
    };

    this.handleMarkerClick = this.handleMarkerClick.bind(this);
  }

  handleMarkerClick = (lat: number, lng: number) => {
    this.setState({
      selectedMarker: {
        lat,
        lng,
      },
      center: {
        lat,
        lng,
      },
      zoom: 16,
    });
  };

  resetMarker = () => {
    this.setState({
      selectedMarker: null,
      center: null,
      zoom: 15.9,
    });
  };

  updateCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        position => {
          this.setState({
            currentLocation: {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            },
          });
        },
        console.log,
        { enableHighAccuracy: true },
      );
    }
  };

  componentDidMount(): void {
    if (navigator.geolocation) {
      console.log('Geolocation is supported!');

      navigator.geolocation.getCurrentPosition(
        position => {
          console.log(position.coords);
          this.updateInterval = setTimeout(this.updateCurrentLocation, 10000);

          this.setState({
            center: {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            },
            zoom: 15.9,
            currentLocation: {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            },
          });
        },
        console.log,
        { enableHighAccuracy: true },
      );
    }
  }

  componentWillUnmount(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
    }
  }

  render() {
    const isSelected = this.state.selectedMarker !== null;
    const { router } = this.props;

    return (
      <Layout>
        <div className="w-screen h-screen overflow-hidden">
          <div
            className={classNames(
              'w-full overflow-hidden transform transition-all duration-500 translate-y',
              isSelected ? 'h-[150vh] -translate-y-1/3' : 'h-full',
            )}
          >
            {isSelected && (
              <div
                className="absolute w-screen h-screen bg-transparent z-30"
                onClick={this.resetMarker}
              />
            )}

            <GoogleMapReact
              bootstrapURLKeys={{
                key: process.env.NEXT_PUBLIC_GOOGLE_API_KEY || '',
              }}
              center={this.state.center || undefined}
              zoom={this.state.zoom || undefined}
              options={{
                zoomControlOptions: {
                  position: 3,
                },
                fullscreenControl: false,
              }}
            >
              {testLocations.map((location, index) => {
                return (
                  <HiwMarker
                    key={index + 'hiw'}
                    lat={location.lat}
                    lng={location.lng}
                    onClick={this.handleMarkerClick}
                    active={
                      this.state.selectedMarker?.lat === location.lat &&
                      this.state.selectedMarker?.lng === location.lng
                    }
                  />
                );
              })}
              {this.state.currentLocation && (
                <Marker
                  lat={this.state.currentLocation.lat}
                  lng={this.state.currentLocation.lng}
                >
                  <div className="w-5 h-5 bg-blue-500 rounded-full shadow-2xl border-2 border-white" />
                </Marker>
              )}
            </GoogleMapReact>
          </div>

          <div className="fixed z-40 bottom-0 w-screen">
            {/* Distance Form */}
            <div className="p-4 shadow-xl px-10 pb-16 bg-cream rounded-t-2xl fixed bottom-0 left-0 sm:left-[12.5%] md:left-[20%] w-screen sm:w-[75vw] md:w-[60vw]">
              <DropdownForm
                text="Distance"
                options={[
                  { value: '1', text: '1 km' },
                  { value: '2', text: '2 km' },
                  { value: '3', text: '3 km' },
                  { value: '4', text: '4 km' },
                  { value: '5', text: '5 km' },
                ]}
              />
            </div>

            {/* Location Detail */}
            <Transition
              show={isSelected}
              enter="transition duration-200 ease-out "
              enterFrom="transform translate-y-full "
              enterTo="transform translate-y-0"
              leave="transition duration-200 ease-out"
              leaveFrom="transform translate-y-0"
              leaveTo="transform translate-y-full"
              as={React.Fragment}
            >
              <div className="p-4 shadow-xl h-1/2 px-10  bg-cream rounded-t-2xl fixed bottom-0 left-0 sm:left-[12.5%] md:left-[20%] w-screen sm:w-[75vw] md:w-[60vw] ">
                <div className="absolute transform w-20 h-20 p-2 bg-cream left-1/2 -translate-y-3/4 -translate-x-1/2  rounded-full">
                  <img
                    src="/meat.png"
                    className="rounded-full border border-yellow"
                  />
                </div>
                <div className="h-full flex flex-col overflow-y-auto container">
                  <div className="flex flex-col justify-center items-center pt-6 pb-2 ">
                    <div className="text-2xl font-semibold">Hiw</div>
                    <div className="text-lg text-light-gray">Hiw</div>
                  </div>
                  <div className="h-full">
                    <hr className="text-primary font-medium" />
                    <InfoTable
                      partyInfo={{
                        location: 'location',
                        description: 'description',
                        distance: 1,
                        price: 1,
                        partySize: 1,
                        host: {
                          img: 'img',
                          name: 'name',
                        },
                        members: [
                          {
                            img: 'img',
                            name: 'name',
                          },
                        ],
                      }}
                    />

                    <div className="pt-8 w-full flex flex-col">
                      <Button
                        text="Join"
                        primary
                        onClick={() => router.push('/party/1')}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </Transition>
          </div>
        </div>
      </Layout>
    );
  }
}

export default withRouter(withAuth(Home));
