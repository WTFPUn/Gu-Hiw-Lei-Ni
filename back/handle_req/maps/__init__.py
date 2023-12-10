from .geolocation import GeoLocation
from .geolocation import GeoLocationBodyRequest

from handle_req.endpoint_collector import EndpointCollector

geolocation: GeoLocation = GeoLocation(["POST"], GeoLocationBodyRequest)


class Maps(EndpointCollector):
    pass


Maps.load_handling(Maps, [geolocation])
