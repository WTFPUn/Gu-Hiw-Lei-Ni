from handle_req.profile.editprofile import EditProfile, EditProfileBody
from handle_req.endpoint_collector import EndpointCollector

editprofile: EditProfile = EditProfile(["POST"], EditProfileBody)  # type: ignore

class Profile(EndpointCollector):
    pass

Profile.load_handling(Profile, [editprofile])
