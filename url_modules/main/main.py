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
import urllib

import config
import statics
import urls
import util
import plugin

def run(request, params):
    if params is None: params = {}

    url_path = urllib.parse.urlparse(request.path)
    qs_params = urllib.parse.parse_qs(url_path.query)

    load_plugins = []

    for _plugin_name, _plugin in plugin.plugins.items():
        serializable = {}
        serializable["name"] = _plugin_name
        serializable["is_loaded"] = _plugin.is_loaded
        serializable["location"] = _plugin.location

        serializable["config"] = {}
        serializable["DESCRIPTION"] = _plugin.config.DESCRIPTION
        serializable["AUTHOR"] = _plugin.config.AUTHOR
        serializable["HOMEPAGE"] = _plugin.config.HOMEPAGE
        serializable["VERSION"] = _plugin.config.VERSION

        load_plugins.append(serializable)

    install_directory = os.path.realpath(os.path.join(os.path.dirname(__file__), "..", ".."))

    js_init = """
    GDBFrontend = {};
    GDBFrontend.version = '"""+util.versionString(statics.VERSION)+"""';
    GDBFrontend.install_directory = '"""+install_directory+"""';
    GDBFrontend.config = {};
    GDBFrontend.config.host_address = '"""+str(config.HOST_ADDRESS)+"""';
    GDBFrontend.config.bind_address = '"""+str(config.BIND_ADDRESS)+"""';
    GDBFrontend.config.http_port = """+str(config.HTTP_PORT)+""";
    GDBFrontend.config.gotty_port = """+str(config.GOTTY_PORT)+""";
    GDBFrontend.config.app_path = '"""+str(config.app_path)+"""';
    GDBFrontend.config.plugins_dir = '"""+str(config.PLUGINS_DIR)+"""';
    GDBFrontend.config.gdb_path = '"""+str(config.gdb_path)+"""';
    GDBFrontend.config.is_readonly = """+json.dumps(config.IS_READONLY)+""";
    GDBFrontend.config.workdir = """+json.dumps(config.WORKDIR)+""";
    GDBFrontend.load_plugins = JSON.parse('"""+json.dumps(load_plugins)+"""');
    """

    plugin_htmls = ""

    for _plugin_name, _plugin in plugin.plugins.items():
        _html_path = _plugin.webFSPath(os.path.join("html", _plugin_name+".html"))

        if os.path.exists(_html_path):
            fd = open(_html_path, 'r')
            _plugin_html = fd.read()
            fd.close()

            plugin_htmls += "\n" + _plugin_html

    if "layout" not in params.keys():
        gui_mode = statics.GUI_MODE_WEB
        gui_scripts = ""
    elif params["layout"] == "terminal":
        gui_mode = statics.GUI_MODE_WEB_TMUX
        gui_scripts = ""
    elif params["layout"] == "gui":
        gui_mode = statics.GUI_MODE_GUI
        gui_scripts = "<script src='qrc:///qtwebchannel/qwebchannel.js'></script>"
    else:
        request.send_response(404)
        request.send_header("Content-Type", "text/html; charset=utf-8")
        request.end_headers()
        request.wfile.write(("Invalid mode. ("+params["layout"]+")").encode())
        return

    html_messageBox = util.readFile(util.webFSPath("/components/MessageBox/html/MessageBox.html"))
    html_aboutDialog = util.readFile(util.webFSPath("/components/AboutDialog/html/AboutDialog.html"))
    html_checkbox = util.readFile(util.webFSPath("/components/Checkbox/html/Checkbox.html"))
    html_fileBrowser = util.readFile(util.webFSPath("/components/FileBrowser/html/FileBrowser.html"))
    html_sourceTree = util.readFile(util.webFSPath("/components/SourceTree/html/SourceTree.html"))
    html_fileTabs = util.readFile(util.webFSPath("/components/FileTabs/html/FileTabs.html"))
    html_threadsEditor = util.readFile(util.webFSPath("/components/ThreadsEditor/html/ThreadsEditor.html"))
    html_breakpointsEditor = util.readFile(util.webFSPath("/components/BreakpointsEditor/html/BreakpointsEditor.html"))
    html_stackTrace = util.readFile(util.webFSPath("/components/StackTrace/html/StackTrace.html"))
    html_variablesExplorer = util.readFile(util.webFSPath("/components/VariablesExplorer/html/VariablesExplorer.html"))
    html_watches = util.readFile(util.webFSPath("/components/Watches/html/Watches.html"))
    html_fuzzyFinder = util.readFile(util.webFSPath("/components/FuzzyFinder/html/FuzzyFinder.html"))
    html_disassembly = util.readFile(util.webFSPath("/components/Disassembly/html/Disassembly.html"))
    html_evaluateExpression = util.readFile(util.webFSPath("/components/EvaluateExpression/html/EvaluateExpression.html"))
    html_linkedListVisualizer = util.readFile(util.webFSPath("/components/LinkedListVisualizer/html/LinkedListVisualizer.html"))

    html_messageBox = html_messageBox.format(**vars())
    html_aboutDialog = html_aboutDialog.format(**vars())
    html_checkbox = html_checkbox.format(**vars())
    html_fileBrowser = html_fileBrowser.format(**vars())
    html_sourceTree = html_sourceTree.format(**vars())
    html_fileTabs = html_fileTabs.format(**vars())
    html_threadsEditor = html_threadsEditor.format(**vars())
    html_breakpointsEditor = html_breakpointsEditor.format(**vars())
    html_stackTrace = html_stackTrace.format(**vars())
    html_variablesExplorer = html_variablesExplorer.format(**vars())
    html_watches = html_watches.format(**vars())
    html_fuzzyFinder = html_fuzzyFinder.format(**vars())
    html_disassembly = html_disassembly.format(**vars())
    html_evaluateExpression = html_evaluateExpression.format(**vars())
    html_linkedListVisualizer = html_linkedListVisualizer.format(**vars())

    html = util.readFile(util.webFSPath("/templates/modules/main/main.html")).format(**vars())

    request.send_response(200)
    request.send_header("Content-Type", "text/html; charset=utf-8")
    request.end_headers()
    request.wfile.write(html.encode())