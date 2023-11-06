from .login import Login, LoginRequestBody
from .register import Register, RegisterRequestBody
from handle_req.endpoint_collector import EndpointCollector

login: Login = Login(["POST"], LoginRequestBody)  # type: ignore
register: Register = Register(["POST"], RegisterRequestBody)  # type: ignore


class Auth(EndpointCollector):
    pass


Auth.load_handling(Auth, [login, register])
