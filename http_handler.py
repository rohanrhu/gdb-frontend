# -*- coding: utf-8 -*-
#
# gdb-frontend is a easy, flexible and extensionable gui debugger
#
# https://github.com/rohanrhu/gdb-frontend
# https://oguzhaneroglu.com/projects/gdb-frontend/
#
# Licensed under GNU/GPLv3
# Copyright (C) 2019, Oğuzhan Eroğlu (https://oguzhaneroglu.com/) <rohanrhu2@gmail.com>

import os
import urllib
import re
import http
import http.server
import mimetypes
import base64

import config
import util
import plugin
import debug_server

url = None

class RequestHandler(debug_server.GDBFrontendSocket):
    def __init__(self, request, client_address, server):
        debug_server.GDBFrontendSocket.__init__(self, request, client_address, server)
        
        self.protocol_version = "HTTP/1.1"
        self.method = 'GET'

    def send_response(self, code, message=None):
        self.send_response_only(code, message)
        self.send_header("Server", "GDB-Frontend Server")
        self.send_header("Date", self.date_time_string())

    def handleRequest(self):
        path = urllib.parse.urlparse(self.path)
        file_path = path.path

        if file_path[-1] == "/":
            file_path = file_path + "index.html"

        ext = file_path.split(".")

        if ext.__len__() > 0:
            ext = "."+ext[-1]

        if ext in mimetypes.types_map:
            mimetype = mimetypes.types_map[ext]
        else:
            mimetype = "text/html"

        http_status = 500
        http_content_type = mimetype + "; charset=utf-8"

        fs_path = util.webFSPath(file_path[1:])

        is_path_exists = False

        def check_path(self, fs_path):
            nonlocal http_status
            nonlocal http_content_type
            nonlocal is_path_exists

            if os.path.exists(fs_path):
                http_status = 200

                fd = open(fs_path, 'rb')
                html = fd.read()
                fd.close()

                self.send_response(http_status)
                if http_content_type:
                    self.send_header("Content-Type", http_content_type)
                self.end_headers()
                self.wfile.write(html)

                is_path_exists = True

                return True

            return False

        if not check_path(self, fs_path) and file_path[:9] == "/plugins/":
            for _plugin_name, _plugin in plugin.plugins.items():
                if check_path(self, plugin.webFSPath(_plugin_name, file_path[10+len(_plugin_name):])):
                    break
        
        if not is_path_exists and not url.runModule(request=self):
            http_status = 404
            http_content_type = False

            fd = open(util.appPath("frontend/404.html"), 'rb')
            html = fd.read()
            fd.close()

            self.send_response(http_status)

            if http_content_type:
                self.send_header("Content-Type", http_content_type)

            self.end_headers()
            self.wfile.write(html)

    def checkAuth(self):
        if not config.CREDENTIALS:
            return True
        
        if self.headers.get("Authorization") is None:
            self.do_AUTH()
            return False
        
        if self.headers.get("Authorization") == "Basic " + base64.b64encode(config.CREDENTIALS.encode("utf-8")).decode("utf-8"):
            return True
        
        self.do_AUTH()
        return False

    def do_AUTH(self):
        self.send_response(401)
        self.send_header("WWW-Authenticate", "Basic realm=\"Login to GDBFrontend session\"")
        self.end_headers()

    def do_GET(self):
        self.method = 'GET'

        if not self.checkAuth():
            return

        if self.wsHandle():
            return
        
        try: self.handleRequest()
        except BrokenPipeError: pass

    def do_POST(self):
        self.method = 'POST'

        if not self.checkAuth():
            return

        try: self.handleRequest()
        except BrokenPipeError: pass