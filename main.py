# -*- coding: utf-8 -*-
#
# gdb-frontend is a easy, flexible and extensionable gui debugger
#
# https://github.com/rohanrhu/gdb-frontend
# https://oguzhaneroglu.com/projects/gdb-frontend/
#
# Licensed under GNU/GPLv3
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
import api.globalvars
import plugin
import util
import urls
import api.url

gdb = importlib.import_module("gdb")

gdb.execute("set non-stop off")
gdb.execute("set pagination off")

api.globalvars.init()
settings.init()
plugin.init()
plugin.load_all()

all_urls = urls.urls

for _plugin_name, _plugin in plugin.plugins.items():
    for _url_name, _url in _plugin.urls.items():
        all_urls[_url_name] = _url

http_handler.url = api.url.URL(all_urls)

httpServer = http_server.GDBFrontendHTTPServer(
    (config.HOST_ADDRESS, config.HTTP_PORT),
    http_handler.RequestHandler
)

thread = threading.Thread(target=httpServer.serve_forever)
thread.setDaemon(True)
thread.start()

dbgServer = server.GDBFrontendServer()
dbgServer.setDaemon(True)
dbgServer.start()