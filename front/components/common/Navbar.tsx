import { Disclosure, Transition } from '@headlessui/react';
import { Bars3BottomLeftIcon } from '@heroicons/react/24/outline';
import { ArrowLongLeftIcon } from '@heroicons/react/24/solid';
import Link from 'next/link';
import React from 'react';
import Button from './Button';
import { withRouter } from 'next/router';
import { WithRouterProps } from '@/utils/router';
import { WithAuthProps, logout, withAuth } from '@/utils/auth';
import { classNames } from '@/utils/style';
import { type } from 'os';

type NavigationItem = {
  name: string;
  href: string;
  onClick?: () => void;
  active?: boolean;
};

const navigation: NavigationItem[] = [{ name: 'Home', href: '/home' }];

type NavbarProps = {
  type?: 'normal' | 'chat' | 'party' | 'map';
  title?: string;
} & WithAuthProps &
  WithRouterProps;

/**
 * Navbar component
 * @param {string} type - The type of the navbar. (normal, chat, party)
 *
 */
class Navbar extends React.Component<NavbarProps> {
  constructor(props: NavbarProps) {
    super(props);
  }
  render() {
    const navigationItem = navigation.map(item => {
      item.active = this.props.router.pathname.includes(item.href);
      return (
        <Link href={item.href} className="w-full ">
          <Disclosure.Button
            key={item.name}
            as="a"
            href="#"
            className={classNames(
              'block rounded-l-2xl px-3 py-4 text-base font-medium text-right pr-5 max-w-[95%] ml-auto',
              item?.active ? 'bg-primary text-white' : '',
            )}
          >
            {item.name}
          </Disclosure.Button>
        </Link>
      );
    });

    return (
      <Disclosure as="nav" className="fixed w-[100%] z-50">
        {({ open }) => (
          <>
            <Transition
              enter="transition duration-100 ease-out"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="transition duration-100 ease-out"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
              className="z-50"
            >
              <Disclosure.Panel className=" h-screen w-screen absolute bg-black opacity-60">
                <Disclosure.Button as="div" className="w-screen h-screen" />
              </Disclosure.Panel>
            </Transition>
            <Transition
              enter="transition duration-100 ease-out"
              enterFrom="transform translate-x-full opacity-0"
              enterTo="transform translate-x-0 opacity-100"
              leave="transition duration-100 ease-out"
              leaveFrom="transform translate-x-0 opacity-100"
              leaveTo="transform translate-x-full opacity-0"
              className="z-100"
            >
              <Disclosure.Panel className="h-screen right-0 bg-transparent absolute z-50">
                <div className="pb-3 h-full w-[75vw] md:w-[50vw] lg:w-[30vw] bg-cream relative inset-y-0 right-0 z-[100]">
                  <div className="relative p-3 pr-3 flex justify-start">
                    <Disclosure.Button
                      as="div"
                      className="relative cursor-pointer inline-flex items-center justify-center rounded-md p-2 text-black"
                    >
                      {
                        <Bars3BottomLeftIcon
                          className="block h-6 w-6"
                          aria-hidden="true"
                        />
                      }
                    </Disclosure.Button>
                  </div>
                  <div className="flex flex-col ">{navigationItem}</div>
                  <div className="flex flex-col h-[75%] px-4 justify-end pb-16">
                    {this.props.auth_status ? (
                      <Button
                        text="Log out"
                        onClick={() => {
                          logout();
                          this.props.router.push('/').then(() => {
                            this.props.router.reload();
                          });
                        }}
                        danger
                      />
                    ) : (
                      <Button
                        text="Log in"
                        onClick={() => {
                          this.props.router.push('/login');
                        }}
                        primary
                      />
                    )}
                  </div>
                </div>
              </Disclosure.Panel>
            </Transition>
            {
              <div
                className={
                  this.props.type == 'chat'
                    ? 'bg-[#F8B401CC]'
                    : 'bg-transparent'
                }
              >
                <div className="mx-auto  px-2  ">
                  <div
                    className={classNames(
                      'flex h-16 items-center justify-between',
                      open ? 'z-[-1]' : '',
                    )}
                  >
                    <div className="flex flex-1 items-center justify-start ">
                      {/* Left */}
                      {(this.props.type == 'party' ||
                        this.props.type == 'chat') && (
                        <div
                          className="absolute p-4 cursor-pointer"
                          onClick={() => {
                            if (this.props.type == 'chat')
                              this.props.router.back();
                            else this.props.router.push('/home');
                          }}
                        >
                          <ArrowLongLeftIcon className="h-8 w-8 text-primary" />
                        </div>
                      )}
                      {this.props.type == 'chat' && (
                        <div className="p-4 pl-16">
                          {this.props.title} insert title here
                        </div>
                      )}
                    </div>
                    {!open && (
                      <div className="absolute inset-y-0 right-0 flex items-center pr-2 ">
                        {/* Right */}
                        {this.props.type == 'party' ||
                        this.props.type == 'chat' ? (
                          <Disclosure.Button className="relative inline-flex items-center justify-center rounded-md p-1.5 text-black ">
                            <span className="absolute -inset-0.5" />
                            <Bars3BottomLeftIcon className="block h-6 w-6" />
                          </Disclosure.Button>
                        ) : (
                          <Disclosure.Button className="relative inline-flex items-center justify-center rounded-md p-1.5 text-black bg-cream shadow-sm">
                            <span className="absolute -inset-0.5" />
                            <Bars3BottomLeftIcon className="block h-6 w-6" />
                          </Disclosure.Button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            }
          </>
        )}
      </Disclosure>
    );
  }
}

export default withAuth(withRouter(Navbar));
