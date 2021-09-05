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

import plugin
import api
import api.globalvars

def run(request, params):
    if params is None: params = {}

    url_path = urllib.parse.urlparse(request.path)
    qs_params = urllib.parse.parse_qs(url_path.query)

    result_json = {}
    result_json["ok"] = True

    theme_name = qs_params.get("theme")

    if not theme_name:
        theme_name = "default"
    else:
        theme_name = theme_name[0]
    
    if not theme_name.startswith("theme_"):
        theme_name = "theme_" + theme_name
    
    for _plugin_name in list(plugin.plugins.keys()).copy():
        if _plugin_name.startswith("theme_"):
            plugin.unload(_plugin_name)
    
    if theme_name and theme_name != "theme_default":
        if not plugin.load(theme_name):
            print("Plugin not found:", theme_name)
    
    if api.globalvars.httpServer:
        for client in api.globalvars.httpServer.ws_clients:
            client.wsSend(json.dumps({
                "event": "refresh"
            }))
    if not plugin.load("theme_" + theme_name):
        result_json["ok"] = False

    request.send_response(200)
    request.send_header("Content-Type", "application/json; charset=utf-8")
    request.end_headers()
    request.wfile.write(json.dumps(result_json).encode())