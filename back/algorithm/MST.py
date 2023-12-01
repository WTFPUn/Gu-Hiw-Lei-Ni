from os import link
from typing import Set, Dict
from type.party import Party
from pydantic import BaseModel, Field
from typing_extensions import TypedDict as TD
import math


class ClusterDict(TD):
    cluster_coord: tuple[float, float]
    parties: list[Party]


class ClusterResponse(BaseModel):
    data: list[ClusterDict]


class Node:
    def __init__(self, party: Party):
        self.party = party
        self.name = party.party_name
        self.lat = party.lat
        self.lng = party.lng
        self.edges: Dict[Node, float] = {}
        self.MST_link: Set[Node] = set()


class MSTClustering:
    MIN_CLUSTER_SIZE = 2

    def __init__(self, parties: list[Party]):
        self.parties = parties
        self.nodes = [Node(party) for party in parties]
        self.edges: list[tuple[Node, Node, float]] = []
        self.clusters: list[Set[Node]] = []
        self.__init_linked()

    def __get_party_distance(self, node1: Node, node2: Node) -> float:
        return Party.get_distance(node1.party, node2.party)

    def __get_distance(
        self, lat1: float, lng1: float, lat2: float, lng2: float
    ) -> float:
        R = 6371  # Earth's radius in kilometers

        lat1 = math.radians(lat1)
        lng1 = math.radians(lng1)
        lat2 = math.radians(lat2)
        lng2 = math.radians(lng2)

        delta_lat = lat2 - lat1
        delta_lng = lng2 - lng1

        a = math.sin(delta_lat / 2) * math.sin(delta_lat / 2) + math.cos(
            lat1
        ) * math.cos(lat2) * math.sin(delta_lng / 2) * math.sin(delta_lng / 2)
        c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))

        return R * c

    def __init_linked(self):
        for node1 in self.nodes:
            for node2 in self.nodes:
                if node1 != node2:
                    node1.edges[node2] = self.__get_party_distance(node1, node2)

    def __prim(self):
        # initialize
        visited: Set[Node] = set()
        start_node = self.nodes[0]
        visited.add(start_node)

        # loop until all nodes are visited
        while len(visited) < len(self.nodes):
            # find min edge
            min_edge = None
            for node in visited:
                for edge in node.edges:
                    if edge not in visited:
                        if min_edge is None or node.edges[edge] < min_edge[2]:
                            min_edge = (node, edge, node.edges[edge])

            # add edge to MST
            self.edges.append(min_edge)
            visited.add(min_edge[1])

            # link nodes
            min_edge[0].MST_link.add(min_edge[1])
            min_edge[1].MST_link.add(min_edge[0])

        return

    def __trim_clusters(self, K: float):
        # change K to distance format
        # remove edges that lower than K
        filtered_edges = []
        for edge in self.edges:
            if edge[2] < K:
                filtered_edges.append(edge)

            else:
                # remove edge from node
                edge[0].edges.pop(edge[1])
                edge[1].edges.pop(edge[0])

                edge[0].MST_link = edge[0].MST_link.remove(edge[1])
                edge[1].MST_link = edge[1].MST_link.remove(edge[0])

        self.edges = filtered_edges

    def __dfs(self, node: Node, cluster: Set[Node]):
        cluster.add(node)
        link_node = node.MST_link
        if link_node is not None:
            for edge in link_node:
                if edge not in cluster:
                    self.__dfs(edge, cluster)

    def __get_clusters(self):
        visited: Set[Node] = set()
        for node in self.nodes:
            if node not in visited:
                cluster = set()
                self.__dfs(node, cluster)
                for done_cluster in self.clusters:
                    # if cluster is subset of done_cluster then remove done_cluster and add cluster
                    if done_cluster.issubset(cluster):
                        self.clusters.remove(done_cluster)
                        self.clusters.append(cluster)
                        break
                else:
                    self.clusters.append(cluster)

                visited = visited.union(cluster)

    def __get_cluster_centers(self, cluster: Set[Node]):
        """
        find center of each cluster by finding the max/min lat/lng and divide by 2
        """

        max_lat = -math.inf
        min_lat = math.inf
        max_lng = -math.inf
        min_lng = math.inf

        for node in cluster:
            if node.lat > max_lat:
                max_lat = node.lat
            if node.lat < min_lat:
                min_lat = node.lat
            if node.lng > max_lng:
                max_lng = node.lng
            if node.lng < min_lng:
                min_lng = node.lng

        return (max_lat + min_lat) / 2, (max_lng + min_lng) / 2

    def fit(self, K: float = 2):
        self.__prim()
        self.__trim_clusters(K)
        self.__get_clusters()
        return self.clusters

    def get_clusters(self):
        return self.clusters

    def get_cluster_centers(self):
        return [list(cluster)[0].party for cluster in self.clusters]

    def get_cluster_response(self):
        return ClusterResponse(
            data=[
                {
                    "cluster_coord": self.__get_cluster_centers(cluster),
                    "parties": [node.party for node in cluster],
                }
                for cluster in self.clusters
            ]
        )
