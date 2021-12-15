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
If enabled, it sets your CWD to executable's directory when you load an executable.
"""
SET_CWD_TO_EXECUTABLE = True

"""
Most of GDBFrontend functions are thread-safe and work on GDB's main-thread.
So, if you run something that is blocking on the GDB shell, GDBFrontend functions have to wait it until finish.
This setting is seconds to wait for print warning.
"""
GDB_MT_WARNING_TIME = 3

"""
Maximum recursion number of recursive functions that are used in somewhere like backtracing.
"""
MAX_RECURSIONS = 100

"""
Height and width synchronizing tresholds in enhanced collabration mode. (In pixels.)
"""
ENHANCED_COLLABRATION_RESOLUTION_TRESHOLD = 10

"""
If enabled, interrupts the process and call the function that is given to @threadSafe(no_interrupt=True)
@threadSafe(no_interrupt=True) skips this setting if no_interrupt is True.
"""
INTERRUPT_FOR_THREAD_SAFETY = True

"""
Max bytes to fetch for NULL-terminated strings.
"""
MAX_BYTES_TO_FETCH = 1000

"""
Max array items to serialize.
"""
MAX_SERIALIZED_ARRAY_ITEMS = 100

def init():
    global SET_CWD_TO_EXECUTABLE
    global GDB_MT_WARNING_TIME
    global MAX_RECURSIONS
    global ENHANCED_COLLABRATION_RESOLUTION_TRESHOLD
    global INTERRUPT_FOR_THREAD_SAFETY
    global MAX_BYTES_TO_FETCH
    global MAX_SERIALIZED_ARRAY_ITEMS
    