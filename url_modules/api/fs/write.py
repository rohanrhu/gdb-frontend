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
import cgi

def run(request, params):
    if params is None: params = {}

    url_path = urllib.parse.urlparse(request.path)
    qs_params = urllib.parse.parse_qs(url_path.query)

    result_json = {}

    if request.method != "POST":
        result_json["ok"] = False
    else:
        result_json["ok"] = True

        form_data = cgi.FieldStorage(
            fp=request.rfile,
            headers=request.headers,
            environ={"REQUEST_METHOD": "POST"}
        )

        file_path = form_data.getvalue("path")

        is_exists = os.path.exists(file_path)
        is_dir = os.path.isdir(file_path) if is_exists else False

        if is_exists and not is_dir:
            fd = open(file_path, 'w')
            fd.write(form_data.getvalue("content"))
            fd.close()
        else:
            result_json["error"] = {
                "not_exists": not is_exists,
                "is_dir": is_exists,
            }

    request.send_response(200)
    request.send_header("Content-Type", "application/json; charset=utf-8")
    request.end_headers()
    request.wfile.write(json.dumps(result_json).encode())