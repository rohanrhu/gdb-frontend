# -*- coding: utf-8 -*-
#
# gdb-frontend is a easy, flexible and extensionable gui debugger
#
# https://github.com/rohanrhu/gdb-frontend
# https://oguzhaneroglu.com/projects/gdb-frontend/
#
# Licensed under GNU/GPLv3
# Copyright (C) 2019, Oğuzhan Eroğlu (https://oguzhaneroglu.com/) <rohanrhu2@gmail.com>

import json
import os
import urllib

def run(request, params):
    if params is None: params = {}

    url_path = urllib.parse.urlparse(request.path)
    qs_params = urllib.parse.parse_qs(url_path.query)

    result_json = {}

    if "path" not in qs_params.keys():
        result_json["ok"] = False
    else:
        result_json["ok"] = True

        query_path = qs_params["path"][0]

        is_exists = os.path.exists(query_path)
        is_dir = os.path.isdir(query_path) if is_exists else False

        if is_exists and is_dir:
            result_json["files"] = []

            try:
                files = os.listdir(query_path)

                for i in range(len(files)):
                    _name = files[i]
                    _path = os.path.join(query_path, _name)

                    result_json["files"].append({
                        "name": _name,
                        "path": _path,
                        "is_dir": os.path.isdir(_path)
                    })
            except PermissionError:
                result_json["error"] = {
                    "not_permitted": True
                }
            except Exception:
                result_json["error"] = True

        else:
            result_json["error"] = {
                "not_exists": not is_exists,
                "is_file": is_exists,
            }

    request.send_response(200)
    request.send_header("Content-Type", "application/json; charset=utf-8")
    request.end_headers()
    request.wfile.write(json.dumps(result_json).encode())