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

gdb_path = os.getcwd()
app_path = os.path.dirname(os.path.realpath(__file__))

VERBOSE = False
HOST_ADDRESS = "127.0.0.1"
GOTTY_PORT = 5550
HTTP_PORT = 5551
SERVER_PORT = 5552
PLUGINS_DIR = os.path.join(app_path, "plugins")

plugin_order = [
]

disabled_plugins = [
    "hello"
]