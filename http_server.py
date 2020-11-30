# -*- coding: utf-8 -*-
#
# gdb-frontend is a easy, flexible and extensionable gui debugger
#
# https://github.com/rohanrhu/gdb-frontend
# https://oguzhaneroglu.com/projects/gdb-frontend/
#
# Licensed under GNU/GPLv3
# Copyright (C) 2019, Oğuzhan Eroğlu (https://oguzhaneroglu.com/) <rohanrhu2@gmail.com>

import websocket
import http
import socket

class GDBFrontendHTTPServer(websocket.HTTPServer):
    def server_bind(self):
        http.server.HTTPServer.server_bind(self)
        self.socket.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)