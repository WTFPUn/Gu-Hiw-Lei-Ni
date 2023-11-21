import { Coords } from 'google-map-react';

export const testLocations = [
  {
    lat: 13.7379,
    lng: 100.5604,
  },
  {
    lat: 13.6513,
    lng: 100.4964,
  },
];

/**
 * Calculates the distance between two coordinates using the Haversine formula.
 * @param p1 The first coordinate.
 * @param p2 The second coordinate.
 * @returns The distance between the two coordinates in kilometers.
 */
export function calculateDistance(p1: Coords, p2: Coords) {
  // calculate distance between two points
  const R = 6371; // km
  const dLat = ((p2.lat - p1.lat) * Math.PI) / 180;
  const dLon = ((p2.lng - p1.lng) * Math.PI) / 180;
  const a =
    0.5 -
    Math.cos(dLat) / 2 +
    (Math.cos((p1.lat * Math.PI) / 180) *
      Math.cos((p2.lat * Math.PI) / 180) *
      (1 - Math.cos(dLon))) /
      2;

  return R * 2 * Math.asin(Math.sqrt(a));
}

/**
 * Finds the nearest place information from the Google Places API based on the given coordinates.
 * @param p - The coordinates (latitude and longitude) of the location.
 * @returns A Promise that resolves to an array of place results, or null if an error occurs.
 */
export async function find_place_info(p: Coords) {
  // find nearest place info from google place api
  // https://developers.google.com/maps/documentation/javascript/geocoding
  // https://developers.google.com/maps/documentation/geocoding/overview
  try {
    const api_link = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${p.lat},${p.lng}&key=${process.env.NEXT_PUBLIC_GOOGLE_API_KEY}&enable_address_descriptor=true`;
    const req = await fetch(api_link, {
      method: 'POST',
    });
    if (req.ok) {
      const res = await req.json();
      return res?.results;
    }
  } catch (error) {
    console.error(error);
  }

  return null;
}

export async function get_place_info(id?: string) {
  // id is place_id
  if (!id) return null;
  try {
    const api_link = `https://maps.googleapis.com/maps/api/place/details/json?placeid=${id}&fields=formatted_address,name,geometry,photo&key=${process.env.NEXT_PUBLIC_GOOGLE_API_KEY}`;
    const req = await fetch(api_link, {
      method: 'GET',
    });
    if (req.ok) {
      const res = await req.json();
      return res?.result;
    }
  } catch (error) {
    console.error(error);
  }

  return null;
}

export async function get_place_image(imgRefId?: string) {
  if (!imgRefId) return null;
  try {
    const api_link = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${imgRefId}&key=${process.env.NEXT_PUBLIC_GOOGLE_API_KEY}`;
    const req = await fetch(api_link, {
      method: 'POST',
    });
    if (req.ok) {
      const res = await req.blob();
      return URL.createObjectURL(res);
    }
  } catch (error) {
    console.error(error);
  }

  return null;
}

export async function get_place_photo_client(id?: string): Promise<string> {
  return id
    ? await fetch('/api/place_photo?placeid=' + id, {
        method: 'GET',
      })
        .then(res => res.json())
        .then(value => value?.photo)
        .catch(() => '/meat.png')
    : '/meat.png';
}

let timer: NodeJS.Timeout;

/**
 * Debounces the execution of a function.
 * @param func - The function to be debounced.
 * @param delay - The delay in milliseconds before the function is executed.
 * @returns A debounced version of the function.
 */
export const debounceApi = (func: (...args: any[]) => void, delay = 1000) => {
  // Declare a variable called 'timer' to store the timer ID

  // Return an anonymous function that takes in any number of arguments
  return function (...args: any[]) {
    // Clear the previous timer to prevent the execution of 'func'
    clearTimeout(timer);

    // Set a new timer that will execute 'func' after the specified delay
    timer = setTimeout(() => {
      func(...args);
    }, delay);
  };
};
