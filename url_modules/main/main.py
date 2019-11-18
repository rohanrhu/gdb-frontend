# -*- coding: utf-8 -*-
#
# gdb-frontend is a easy, flexible and extensionable gui debugger
#
# https://github.com/rohanrhu/gdb-frontend
# https://oguzhaneroglu.com/projects/gdb-frontend/
#
# Licensed under MIT
# Copyright (C) 2019, Oğuzhan Eroğlu (https://oguzhaneroglu.com/) <rohanrhu2@gmail.com>

import json
import urllib

import config
import statics
import util

def run(request, params):
    if params is None: params = {}

    url_path = urllib.parse.urlparse(request.path)
    qs_params = urllib.parse.parse_qs(url_path.query)

    js_init = """
    GDBFrontend = {};
    GDBFrontend.config = {};
    GDBFrontend.config.host_address = '"""+str(config.HOST_ADDRESS)+"""';
    GDBFrontend.config.http_port = """+str(config.HTTP_PORT)+""";
    GDBFrontend.config.gotty_port = """+str(config.GOTTY_PORT)+""";
    GDBFrontend.config.server_port = """+str(config.SERVER_PORT)+""";
    GDBFrontend.config.app_path = '"""+str(config.app_path)+"""';
    GDBFrontend.config.plugins_dir = '"""+str(config.PLUGINS_DIR)+"""';
    GDBFrontend.config.gdb_path = '"""+str(config.gdb_path)+"""';
    """

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

    html_messageBox = util.readFile(util.webFSPath("/components/MessageBox/html/MessageBox.html")).format(**vars())
    html_aboutDialog = util.readFile(util.webFSPath("/components/AboutDialog/html/AboutDialog.html")).format(**vars())
    html_checkbox = util.readFile(util.webFSPath("/components/Checkbox/html/Checkbox.html")).format(**vars())
    html_fileBrowser = util.readFile(util.webFSPath("/components/FileBrowser/html/FileBrowser.html")).format(**vars())
    html_sourceTree = util.readFile(util.webFSPath("/components/SourceTree/html/SourceTree.html")).format(**vars())
    html_fileTabs = util.readFile(util.webFSPath("/components/FileTabs/html/FileTabs.html")).format(**vars())
    html_threadsEditor = util.readFile(util.webFSPath("/components/ThreadsEditor/html/ThreadsEditor.html")).format(**vars())
    html_breakpointsEditor = util.readFile(util.webFSPath("/components/BreakpointsEditor/html/BreakpointsEditor.html")).format(**vars())
    html_stackTrace = util.readFile(util.webFSPath("/components/StackTrace/html/StackTrace.html")).format(**vars())
    html_variablesExplorer = util.readFile(util.webFSPath("/components/VariablesExplorer/html/VariablesExplorer.html")).format(**vars())

    html = util.readFile(util.webFSPath("/templates/modules/main/main.html")).format(**vars())

    request.send_response(200)
    request.send_header("Content-Type", "text/html; charset=utf-8")
    request.end_headers()
    request.wfile.write(html.encode())