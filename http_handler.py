# -*- coding: utf-8 -*-
#
# gdb-frontend is a easy, flexible and extensionable gui debugger
#
# https://github.com/rohanrhu/gdb-frontend
# https://oguzhaneroglu.com/projects/gdb-frontend/
#
# Licensed under MIT
# Copyright (C) 2019, Oğuzhan Eroğlu (https://oguzhaneroglu.com/) <rohanrhu2@gmail.com>

import os
import urllib
import http
import http.server
import mimetypes

import config
import util
import url

url = url.URL(config.urls)

class RequestHandler(http.server.BaseHTTPRequestHandler):
    def __init__(self, request, client_address, server):
        http.server.BaseHTTPRequestHandler.__init__(self, request, client_address, server)

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
        else:
            if not url.runModule(request=self):
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

    def do_GET(self):
        self.handleRequest()