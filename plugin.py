# -*- coding: utf-8 -*-
#
# gdb-frontend is a easy, flexible and extensionable gui debugger
#
# https://github.com/rohanrhu/gdb-frontend
# https://oguzhaneroglu.com/projects/gdb-frontend/
#
# Licensed under MIT
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

Plugins those are inside plugins directory will be loaded automatically.

Plugin Name Format:
On File System: hello_plugin
Plugin Backend Class: HelloPlugin
"""

import os
import importlib

import config
import util

plugins = False

def webFSPath(plugin_name, path):
    return util.appPath(os.path.join("plugins", plugin_name, "frontend", path))

def init():
    global plugins

    plugins = {}

def getPlugin(plugin_name):
    global plugins

    if plugin_name not in plugins.keys():
        return False

    return plugins[plugin_name]

def load(plugin_name):
    global plugins

    plugin_location = os.path.join(config.PLUGINS_DIR, plugin_name)
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

    plugin.loaded()

    util.verbose("Plugin loaded:", plugin_name)

def unload(plugin_name):
    global plugins

    plugin = plugins[plugin_name]
    del plugins[plugin_name]

    plugin.unloaded()

    util.verbose("Plugin unloaded:", plugin_name)

def load_all():
    global plugins

    plugin_dirs = config.plugin_order

    for plugin_dir in os.listdir(config.PLUGINS_DIR):
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