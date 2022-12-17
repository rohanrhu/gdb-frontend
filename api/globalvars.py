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
import threading
import multiprocessing

import http_server
import api.flags

lock = False
terminal_id = None
debugFlags = None
debugHandler = None
httpServer = None
inferior_run_times = {}
step_time = False
is_enhanced_collabration = False
if sys.platform != "darwin" or __name__ == "__main__":
    changed_registers = multiprocessing.Manager().dict()
dont_emit_until_stop_or_exit = False

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
    global debugHandler
    global httpServer
    global inferior_run_times
    global step_time
    global is_enhanced_collabration
    global changed_registers
    global collabration_state
    global dont_emit_until_stop_or_exit

def access(function):
    global lock
    global terminal_id
    global debugFlags
    global debugHandler
    global httpServer
    global inferior_run_times
    global step_time
    global is_enhanced_collabration
    global changed_registers
    global collabration_state
    global dont_emit_until_stop_or_exit

    lock.acquire()
    function()
    lock.release()