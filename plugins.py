# -*- coding: utf-8 -*-
#
# gdb-frontend is a easy, flexible and extensionable gui debugger
#
# https://github.com/rohanrhu/gdb-frontend
# https://oguzhaneroglu.com/projects/gdb-frontend/
#
# Licensed under MIT
# Copyright (C) 2019, Oğuzhan Eroğlu (https://oguzhaneroglu.com/) <rohanrhu2@gmail.com>

# GDBFrontend plugin support
#
# Plugin FS structure is like:
# plugins/
#    example_plugin/
#        frontend/
#            html/
#                plugin.html
#            js/
#                plugin.js
#            css/
#                plugin.css
#        url_modules/
#            example_module.py
#        config.py
#        plugin.py
#
# Plugins those are inside plugins directory will be loaded automatically.

import os
import os.path

def init():
    global plugins

    plugins = {}

def load(plugin_name):
    global plugins

def unload(plugin_name):
    global plugins

def load_all():
    global plugins