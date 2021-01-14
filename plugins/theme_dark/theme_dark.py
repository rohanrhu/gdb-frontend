# -*- coding: utf-8 -*-
#
# gdb-frontend is a easy, flexible and extensionable gui debugger
#
# https://github.com/rohanrhu/gdb-frontend
# https://oguzhaneroglu.com/projects/gdb-frontend/
#
# Licensed under GNU/GPLv3
# Copyright (C) 2019, Oğuzhan Eroğlu (https://oguzhaneroglu.com/) <rohanrhu2@gmail.com>

# Example GDBFrontend Plugin

import importlib

import plugin

class ThemeDarkPlugin(plugin.GDBFrontendPlugin):
    def __init__(self):
        plugin.GDBFrontendPlugin.__init__(self)

    def loaded(self):
        pass

    def unloaded(self):
        pass