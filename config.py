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

def init():
    global VERBOSE
    VERBOSE = False
    global HOST_ADDRESS
    HOST_ADDRESS = "127.0.0.1"
    global BIND_ADDRESS
    BIND_ADDRESS = "127.0.0.1"
    global GOTTY_PORT
    GOTTY_PORT = 5550
    global HTTP_PORT
    HTTP_PORT = 5551
    global PLUGINS_DIR
    PLUGINS_DIR = os.path.join(app_path, "plugins")
    global IS_READONLY
    IS_READONLY = False
    global MMAP_PATH
    MMAP_PATH = False
    global WORKDIR
    WORKDIR = False
    global CREDENTIALS
    CREDENTIALS = None

def setJSON(config_json):
    new_config = json.loads(config_json)

    for k, v in new_config.items():
        globals()[k] = v