import React from 'react';
import Layout from '@/components/common/Layout';

import GoogleMapReact, { Coords, meters2ScreenPixels } from 'google-map-react';
import { Transition } from '@headlessui/react';
import { HiwMarker, Marker } from '@/components/maps/marker';
import { classNames } from '@/utils/style';
import DropdownForm from '@/components/form/DropdownForm';
import Button from '@/components/common/Button';
import InfoTable from '@/components/party/InfoTable';
import { withRouter } from 'next/router';
import { WithRouterProps } from '@/utils/router';
import { WithAuthProps, withAuth } from '@/utils/auth';
import DrawerContainer, {
  DrawerContainerProps,
} from '@/components/common/DrawerContainer';
import IconButton from '@/components/common/IconButton';
import PartyList, { PartyItem } from '@/components/party/PartyList';
import { testLocations } from '@/utils/map';
import Link from 'next/link';

type HomeState = {
  center: Coords | null;
  selectedMarker: Coords | null;
  currentLocation: Coords | null;
  zoom: number | null;
  showAll: boolean;
};

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
      showAll: false,
    };

    this.handleMarkerClick = this.handleMarkerClick.bind(this);
  }

  handleShowAll = () => {
    this.setState({
      showAll: !this.state.showAll,
    });
  };

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

  handleGoogleMapsApi = (map: any, maps: any, ref: any) => {
    const setZoom = (zoom: number) => {
      this.setState({
        zoom,
      });
    };
    maps.event.addListener(map, 'zoom_changed', () => {
      const zoom = map.getZoom();
      // console.log(zoom);
      setZoom(zoom);
    });
    // console.log(this.state.zoom);
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
    const { router, auth_status, user } = this.props;

    const { w, h } = meters2ScreenPixels(
      2000,
      this.state.currentLocation ?? { lat: 0.0, lng: 0.0 },
      this.state.zoom || 0,
    );

    const DrawerContainerDiv = React.forwardRef<
      HTMLDivElement,
      DrawerContainerProps
    >((props, ref) => <DrawerContainer {...props} forwardRef={ref} />);
    return (
      <Layout>
        <div className="w-screen h-screen overflow-hidden overflow-x-hidden">
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
                  position: 0,
                },
                fullscreenControl: false,
              }}
              yesIWantToUseGoogleMapApiInternals
              onGoogleApiLoaded={({ map, maps, ref }) =>
                this.handleGoogleMapsApi(map, maps, ref)
              }
            >
              {this.state.currentLocation && (
                <Marker
                  lat={this.state.currentLocation.lat}
                  lng={this.state.currentLocation.lng}
                >
                  <div
                    style={{
                      width: w,
                      height: h,
                    }}
                    className="bg-[#F8B401] opacity-20 rounded-full shadow-2xl border-2 border-white translate-x-[-25%] translate-y-[-25%]"
                  />
                </Marker>
              )}
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
                  <div className="w-5 h-5 bg-blue-500 rounded-full shadow-2xl border-2 border-white translate-x-[-25%] translate-y-[-25%]" />
                </Marker>
              )}
            </GoogleMapReact>
          </div>

          {/* Drawer */}
          <div className="fixed z-40 bottom-0 w-screen">
            {/* Distance Form */}
            {this.props.auth_status == false && (
              <DrawerContainer className="animation transition-transform transform ease-out pb-16 pt-8 flex flex-col duration-200">
                <div className="text-center font-normal">
                  {'Don’t have an account?    '}
                  <Link href="/register" className="font-semibold">
                    Register
                  </Link>
                </div>
                <Button
                  text="Login"
                  primary
                  onClick={e => {
                    this.props.router.push('/login');
                  }}
                />
              </DrawerContainer>
            )}
            {this.props.auth_status == true && (
              <DrawerContainer
                className={classNames(
                  'animation transition-transform transform ease-out pb-16 flex flex-col duration-200 ',
                  this.state.showAll && !this.state.selectedMarker
                    ? ''
                    : 'translate-y-[25vh]',
                )}
              >
                <div className="pb-4 flex justify-center gap-6">
                  <IconButton img={'/magnifyingglass.png'} text="Matchmaking" />
                  <IconButton
                    img={'/sushiroll.png'}
                    text="Current Party"
                    onClick={e => router.push('/currentparty')}
                  />
                  <IconButton
                    img={'/rice.png'}
                    text="Create Party"
                    onClick={e => router.push('/createparty')}
                  />
                </div>
                <div className="flex flex-col gap-1">
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
                  <div className="flex justify-between text-xs">
                    <span>Found: 3 Party</span>
                    <a
                      onClick={this.handleShowAll}
                      className="text-red-500 underline"
                      href="#"
                    >
                      Show All
                    </a>
                  </div>

                  <div
                    className={classNames(
                      'h-[25vh] transition-opacity duration-200 ease-out',
                      this.state.showAll ? '' : 'opacity-0',
                    )}
                  >
                    <PartyList>
                      <PartyItem name="Test Party" distance={0.2} />
                      <PartyItem name="Test Party" distance={0.2} />
                      <PartyItem name="Test Party" distance={0.2} />
                      <PartyItem name="Test Party" distance={0.2} />
                      <PartyItem name="Test Party" distance={0.2} />
                      <PartyItem name="Test Party" distance={0.2} />
                      <PartyItem name="Test Party" distance={0.2} />
                      <PartyItem name="Test Party" distance={0.2} />
                    </PartyList>
                  </div>
                </div>
              </DrawerContainer>
            )}

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
              <DrawerContainerDiv className="h-[55vh]">
                <div className="absolute transform w-20 h-20 p-2 bg-cream left-1/2 -translate-y-3/4 -translate-x-1/2  rounded-full">
                  <img
                    src="/meat.png"
                    className="rounded-full border border-yellow"
                  />
                </div>
                <div className="h-full flex flex-col overflow-y-auto container containerscroll">
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
              </DrawerContainerDiv>
            </Transition>
          </div>
        </div>
      </Layout>
    );
  }
}

export default withRouter(withAuth(Home));
