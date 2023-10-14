from .login import Login, LoginRequestBody
from .register import Register, RegisterRequestBody
from handle_req.endpoint_collector import EndpointCollector

login: Login = Login(["POST"], LoginRequestBody)
register: Register = Register(["POST"], RegisterRequestBody)


class Auth(EndpointCollector):
    pass


Auth.load_handling(Auth, [login, register])
