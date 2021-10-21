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
import json

gdb_path = os.getcwd()
app_path = os.path.dirname(os.path.realpath(__file__))

plugin_order = [
]

"""
Theme plugins (like "theme_light") dont get loaded automatically.
So you can switch between themes with commands in GDB shell: "gf-theme light", "gf-theme default".
"""
disabled_plugins = [
    "hello"
]

VERBOSE = False
HOST_ADDRESS = "127.0.0.1"
BIND_ADDRESS = "127.0.0.1"
HTTP_PORT = 5550
PLUGINS_DIR = os.path.join(app_path, "plugins")
IS_READONLY = False
MMAP_PATH = False
WORKDIR = False
CREDENTIALS = None
TERMINAL_ID = False

def init():
    global VERBOSE
    global HOST_ADDRESS
    global BIND_ADDRESS
    global HTTP_PORT
    global PLUGINS_DIR
    global IS_READONLY
    global MMAP_PATH
    global WORKDIR
    global CREDENTIALS
    global TERMINAL_ID

def setJSON(config_json):
    new_config = json.loads(config_json)

    for k, v in new_config.items():
        globals()[k] = v