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
import os

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "python-libs"))

import config

sys.path.insert(0, config.PLUGINS_DIR)

import settings
import http_server
import http_handler
import websocket
import api.globalvars
import plugin
import util
import urls
import api.url
import commands

gdb = importlib.import_module("gdb")

gdb.execute("set non-stop off")
gdb.execute("set pagination off")

api.globalvars.init()
settings.init()
plugin.init()
plugin.loadAll()

all_urls = urls.urls

for _plugin_name, _plugin in plugin.plugins.items():
    for _url_name, _url in _plugin.urls.items():
        all_urls.prepend(_url_name, _url)

http_handler.url = api.url.URL(all_urls)

api.globalvars.httpServer = http_server.GDBFrontendHTTPServer(
    (config.BIND_ADDRESS, config.HTTP_PORT),
    http_handler.RequestHandler
)

thread = threading.Thread(target=api.globalvars.httpServer.serve_forever)
thread.setDaemon(True)
thread.start()

config.HTTP_PORT = api.globalvars.httpServer.server_port

if config.MMAP_PATH:
    import mmap
    import ctypes
    
    fd = os.open(config.MMAP_PATH, os.O_RDWR)
    mmapBuff = mmap.mmap(fd, mmap.PAGESIZE, mmap.MAP_SHARED, mmap.PROT_WRITE)

    http_port = ctypes.c_uint16.from_buffer(mmapBuff, 0)
    
    http_port.value = api.globalvars.httpServer.server_port