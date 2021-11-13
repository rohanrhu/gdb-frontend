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
import urllib
import importlib
import subprocess

gdb = importlib.import_module("gdb")

def run(request, params):
    if params is None: params = {}

    url_path = urllib.parse.urlparse(request.path)
    qs_params = urllib.parse.parse_qs(url_path.query)

    result_json = {}
    result_json["ok"] = True

    if qs_params.get("command") is None:
        result_json["ok"] = False

    subprocess.Popen(
        qs_params["command"][0],
        stdin=subprocess.DEVNULL,
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
        close_fds=True,
        shell=True,
        executable='/bin/bash'
    )

    request.send_response(200)
    request.send_header("Content-Type", "application/json; charset=utf-8")
    request.end_headers()
    request.wfile.write(json.dumps(result_json).encode())