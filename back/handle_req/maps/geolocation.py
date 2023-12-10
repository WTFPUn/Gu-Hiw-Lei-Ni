from typing import Literal, List
from starlette.responses import JSONResponse
import requests

from pydantic import BaseModel
from handle_req import HandleRequest


class GeoLocationBodyRequest(BaseModel):
    lat: float
    lng: float


class GeoLocationResponse(BaseModel):
    pass


class query(BaseModel):
    pass


class Place(BaseModel):
    text: str
    languagecode: str


class GooglePlaces(BaseModel):
    places: List[Place]


class GeoLocation(HandleRequest[GeoLocationBodyRequest, None]):
    async def _handle(self) -> JSONResponse:
        url = f"https://places.googleapis.com/v1/places:searchNearby"
        headers = {
            "content-type": "application/json",
            "X-Goog-Api-Key": self.api_key,
            "X-Goog-FieldMask": "places.displayName",
        }
        body = {
            "locationRestriction": {
                "circle": {
                    "center": {"latitude": self.body.lat, "longitude": self.body.lng},
                    "radius": 500.0,
                }
            }
        }

        res = requests.post(url, headers=headers, json=body)

        return JSONResponse(res.json())
