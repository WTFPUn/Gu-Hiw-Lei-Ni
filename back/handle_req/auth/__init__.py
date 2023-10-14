from .login import Login
from .register import Register
from handle_req.endpoint_collector import EndpointCollector

login: Login = Login(["POST"])
register: Register = Register(["POST"])


class Auth(EndpointCollector):
    pass


Auth.load_handling(Auth, [login, register])
