import decode_jwt from 'jwt-decode';
import React, { ComponentType } from 'react';

export interface User {
  user_id: string;
  user_name: string;
  first_name: string;
  last_name: string;
}

export interface LoginResponse {
  token: string;
}

export interface JwtDecodedToken extends User {}

export interface AuthInfo {
  auth_status: boolean;
  user: User | null;
}

/**
 * Logs in a user with the given user_name and password.
 * @param user_name - The user's username.
 * @param password - The user's password.
 *
 * @event tokenChange - An event that is fired when the token is changed.
 *
 * @returns A boolean indicating whether the login was successful.
 */
export async function login(user_name: string, password: string) {
  // Get a token from api server using the fetch api
  try {
    const req = await fetch(process.env.NEXT_PUBLIC_API_URL + '/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_name, password }),
    });
    // if req status is 401 then throw error
    if (!req.ok) {
      throw new Error(req.statusText);
    }
    const res = (await req.json()) as LoginResponse;
    const token = res.token;
    // Set token to localStorage
    localStorage.setItem('token', token);
    // dispatch tokenChange event
    window.dispatchEvent(new Event('tokenChange'));
    return true;
  } catch (error: any) {
    console.log(error.message);
  }
  return false;
}

/**
 * Logout
 * Removes the token from localStorage and dispatches a 'tokenChange' event on the window object.
 * @event tokenChange - An event that is fired when the token is changed.
 */
export function logout() {
  localStorage.removeItem('token');
  window.dispatchEvent(new Event('tokenChange'));
}

export function get_auth() {
  if (typeof window === 'undefined') {
    return { auth_status: false, user: null };
  }
  const token = localStorage?.getItem('token');
  if (token) {
    try {
      const decodedToken = decode_jwt<JwtDecodedToken>(token);
      return { auth_status: true, user: decodedToken };
    } catch (error: any) {
      console.log(error.message);
    }
  }
  return { auth_status: false, user: null };
}

/**
 * Checks if the user is authenticated.
 * @returns A boolean indicating whether the user is authenticated.
 */
export function check_if_auth() {
  const authInfo = get_auth();
  if (authInfo.auth_status) {
    return true;
  }
  return false;
}

export interface WithAuthProps extends AuthInfo {}

/**
 * A higher-order component that provides authentication status and user information to the wrapped component.
 * @template T - The props type of the wrapped component.
 * @param {React.ComponentType<T>} WrappedComponent - The component to be wrapped.
 * @returns {React.ComponentType<Omit<T, keyof WithAuthProps>>} - The wrapped component with authentication props.
 */
export function withAuth<T extends WithAuthProps>(
  WrappedComponent: ComponentType<T>,
) {
  return class extends React.Component<
    Omit<T, keyof WithAuthProps>,
    WithAuthProps
  > {
    constructor(props: Omit<T, keyof WithAuthProps>) {
      super(props);
      this.state = {
        auth_status: false,
        user: null,
      };
    }

    async componentDidMount() {
      // get token from localStorage then decode and put into component state
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const decodedToken = decode_jwt<JwtDecodedToken>(token);
          // console.log(decodedToken);
          // check if the user id in token is valid
          // if not then set auth_status to false
          const req = await fetch(
            process.env.NEXT_PUBLIC_API_URL + '/auth/validatetoken',
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ token }),
            },
          );
          if (!req.ok) {
            throw new Error('failed to request validate token');
          }
          const body = await req.json();

          if (body.status == true && decodedToken?.user_name) {
            this.setState({ auth_status: true, user: decodedToken });
          } else {
            throw new Error('invalid token');
          }
        } catch (error: any) {
          console.error(error.message);
          logout();
        }
      }
    }

    render() {
      const { auth_status: status, user } = this.state;
      return (
        <WrappedComponent
          {...(this.props as T)}
          auth_status={status}
          user={user}
        />
      );
    }
  };
}
