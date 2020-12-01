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

import api.flags

lock = False
debugFlags = None
httpServer = None
wsServer = None
inferior_run_times = {}
step_time = False

def init():
    global lock
    lock = threading.Lock()

    global debugFlags
    debugFlags = api.flags.AtomicDebugFlags()

    global httpServer
    global httpServer
    global wsServer
    global inferior_run_times
    global step_time

def access(function):
    global lock
    global debugFlags
    global httpServer
    global wsServer
    global inferior_run_times
    global step_time

    lock.acquire()
    function()
    lock.release()