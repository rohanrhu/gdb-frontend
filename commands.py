# -*- coding: utf-8 -*-
#
# gdb-frontend is a easy, flexible and extensionable gui debugger
#
# https://github.com/rohanrhu/gdb-frontend
# https://oguzhaneroglu.com/projects/gdb-frontend/
#
# Licensed under GNU/GPLv3
# Copyright (C) 2019, Oğuzhan Eroğlu (https://oguzhaneroglu.com/) <rohanrhu2@gmail.com>

import sys
import importlib
import json

gdb = importlib.import_module("gdb")

import config
import plugin
import api.globalvars

class GDBFrontendLoadPluginPrefixCommand(gdb.Command):
    "Loads GDBFrontend plugin."

    def __init__(self):
        super(GDBFrontendLoadPluginPrefixCommand, self).__init__ (
            "gf-load-plugin",
            gdb.COMMAND_SUPPORT,
            gdb.COMPLETE_NONE,
            True
        )
    
    def invoke(self, plugin_name, from_tty):
        if not plugin.load(plugin_name):
            print("Plugin not found:", plugin_name)

GDBFrontendLoadPluginPrefixCommand()

class GDBFrontendUnloadPluginPrefixCommand(gdb.Command):
    "Unloads GDBFrontend plugin."

    def __init__(self):
        super(GDBFrontendUnloadPluginPrefixCommand, self).__init__ (
            "gf-unload-plugin",
            gdb.COMMAND_SUPPORT,
            gdb.COMPLETE_NONE,
            True
        )
    
    def invoke(self, plugin_name, from_tty):
        if not plugin.unload(plugin_name):
            print("Plugin is already not loaded:", plugin_name)

GDBFrontendUnloadPluginPrefixCommand()

class GDBFrontendListPluginsPrefixCommand(gdb.Command):
    "Lists all GDBFrontend plugins in the plugin directory."

    def __init__(self):
        super(GDBFrontendListPluginsPrefixCommand, self).__init__ (
            "gf-list-plugins",
            gdb.COMMAND_SUPPORT,
            gdb.COMPLETE_NONE,
            True
        )
    
    def invoke(self, args, from_tty):
        for _plugin_name in plugin.getAll():
            _plugin = plugin.getPlugin(_plugin_name)

            sys.stdout.write(_plugin_name)
            sys.stdout.write(" - ")

            if _plugin:
                sys.stdout.write("Enabled")
            else:
                sys.stdout.write("Disabled")

            sys.stdout.write("\n")

GDBFrontendListPluginsPrefixCommand()

class GDBFrontendRefreshPrefixCommand(gdb.Command):
    "Refreshes all browser clients."

    def __init__(self):
        super(GDBFrontendRefreshPrefixCommand, self).__init__ (
            "gf-refresh",
            gdb.COMMAND_SUPPORT,
            gdb.COMPLETE_NONE,
            True
        )
    
    def invoke(self, arg, from_tty):
        if api.globalvars.httpServer:
            for client in api.globalvars.httpServer.ws_clients:
                client.wsSend(json.dumps({
                    "event": "refresh"
                }))

GDBFrontendRefreshPrefixCommand()

class GDBFrontendThemePrefixCommand(gdb.Command):
    "Switch to desired theme."

    def __init__(self):
        super(GDBFrontendThemePrefixCommand, self).__init__ (
            "gf-theme",
            gdb.COMMAND_SUPPORT,
            gdb.COMPLETE_NONE,
            True
        )
    
    def invoke(self, theme_name, from_tty):
        if not theme_name:
            theme_name = "default"
        
        if not theme_name.startswith("theme_"):
            theme_name = "theme_" + theme_name
        
        for _plugin_name in list(plugin.plugins.keys()).copy():
            if _plugin_name.startswith("theme_"):
                plugin.unload(_plugin_name)
        
        if theme_name and theme_name != "theme_default":
            if not plugin.load(theme_name):
                print("Plugin not found:", theme_name)
        
        if api.globalvars.httpServer:
            for client in api.globalvars.httpServer.ws_clients:
                client.wsSend(json.dumps({
                    "event": "refresh"
                }))

GDBFrontendThemePrefixCommand()