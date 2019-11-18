# -*- coding: utf-8 -*-
#
# gdb-frontend is a easy, flexible and extensionable gui debugger
#
# https://github.com/rohanrhu/gdb-frontend
# https://oguzhaneroglu.com/projects/gdb-frontend/
#
# Licensed under MIT
# Copyright (C) 2019, Oğuzhan Eroğlu (https://oguzhaneroglu.com/) <rohanrhu2@gmail.com>

import threading
import importlib
import sys

sys.path.insert(0, "python-libs")

import config
import settings
import http_server
import http_handler
import server
import globalvars
import plugins
import util

gdb = importlib.import_module("gdb")

settings.init()
globalvars.init()
plugins.init()

gdb.execute("set non-stop off")
gdb.execute("set pagination off")

httpdbgServer = http_server.GDBFrontendHTTPServer(
    (config.HOST_ADDRESS, config.HTTP_PORT),
    http_handler.RequestHandler
)

thread = threading.Thread(target=httpdbgServer.serve_forever)
thread.setDaemon(True)
thread.start()

dbgServer = server.GDBFrontendServer()
dbgServer.setDaemon(True)
dbgServer.start()