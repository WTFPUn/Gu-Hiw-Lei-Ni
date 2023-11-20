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
import {
  calculateDistance,
  debounceApi,
  find_place_info,
  testLocations,
} from '@/utils/map';
import Link from 'next/link';
import TextForm from '@/components/form/TextForm';
import { PartySystemContext, PartySystemContextType } from '@/contexts/party';

type HomeState = {
  center: Coords | null;
  selectedMarker: Coords | null;
  zoom: number | null;
  showAll: boolean;
  maxDistance: number;
  placeInfo?: any;
  menu: 'selectparty' | 'createparty' | 'main';
};

type HomeProps = WithRouterProps & WithAuthProps;
class Home extends React.Component<HomeProps, HomeState> {
  private DistanceDropdownRef: DropdownForm | null = null;
  static contextType?: React.Context<PartySystemContextType> =
    PartySystemContext;

  constructor(props: HomeProps) {
    super(props);
    this.state = {
      center: {
        lat: 13.6513,
        lng: 100.4964,
      },
      zoom: 11,
      selectedMarker: null,
      showAll: false,
      maxDistance: 4,
      menu: 'main',
    };

    this.handle_click_marker = this.handle_click_marker.bind(this);
  }

  handle_show_search_location = () => {
    this.setState({
      showAll: !this.state.showAll,
    });
  };

  handle_click_marker = (lat: number, lng: number) => {
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
      menu: 'selectparty',
    });
  };

  handle_join_party = () => {};

  reset_selected_marker = () => {
    this.setState({
      selectedMarker: null,
      center: null,
      zoom: 15.9,
      menu: 'main',
    });
  };

  set_current_position = (mapPos: {
    zoom: number;
    center: { lat: number; lng: number };
  }) => {
    this.setState({
      ...mapPos,
    });
  };

  check_valid_create_location = () => {
    // reset to current location when over 4km
    // calculate distance from center screen to current location
    const { center, maxDistance } = this.state;
    const { currentLocation } = this.context as PartySystemContextType;
    if (!currentLocation || !center) return false;
    const distance = calculateDistance(currentLocation, center);
    console.log(distance);
    if (distance > maxDistance) {
      return false;
    }
    return true;
  };

  handle_select_create_location = async () => {
    const { currentLocation } = this.context as PartySystemContextType;
    if (this.state.menu != 'createparty') return;
    if (this.check_valid_create_location()) {
      const places = await find_place_info(this.state.center as any);
      console.log(places);
      this.setState({
        placeInfo: places?.[0],
      });
    } else {
      if (!currentLocation) return;
      this.setState({
        center: currentLocation,
      });
    }
  };
  // on map load
  handle_google_maps = (map: any, maps: any, ref: any) => {
    // maps.event.addListener(map, 'dragend', () => {
    //   this.handle_select_create_location();
    // });
    // maps.event.addListener(map, 'zoom_changed', () => {
    //   this.handle_select_create_location();
    // });
    maps.event.addListener(map, 'idle', () => {
      const zoom = map.getZoom();
      const centerObj = map.getCenter();

      const centerLat = centerObj.lat();
      const centerLng = centerObj.lng();
      const center = {
        lat: centerLat,
        lng: centerLng,
      };
      debounceApi(this.handle_select_create_location() as any, 5000);

      this.set_current_position({ zoom, center });
    });
    // console.log(this.state.zoom);
  };

  render() {
    const { router, auth_status, user } = this.props;
    const { selectedMarker, center, zoom, menu, maxDistance, placeInfo } =
      this.state;
    const isSelected = selectedMarker !== null;
    const partySystem = this.context as PartySystemContextType;

    const { currentLocation } = partySystem;

    const { w, h } = meters2ScreenPixels(
      maxDistance * 1000 * 2,
      currentLocation ?? { lat: 0.0, lng: 0.0 },
      zoom || 0,
    );

    console.log(partySystem);

    const DrawerPartyDiv = React.forwardRef<
      HTMLDivElement,
      DrawerContainerProps
    >((props, ref) => <DrawerContainer {...props} forwardRef={ref} />);
    const DrawerCreatePartyDiv = React.forwardRef<
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
                onClick={this.reset_selected_marker}
              />
            )}

            <GoogleMapReact
              bootstrapURLKeys={{
                key: process.env.NEXT_PUBLIC_GOOGLE_API_KEY || '',
              }}
              center={center || undefined}
              zoom={zoom || undefined}
              options={{
                zoomControlOptions: {
                  position: 0,
                },
                fullscreenControl: false,
              }}
              yesIWantToUseGoogleMapApiInternals
              onGoogleApiLoaded={({ map, maps, ref }) =>
                this.handle_google_maps(map, maps, ref)
              }
            >
              {currentLocation && (
                <Marker lat={currentLocation.lat} lng={currentLocation.lng}>
                  <div
                    style={{
                      width: w,
                      height: h,
                    }}
                    className="bg-[#F8B401] opacity-10 rounded-full shadow-2xl border-2 border-white translate-x-[-25%] translate-y-[-25%]"
                  />
                </Marker>
              )}
              {testLocations.map((location, index) => {
                return (
                  <HiwMarker
                    key={index + 'hiw'}
                    lat={location.lat}
                    lng={location.lng}
                    onClick={this.handle_click_marker}
                    active={
                      selectedMarker?.lat === location.lat &&
                      selectedMarker?.lng === location.lng
                    }
                  />
                );
              })}
              {currentLocation && (
                <Marker lat={currentLocation.lat} lng={currentLocation.lng}>
                  <div className="w-5 h-5 bg-blue-500 rounded-full shadow-2xl border-2 border-white translate-x-[-25%] translate-y-[-25%]" />
                </Marker>
              )}

              <Marker lat={center?.lat ?? 0} lng={center?.lng ?? 0}>
                {/* current center on map */}
              </Marker>
            </GoogleMapReact>
          </div>
          <div className="absolute left-1/2 top-1/2">
            {menu == 'createparty' && (
              <Marker lat={0} lng={0}>
                <div className="w-4 h-4 bg-red-500 rounded-full shadow-2xl border-2 border-white translate-x-[-25%] translate-y-[-25%]" />
              </Marker>
            )}
          </div>
          {/* Drawer */}
          <div className="fixed z-40 bottom-0 w-screen">
            {/* not auth */}
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

            {/* main menu */}
            {auth_status == true && menu == 'main' && (
              <DrawerContainer
                className={classNames(
                  'animation transition-transform transform ease-out pb-16 flex flex-col duration-200 ',
                  this.state.showAll && !selectedMarker
                    ? ''
                    : 'translate-y-[25vh]',
                )}
              >
                <div className="pb-4 flex justify-center gap-6">
                  {/* <IconButton img={'/magnifyingglass.png'} text="Matchmaking" /> */}
                  {
                    <IconButton
                      img={'/sushiroll.png'}
                      text="Current Party"
                      onClick={e => {
                        if (!partySystem?.currentPartyInfo) {
                          return alert('You are not in any party');
                        }
                        router.push('/currentparty');
                      }}
                    />
                  }
                  <IconButton
                    img={'/rice.png'}
                    text="Create Party"
                    onClick={e => {
                      if (partySystem?.currentPartyInfo)
                        return alert('You are already in a party');
                      if (!currentLocation)
                        return alert(
                          'Please enable location permission to be able to create party.',
                        );
                      this.setState({
                        center: {
                          lat: currentLocation?.lat ?? 0,
                          lng: currentLocation?.lng ?? 0,
                        },
                        zoom: 16,
                        menu: 'createparty',
                      });
                      this.setState({ menu: 'createparty' });
                      console.log(this.state);
                    }}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <DropdownForm
                    text="Distance"
                    options={[
                      { value: '4', text: '4 km' },
                      { value: '3', text: '3 km' },
                      { value: '2', text: '2 km' },
                      { value: '1', text: '1 km' },
                      { value: '0.5', text: '0.5 km' },
                    ]}
                    ref={(ref: DropdownForm) =>
                      (this.DistanceDropdownRef = ref)
                    }
                    onChange={e => {
                      this.setState({
                        maxDistance: Number(e.target.value),
                      });
                    }}
                  />
                  <div className="flex justify-between text-xs">
                    <span>Found: 3 Party</span>
                    <a
                      onClick={this.handle_show_search_location}
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
            {/* Create Party */}
            {menu == 'createparty' && (
              <Transition
                show={menu == 'createparty'}
                enter="transition duration-200 ease-out "
                enterFrom="transform translate-y-full "
                enterTo="transform translate-y-0"
                leave="transition duration-200 ease-out"
                leaveFrom="transform translate-y-0"
                leaveTo="transform translate-y-full"
                as={React.Fragment}
              >
                <DrawerCreatePartyDiv className="h-[38vh]">
                  <div className="pt-2 w-full flex flex-col gap-3">
                    <div className=" cursor-pointer">
                      <TextForm
                        text="Location"
                        value={
                          placeInfo?.formatted_address ??
                          'Move the map to update location'
                        }
                      />
                    </div>
                    {this.check_valid_create_location() && placeInfo ? (
                      <Button
                        text="Create Party"
                        primary
                        onClick={() => {
                          router.push(
                            `/createparty?lat=${center?.lat}&lng=${
                              center?.lng
                            }&place_id=${
                              placeInfo.place_id
                            }&address=${encodeURIComponent(
                              placeInfo.formatted_address,
                            )}`,
                          );
                        }}
                      />
                    ) : (
                      <Button
                        text={'Please select location within 4km'}
                        danger
                        onClick={() => {}}
                      />
                    )}

                    <Button
                      text="Back"
                      danger
                      onClick={() => this.setState({ menu: 'main' })}
                    />
                  </div>
                </DrawerCreatePartyDiv>
              </Transition>
            )}
            {/* Location Detail */}
            {menu == 'selectparty' && (
              <Transition
                show={isSelected && menu == 'selectparty'}
                enter="transition duration-200 ease-out "
                enterFrom="transform translate-y-full "
                enterTo="transform translate-y-0"
                leave="transition duration-200 ease-out"
                leaveFrom="transform translate-y-0"
                leaveTo="transform translate-y-full"
                as={React.Fragment}
              >
                <DrawerPartyDiv>
                  {menu == 'selectparty' && (
                    <div className="absolute transform w-20 h-20 p-2 bg-cream left-1/2 -translate-y-3/4 -translate-x-1/2  rounded-full">
                      <img
                        src="/meat.png"
                        className="rounded-full border border-yellow"
                      />
                    </div>
                  )}
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
                </DrawerPartyDiv>
              </Transition>
            )}
          </div>
        </div>
      </Layout>
    );
  }
}

export default withRouter(withAuth(Home));
