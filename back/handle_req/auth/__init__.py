from handle_req.auth.login import Login, LoginRequestBody
from handle_req.auth.register import Register, RegisterRequestBody
from handle_req.auth.validatetoken import ValidateToken, ValidateTokenRequest
from handle_req.endpoint_collector import EndpointCollector

login: Login = Login(["POST"], LoginRequestBody)  # type: ignore
register: Register = Register(["POST"], RegisterRequestBody)  # type: ignore
validatetoken: ValidateToken = ValidateToken(["POST"], ValidateTokenRequest)  # type: ignore

class Auth(EndpointCollector):
    pass


Auth.load_handling(Auth, [login, register, validatetoken])
