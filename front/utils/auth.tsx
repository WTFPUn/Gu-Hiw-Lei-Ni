import jwtDecode from 'jwt-decode';
import React, { ComponentType } from 'react';

export interface User {
  user_name: string;
  first_name: string;
  last_name: string;
}

export interface LoginResponse {
  token: string;
}

export interface JwtDecodedToken {
  user_name: string;
  first_name: string;
  last_name: string;
}

/**
 * Logs in a user with the given user_name and password.
 * @param user_name - The user's username.
 * @param password - The user's password.
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
    return true;
  } catch (error: any) {
    console.log(error.message);
  }
  return false;
}

export function logout() {
  localStorage.removeItem('token');
}

export interface WithAuthProps {
  auth_status: boolean;
  user: User | null;
}

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

    componentDidMount() {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const decodedToken = jwtDecode(token) as JwtDecodedToken;
          console.log(decodedToken);
          // in case where token has exp field
          // const exp = decodedToken.exp;
          // const currentTime = Date.now() / 1000;
          // if (exp < currentTime) {
          //   localStorage.removeItem('token');
          //   this.setState({ status: false, user: null });
          // }
          if (decodedToken?.user_name)
            this.setState({ auth_status: true, user: decodedToken });
        } catch (error: any) {
          console.log(error.message);
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
