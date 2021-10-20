# -*- coding: utf-8 -*-
#
# gdb-frontend is a easy, flexible and extensionable gui debugger
#
# https://github.com/rohanrhu/gdb-frontend
# https://oguzhaneroglu.com/projects/gdb-frontend/
#
# Licensed under GNU/GPLv3
# Copyright (C) 2019, Oğuzhan Eroğlu (https://oguzhaneroglu.com/) <rohanrhu2@gmail.com>

import threading

import http_server
import api.flags

lock = False
terminal_id = None
debugFlags = None
httpServer: http_server.GDBFrontendHTTPServer = None
inferior_run_times = {}
step_time = False
is_enhanced_collabration = False

collabration_state = {
    "editor": {
        "file": False,
        "open_files": []
    },
    "watches": [],
    "draw": {
        "paths": [],
        "path_color": 0
    }
}

def init():
    global lock
    lock = threading.Lock()

    global debugFlags
    debugFlags = api.flags.AtomicDebugFlags()

    global terminal_id
    global httpServer
    global inferior_run_times
    global step_time
    global is_enhanced_collabration
    global collabration_state

def access(function):
    global lock
    global terminal_id
    global debugFlags
    global httpServer
    global inferior_run_times
    global step_time
    global is_enhanced_collabration
    global collabration_state

    lock.acquire()
    function()
    lock.release()