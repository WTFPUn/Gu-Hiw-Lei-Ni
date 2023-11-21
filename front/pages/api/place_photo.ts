import { get_place_info } from '@/utils/map';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handlePlacePhoto(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const { placeid } = req.query;
  const placeInfo = await get_place_info(placeid as string);
  if (!placeInfo?.photos || placeInfo?.photos?.length === 0)
    return res.status(404).json({ error: 'No photo found' });

  const photoRef = placeInfo.photos[0];

  const api_link = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=${photoRef.photo_reference}&key=${process.env.NEXT_PUBLIC_GOOGLE_API_KEY}`;

  const photoReq = await fetch(api_link, {
    method: 'POST',
  });

  if (photoReq.ok) {
    const photoRes = await photoReq.arrayBuffer();
    const photoR = Buffer.from(photoRes).toString('base64');

    return res.status(200).send({ photo: 'data:image/jpg;base64,' + photoR });
  }
  return res.status(500).json({ error: 'Internal server error' });
}
