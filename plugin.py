# -*- coding: utf-8 -*-
#
# gdb-frontend is a easy, flexible and extensionable gui debugger
#
# https://github.com/rohanrhu/gdb-frontend
# https://oguzhaneroglu.com/projects/gdb-frontend/
#
# Licensed under GNU/GPLv3
# Copyright (C) 2019, Oğuzhan Eroğlu (https://oguzhaneroglu.com/) <rohanrhu2@gmail.com>

"""
GDBFrontend Plugin Support

Plugin FS Structure:
plugins/
   hello/
       frontend/
           html/
               hello.html
           js/
               hello.js
           css/
               hello.css
       url_modules/
           api.py
       config.py
       urls.py
       hello.py

Plugins that are inside plugins directory will be loaded automatically.

Plugin Name Format:
On File System: hello, hello_world
Plugin Backend Class: HelloPlugin, HelloWorldPlugin

Theme Plugin Name Format:
On File System: theme_light, night_blue
Plugin Backend Class: ThemeLightPlugin, ThemeNightBluePlugin
"""

import os
import importlib
import json

import config
import util
import api.globalvars

def webFSPath(plugin_name, path):
    return os.path.join(config.PLUGINS_DIR, plugin_name, "frontend", path)

def init():
    global plugins

    plugins = {}

def getAll():
    return os.listdir(config.PLUGINS_DIR)

def getPlugin(plugin_name):
    global plugins

    if plugin_name not in plugins.keys():
        return False

    return plugins[plugin_name]

def load(plugin_name):
    global plugins

    plugin_location = os.path.join(config.PLUGINS_DIR, plugin_name)

    if not os.path.exists(plugin_location):
        return False
    
    module_path = os.path.join(plugin_location, plugin_name)+".py"
    config_path = os.path.join(plugin_location, "config")+".py"
    urls_path = os.path.join(plugin_location, "urls")+".py"

    config_spec = importlib.util.spec_from_file_location("config", config_path)
    config_module = importlib.util.module_from_spec(config_spec)
    config_spec.loader.exec_module(config_module)

    urls_spec = importlib.util.spec_from_file_location("urls", urls_path)
    urls_module = importlib.util.module_from_spec(urls_spec)
    urls_spec.loader.exec_module(urls_module)

    spec = importlib.util.spec_from_file_location(plugin_name, module_path)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)

    class_name = "".join([i.capitalize() for i in plugin_name.split("_")]) + "Plugin"

    plugin_class = getattr(module, class_name)

    plugin = plugin_class()
    plugin.module = module
    plugin.name = plugin_name
    plugin.is_loaded = True
    plugin.location = plugin_location
    plugin.config = config_module
    plugin.urls = urls_module.urls

    plugins[plugin_name] = plugin

    if api.globalvars.httpServer:
        for client in api.globalvars.httpServer.ws_clients:
            client.wsSend(json.dumps({
                "event": "plugin_loaded",
                "plugin": {
                    "name": plugin_name
                }
            }))

    plugin.loaded()

    util.verbose("Plugin loaded:", plugin_name)

    return True

def unload(plugin_name):
    global plugins

    try:
        plugin = plugins[plugin_name]
    except KeyError:
        return False
    
    del plugins[plugin_name]

    if api.globalvars.httpServer:
        for client in api.globalvars.httpServer.ws_clients:
            client.wsSend(json.dumps({
                "event": "plugin_loaded",
                "plugin": {
                    "name": plugin_name
                }
            }))

    plugin.unloaded()

    util.verbose("Plugin unloaded:", plugin_name)

    return True

def loadAll():
    global plugins

    plugin_dirs = config.plugin_order

    for plugin_dir in os.listdir(config.PLUGINS_DIR):
        if plugin_dir.startswith("theme_"):
            continue
        
        if plugin_dir not in plugin_dirs:
            plugin_dirs.append(plugin_dir)

    for plugin_dir in plugin_dirs:
        if plugin_dir in config.disabled_plugins: continue
        load(plugin_dir)

class GDBFrontendPlugin():
    module = None
    config = None
    urls = None
    name = False
    is_loaded = False
    location = False

    def __init__(self):
        pass

    def loaded(self):
        pass

    def unloaded(self):
        pass

    def webFSPath(self, path):
        return webFSPath(self.name, path)