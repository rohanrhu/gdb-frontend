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
debugFlags = False
dbgServer = False

def init():
    global lock
    lock = threading.Lock()

    global debugFlags
    debugFlags = api.flags.AtomicDebugFlags()

    global dbgServer

def access(function):
    global lock
    global debugFlags
    global dbgServer

    lock.acquire()
    function()
    lock.release()