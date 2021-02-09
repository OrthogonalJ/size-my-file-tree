import argparse
import asyncio
import base64
import collections
import json
import math
import os
import pprint

import websockets

DEFAULT_HOST = 'localhost'
DEFAULT_PORT = 3000
# CHUNK_SIZE = 52428800 # 50 MiB in bytes

class FileTreeNode:
    def __init__(self, path, is_file, size=None, children=None):
        self.path = path
        self.base_name = os.path.basename(path)
        self.size = size
        self.children = children if children is not None else []
        self.is_file = is_file

    def _to_base_dict(self):
        return {
            'path': self.path, 
            'size': self.size, 
            'is_file': self.is_file, 
            'base_name': self.base_name
        }

    def to_dict(self):
        # Has structure {child_node: parent_dict}
        parent_map = {}
        unprocessed_nodes = collections.deque()
        unprocessed_nodes.append(self)

        root_dict = None
        while len(unprocessed_nodes) > 0:
            curr_node = unprocessed_nodes.popleft()
            curr_dict = curr_node._to_base_dict()
            curr_dict['children'] = []
            for child in curr_node.children:
                unprocessed_nodes.append(child)
                parent_map[child] = curr_dict
            if curr_node in parent_map:
                parent_dict = parent_map[curr_node]
                # if 'children' not in parent_dict:
                #     parent_dict['children'] = []
                parent_dict['children'].append(curr_dict)
            else:
                root_dict = curr_dict
        
        return root_dict

    # def to_json(self, path):
    #     with open(path, 'w') as fd:
    #         json.dump(self.to_dict(), fd)

    # def to_json_str(self):
    #     return json.dumps(self.to_dict())


def build_tree(root_dir):
    root_dir = os.path.normpath(root_dir)
    nodes = {}
    for parent_dir, child_dir_names, child_file_names in os.walk(root_dir, topdown=False):
        parent_dir = os.path.normpath(parent_dir)
        if parent_dir not in nodes:
            nodes[parent_dir] = FileTreeNode(parent_dir, is_file=False, size=0)
        parent_node = nodes[parent_dir]
        
        for child_dir_name in child_dir_names:
            child_dir = os.path.normpath(os.path.join(parent_dir, child_dir_name))
            if child_dir not in nodes:
                nodes[child_dir] = FileTreeNode(child_dir, is_file=False, size=0)
            child_dir_node = nodes[child_dir]
            parent_node.children.append(child_dir_node)
            parent_node.size += child_dir_node.size
        
        for child_file_name in child_file_names:
            child_file = os.path.normpath(os.path.join(parent_dir, child_file_name))
            child_file_node = FileTreeNode(child_file, is_file=True, size=os.path.getsize(child_file))
            parent_node.children.append(child_file_node)
            parent_node.size += child_file_node.size

    return nodes[root_dir]


# def force_utf8(str_value):
#     return str_value.encode().decode('utf-8', 'ignore')


# def encode_response(response):
#     payload = force_utf8(json.dumps(response))
#     payload_bytes = payload.decode('utf-8')
#     return base64.b64encode(payload_bytes)


# def parse_request(request):
#     request_bytes = base64.b64decode(request)
#     request_json = request.decode('utf-8')
#     return json.loads(request)


async def handle_websocket(websocket, path):
    request = json.loads(await websocket.recv())
    print('request:', request)
    root_dir = request['rootDir']

    response = None
    if os.path.isdir(root_dir):
        root_node = build_tree(root_dir)
        response = {'root': root_node.to_dict()}
    else:
        response = {'error': 'directory does not exist'}
    await websocket.send(json.dumps(response))
    # encoded_response = encode_response(response)
    # for chunk in chunk_message(encoded_response, CHUNK_SIZE):
    #     await websocket.send(chunk)


def main(host=DEFAULT_HOST, port=DEFAULT_PORT):
    start_server = websockets.serve(handle_websocket, host, port)
    asyncio.get_event_loop().run_until_complete(start_server)
    asyncio.get_event_loop().run_forever()
    # root_dir = '/Users/User/Documents/projects/file_tree_sizer/test_data/test_root_dir'
    # root_node = build_tree(root_dir)
    # root_node.to_json('tree.json')


if __name__ == '__main__':
    arg_parser = argparse.ArgumentParser()
    arg_parser.add_argument('--host', default=DEFAULT_HOST)
    arg_parser.add_argument('--port', default=DEFAULT_PORT, type=int)
    args = arg_parser.parse_args()
    main(host=args.host, port=args.port)
