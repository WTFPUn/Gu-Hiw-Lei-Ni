import React from 'react';
import Layout from '@/components/common/Layout';

import GoogleMapReact, { Coords, meters2ScreenPixels } from 'google-map-react';
import { Transition } from '@headlessui/react';
import { ClusterMarker, HiwMarker, Marker } from '@/components/maps/marker';
import { classNames } from '@/utils/style';
import DropdownForm from '@/components/form/DropdownForm';
import Button from '@/components/common/Button';
import InfoTable from '@/components/party/InfoTable';
import { withRouter } from 'next/router';
import { WithRouterProps } from '@/utils/router';
import { WithAuthProps, get_auth, withAuth } from '@/utils/auth';
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
  selectedMarker: (Coords & { party_id: string }) | null;
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
    (this.context as PartySystemContextType)?.join_party?.(
      'ac269390-6421-4dee-9e20-dc8fc3bdb12a',
    );
  };

  handle_click_marker = (lat: number, lng: number, partyId: string) => {
    const { query_party } = this.context as PartySystemContextType;
    query_party?.(partyId);
    this.setState({
      selectedMarker: {
        lat,
        lng,
        party_id: partyId,
      },
      center: {
        lat,
        lng,
      },
      zoom: 16,
      menu: 'selectparty',
    });
  };

  handle_set_distance = (distance: number) => {
    const { set_nearby_radius } = this.context as PartySystemContextType;
    const radius = +distance;
    set_nearby_radius?.(radius);
  };

  handle_matchmaking_icon = () => {
    this.props.router.push('/matchmaking');
  };

  handle_current_party_icon = () => {
    const { currentPartyInfo } = this.context as PartySystemContextType;
    if (currentPartyInfo)
      this.handle_click_marker(
        currentPartyInfo?.lat,
        currentPartyInfo?.lng,
        currentPartyInfo?.id,
      );
  };

  handle_create_party_icon = () => {
    const { currentLocation } = this.context as PartySystemContextType;
    if (currentLocation) {
      this.setState({
        center: {
          lat: currentLocation?.lat ?? 0,
          lng: currentLocation?.lng ?? 0,
        },
        zoom: 16,
        menu: 'createparty',
      });
    }
  };
  handle_join_party = () => {
    const partySystem = this.context as PartySystemContextType;
    partySystem.join_party?.(this.state.selectedMarker?.party_id as string);
  };
  handle_leave_party = () => {
    const partySystem = this.context as PartySystemContextType;
    partySystem.leave_party?.();
    this.reset_selected_marker();
  };

  reset_selected_marker = () => {
    const { clear_query_party } = this.context as PartySystemContextType;
    clear_query_party?.();
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

  verify_location_permission = (func: (...args: any[]) => any) => {
    return (e: any) => {
      const { currentLocation } = this.context as PartySystemContextType;
      if (!currentLocation) {
        alert('Please enable location permission to use this feature.');
        return;
      }
      func(e);
    };
  };

  verify_party = (func: (...args: any[]) => any, options?: { not: true }) => {
    return (e: any) => {
      const { currentPartyInfo } = this.context as PartySystemContextType;
      if (!options?.not && !currentPartyInfo) {
        alert('You are not in a party.');
        return;
      } else if (options?.not && currentPartyInfo) {
        alert('You are already in a party.');
        return;
      }
      func(e);
    };
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

  // on map load, add listener to update current position for react state
  handle_google_maps = (map: any, maps: any, ref: any) => {
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
  };

  componentDidMount() {
    const { set_nearby_radius: setNearbyRadius } = this
      .context as PartySystemContextType;

    setNearbyRadius?.(this.state.maxDistance);
  }

  render() {
    const { router, auth_status, user } = this.props;
    const { selectedMarker, center, zoom, menu, maxDistance, placeInfo } =
      this.state;
    const isSelected = selectedMarker !== null;
    const partySystem = this.context as PartySystemContextType;

    const { currentLocation, currentPartyInfo, queryPartyInfo, nearbyCluster } =
      partySystem;

    const { w, h } = meters2ScreenPixels(
      maxDistance * 1000 * 2,
      currentLocation ?? { lat: 0.0, lng: 0.0 },
      zoom || 0,
    );

    console.log(zoom);

    const DrawerPartyDiv = React.forwardRef<
      HTMLDivElement,
      DrawerContainerProps
    >((props, ref) => <DrawerContainer {...props} forwardRef={ref} />);
    const DrawerCreatePartyDiv = React.forwardRef<
      HTMLDivElement,
      DrawerContainerProps
    >((props, ref) => <DrawerContainer {...props} forwardRef={ref} />);

    const partyItem = (nearbyCluster ?? []).map((cluster, clusterIndex) =>
      cluster.parties.map((location, index) => (
        <PartyItem
          key={index + 'hiwcluster' + clusterIndex}
          name={location.party_name}
          distance={calculateDistance(
            currentLocation ?? {
              lat: location.lat,
              lng: location.lng,
            },
            {
              lat: location.lat,
              lng: location.lng,
            },
          )}
          onClick={() =>
            this.handle_click_marker(location.lat, location.lng, location.id)
          }
        />
      )),
    );

    const partyCluster = (nearbyCluster ?? []).map((cluster, clusterIndex) => {
      if (
        this.state?.zoom != null &&
        this.state.zoom <= 14 &&
        cluster.parties.length > 1
      )
        return (
          <ClusterMarker
            lat={testLocations[0].lat}
            lng={testLocations[0].lng}
            partiesSize={cluster.parties.length}
          />
        );
      return cluster.parties.map((location, index) => {
        return (
          <HiwMarker
            key={index + 'hiwcluster' + clusterIndex}
            lat={location.lat}
            lng={location.lng}
            onClick={this.handle_click_marker}
            partyId={location.id}
            data-test={'hiw-' + index}
            active={
              selectedMarker?.lat === location.lat &&
              selectedMarker?.lng === location.lng
            }
          />
        );
      });
    });

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
                <Marker
                  data-test="current-location-area"
                  lat={currentLocation.lat}
                  lng={currentLocation.lng}
                >
                  <div
                    style={{
                      width: w,
                      height: h,
                    }}
                    className="bg-[#F8B401] opacity-10 rounded-full shadow-2xl border-2 border-white translate-x-[-25%] translate-y-[-25%]"
                  />
                </Marker>
              )}

              {currentLocation && (
                <Marker
                  data-test="current-location-marker"
                  lat={currentLocation.lat}
                  lng={currentLocation.lng}
                >
                  <div className="w-5 h-5 bg-blue-500 rounded-full shadow-2xl border-2 border-white translate-x-[-25%] translate-y-[-25%]" />
                </Marker>
              )}

              {currentPartyInfo && (
                <HiwMarker
                  lat={currentPartyInfo?.lat}
                  lng={currentPartyInfo?.lng}
                  onClick={this.handle_click_marker}
                  partyId={currentPartyInfo?.id}
                  data-test="hiw-current-party"
                  active={
                    selectedMarker?.lat === currentPartyInfo?.lat &&
                    selectedMarker?.lng === currentPartyInfo?.lng
                  }
                />
              )}
              {partyCluster}
            </GoogleMapReact>
          </div>
          <div className="absolute left-1/2 top-1/2">
            {menu == 'createparty' && (
              <Marker data-test="create-marker" lat={0} lng={0}>
                <div className="w-4 h-4 bg-red-500 rounded-full shadow-2xl border-2 border-white translate-x-[-25%] translate-y-[-25%]" />
              </Marker>
            )}
          </div>
          {/* Drawer */}
          <div
            className="fixed z-40 bottom-0 w-screen"
            data-test="drawer-holder"
          >
            {/* not auth */}
            {this.props.auth_status == false && (
              <DrawerContainer
                data-test="no-auth-drawer"
                className="animation transition-transform transform ease-out pb-16 pt-8 flex flex-col duration-200"
              >
                <div className="text-center font-normal">
                  {'Don’t have an account?    '}
                  <Link
                    href="/register"
                    data-test="register-link"
                    className="font-semibold"
                  >
                    Register
                  </Link>
                </div>
                <Button
                  text="Login"
                  primary
                  data-test="login-btn"
                  onClick={e => {
                    this.props.router.push('/login');
                  }}
                />
              </DrawerContainer>
            )}

            {/* main menu */}
            {auth_status == true && menu == 'main' && (
              <DrawerContainer
                data-test="main-drawer"
                className={classNames(
                  'animation transition-transform transform ease-out pb-16 flex flex-col duration-200 ',
                  this.state.showAll && !selectedMarker
                    ? ''
                    : 'translate-y-[25vh]',
                )}
              >
                <div className="pb-4 flex justify-center gap-6">
                  <IconButton
                    img={
                      currentPartyInfo
                        ? '/magnifyingbw.png'
                        : '/magnifyingglass.png'
                    }
                    text="Matchmaking"
                    data-test="match-making"
                    onClick={this.verify_location_permission(
                      this.verify_party(
                        e => {
                          this.handle_matchmaking_icon();
                        },
                        { not: true },
                      ),
                    )}
                  />
                  {
                    <IconButton
                      img={currentPartyInfo ? '/sushi.png' : '/bwsushi.png'}
                      text="Current Party"
                      data-test="current-party-btn"
                      onClick={this.verify_party(e => {
                        this.handle_current_party_icon();
                      })}
                    />
                  }
                  <IconButton
                    img={
                      currentLocation && !currentPartyInfo
                        ? '/rice.png'
                        : '/bwrice.png'
                    }
                    text="Create Party"
                    data-test="create-party-btn"
                    onClick={this.verify_location_permission(
                      this.verify_party(
                        e => {
                          this.handle_create_party_icon();
                        },
                        { not: true },
                      ),
                    )}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <DropdownForm
                    data-test="distance-dropdown"
                    text="Distance"
                    options={[
                      { value: '4', text: '4 km' },
                      { value: '3', text: '3 km' },
                      { value: '2', text: '2 km' },
                      { value: '1', text: '1 km' },
                    ]}
                    ref={(ref: DropdownForm) =>
                      (this.DistanceDropdownRef = ref)
                    }
                    onChange={e => {
                      this.setState({
                        maxDistance: Number(e.target.value),
                      });
                      this.handle_set_distance(Number(e.target.value));
                    }}
                  />
                  <div
                    className="flex justify-between text-xs"
                    data-test="query-result"
                  >
                    <span data-test="query-result-text">
                      Found: {partyItem?.length ?? 0} Party
                    </span>
                    <a
                      onClick={this.handle_show_search_location}
                      className="text-red-500 underline"
                      href="#"
                      data-test="query-result-show-all"
                    >
                      Show All
                    </a>
                  </div>

                  <div
                    className={classNames(
                      'h-[25vh] transition-opacity duration-200 ease-out',
                      this.state.showAll ? '' : 'opacity-0',
                    )}
                    data-test="party-list-holder"
                  >
                    <PartyList>{partyItem}</PartyList>
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
                <DrawerCreatePartyDiv
                  data-test="create-party-drawer"
                  className="h-[38vh]"
                >
                  <div className="pt-2 w-full flex flex-col gap-3">
                    <div
                      className="cursor-pointer"
                      data-test="location-text-holder"
                    >
                      <TextForm
                        data-test="location-text"
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
                        data-test="create-party-location-btn"
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
                        data-test="disabled-create-party-location-btn"
                        onClick={() => {}}
                      />
                    )}

                    <Button
                      text="Back"
                      danger
                      data-test="back-btn"
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
                  {queryPartyInfo ? (
                    <>
                      <div className="absolute transform w-20 h-20 p-2 bg-cream left-1/2 -translate-y-3/4 -translate-x-1/2  rounded-full">
                        <img
                          src={queryPartyInfo?.image ?? '/meat.png'}
                          className="rounded-full border w-full h-full border-yellow bg-cover"
                          data-test="party-img"
                        />
                      </div>
                      <div className="h-full flex flex-col overflow-y-auto container containerscroll">
                        <div className="flex flex-col justify-center items-center pt-6 pb-2 ">
                          <div
                            className="text-2xl font-semibold"
                            data-test="party-name"
                          >
                            {queryPartyInfo?.party_name}
                          </div>
                          {queryPartyInfo?.created_timestamp && (
                            <div
                              className="text-md text-light-gray"
                              data-test="party-timestamp"
                            >
                              {new Date(
                                queryPartyInfo?.created_timestamp,
                              ).toLocaleString()}
                            </div>
                          )}
                        </div>
                        <div className="h-full">
                          <hr className="text-primary font-medium" />
                          <InfoTable
                            partyInfo={
                              {
                                distance: partySystem?.currentLocation
                                  ? calculateDistance(
                                      partySystem?.currentLocation,
                                      {
                                        lat: queryPartyInfo?.lat as number,
                                        lng: queryPartyInfo?.lng as number,
                                      },
                                    ).toFixed(2)
                                  : undefined,
                                ...queryPartyInfo,
                                members: null,
                              } as any
                            }
                          />

                          <div className="pb-4 pt-4 w-full flex flex-col gap-2">
                            {/* not in party */}
                            {!currentPartyInfo &&
                              queryPartyInfo?.status == 'not_started' &&
                              currentLocation && (
                                <Button
                                  text="Join"
                                  primary
                                  onClick={this.handle_join_party}
                                  data-test="join-btn"
                                />
                              )}
                            {/* current party buttons */}
                            {currentPartyInfo?.id ===
                              selectedMarker?.party_id && (
                              <>
                                <Button
                                  text="More Information"
                                  onClick={() => router.push('/currentparty')}
                                  primary
                                  data-test="more-info-btn"
                                />
                                {/* if not host, user can leave */}
                                {currentPartyInfo?.host?.user_id !=
                                  get_auth().user?.user_id && (
                                  <Button
                                    text="Leave"
                                    danger
                                    onClick={this.handle_leave_party}
                                    data-test="leave-btn"
                                  />
                                )}
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div
                        className="text-center font-medium pt-2"
                        data-test="loading-info-party"
                      >
                        Loading
                      </div>
                    </>
                  )}
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
