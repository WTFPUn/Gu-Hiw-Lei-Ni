from algorithm.MST import MSTClustering
from type.party import Party
from typing import List


def generate_parties(n: int, coord: List[List[float]]) -> list[Party]:
    parties = []
    for i in range(n):
        parties.append(
            Party(
                party_name=f"Party {i}",
                size=4,
                description="",
                host_id="",
                budget="low",
                lat=coord[i][0],
                lng=coord[i][1],
                place_id="",
                location="",
                members=[],
                status="not_started",
            )
        )
    return parties


coord = [
    [13.6704941, 100.5062069],
    [13.670407, 100.5030752],
    [13.67059, 100.5001268],
    [13.674603, 100.4835592],
    [13.6748719, 100.4828033],
    [13.6752603, 100.4817215],
    [13.6811187, 100.4762071],
    [13.6810387, 100.4748804],
    [13.680715, 100.4734892],
    [13.6736337, 100.4581226],
]

# coord = [[13.6658586, 100.4455798], [13.6778626, 100.4654357]]

parties = generate_parties(len(coord), coord)
# print(geodesic(coord[0], coord[1]).km)
# print(Party.get_distance(parties[0], parties[1]))
print("done")
mst = MSTClustering(parties)

mst.fit(K=1)

clus_res = mst.get_cluster_response()
print(clus_res)
