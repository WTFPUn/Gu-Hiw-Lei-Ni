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

export async function find_place_info(p: Coords) {
  // find nearest place info from google place api
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

let timer: NodeJS.Timeout;

export const debounce = (func: (...args: any[]) => void, delay = 1000) => {
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
