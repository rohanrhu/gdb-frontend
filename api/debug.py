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
GDBFrontend Debugging API

All gdbfrontend.api.debug functions/methods are thread-safe.
They will be executed in GDB's main-thread and block caller thread.

! Thread-Safety:
If you are making a GDBFrontend plugin, you should use @threadSafe(no_interrupt=True) decorator
if your function is interacting with functions from "gdb" module.
"""

import os
import importlib
import threading
import traceback
import time
import sys
import re
import multiprocessing

import config
import settings
import util
import api.flags
import api.globalvars

api.globalvars.init()
settings.init()

gdb = importlib.import_module("gdb")

def threadSafe(no_interrupt=True):
    """
    Decorator for running something with thread-safety.
    If it is currently on main-thread, callback runs immediately,
    otherwise it appends callback to gdb's event-loop
    and blocks caller thread until callback finish.
    
    Usage:\n
    @api.debug.threadSafe()\n
    def threadSafeFunction():\n
        pass
    \n
    Parameters:\n
    no_interrupt: Disables interrupting mechanism that temporarily interrupts the process
    that is being debugged and execute given function between interrupt and continue.
    """
    
    def _decorator(callback):
        nonlocal no_interrupt

        def _threadSafe(*args, **kwargs):
            nonlocal no_interrupt

            is_mt = threading.current_thread() is threading.main_thread()
            lockCounter = util.AtomicInteger()

            output = None

            def _exec__mT():
                nonlocal callback
                nonlocal no_interrupt
                nonlocal lockCounter
                nonlocal is_mt
                nonlocal output

                try:
                    output = callback(*args, **kwargs)
                except Exception as e:
                    util.verbose(e, traceback.format_exc())

                lockCounter.decr()
            
            if not is_mt:
                use_interrupt = not no_interrupt and settings.INTERRUPT_FOR_THREAD_SAFETY and api.globalvars.debugFlags.get(api.flags.AtomicDebugFlags.IS_RUNNING)

                lockCounter.incr()
                gdb.post_event(_exec__mT)

                if use_interrupt:
                    util.verbose("Interrupting for: THREAD_SAFETY.")
                    
                    api.globalvars.debugFlags.set(api.flags.AtomicDebugFlags.IS_INTERRUPTED_FOR_THREAD_SAFETY, _exec__mT)
                    gdb.execute("interrupt")

                is_warned = False
                start_time = time.time()
                
                while lockCounter.get() > 0:
                    if not is_warned and time.time() - start_time > settings.GDB_MT_WARNING_TIME:
                        if not use_interrupt:
                            is_warned = True
                            api.globalvars.httpServer.wsSendAll("{\"event\": \"mt_blocking\"}")
                        else:
                            is_warned = True
                            api.globalvars.httpServer.wsSendAll("{\"event\": \"mt_blocking_with_interrupting\"}")
                    
                    time.sleep(0.1)
            else:
                _exec__mT()

            return output
    
        return _threadSafe
    
    return _decorator

def execCommand(command, buff_output=False):
    """
    Thread-safe GDB command execution.
    """

    is_mt = threading.current_thread() is threading.main_thread()
    lockCounter = util.AtomicInteger()

    output = None

    def _execCommand__mT():
        nonlocal lockCounter
        nonlocal is_mt
        nonlocal command
        nonlocal buff_output
        nonlocal output

        try:
            output = gdb.execute(command, to_string=buff_output)
        except Exception as e:
            util.verbose(e, traceback.format_exc())

        if not is_mt: lockCounter.decr()
        
    if not is_mt:
        lockCounter.incr()
        gdb.post_event(_execCommand__mT)

        is_warned = False
        start_time = time.time()
        
        while lockCounter.get() > 0:
            if not is_warned and time.time() - start_time > settings.GDB_MT_WARNING_TIME:
                is_warned = True
                api.globalvars.httpServer.wsSendAll("{\"event\": \"mt_blocking\"}")
            
            time.sleep(0.1)
    else:
        _execCommand__mT()

    return output

@threadSafe(no_interrupt=True)
def load(file):
    """
    Loads objfile by given path.
    Sets CWD to directory of objfile according to user-editable setting settings.SET_CWD_TO_EXECUTABLE.
    """

    try:
        gdb.execute("file")
        gdb.execute("file \"%s\"" % file)

        if settings.SET_CWD_TO_EXECUTABLE:
            gdb.execute("cd %s" % os.path.dirname(file))
        
        return True
    except Exception as e:
        util.verbose("[Error]", str(e))
        return False

@threadSafe(no_interrupt=True)
def connect(host, port):
    """
    Connects to gdbserver.
    """

    try:
        gdb.execute("file")
        gdb.execute("target remote %s:%s" % (str(host), str(port)))
        return True
    except Exception as e:
        util.verbose("[Error]", str(e))
        return False

@threadSafe(no_interrupt=True)
def getState():
    """
    Returns all debugging information with JSON-serializability.
    """

    state = {}

    state["is_enhanced_collabration"] = api.globalvars.is_enhanced_collabration
    state["collabration"] = {}
    state["collabration"]["state"] = api.globalvars.collabration_state

    state["breakpoints"] = getBreakpoints()
    state["objfiles"] = getFiles()
    state["sources"] = getSources()
    state["registers"] = getRegisters()
    state["step_time"] = api.globalvars.step_time

    try:
        current_frame = gdb.selected_frame()
        sal = current_frame.find_sal()
        symtab = sal.symtab
        
        state["current_location"] = {}
        state["current_location"]["file"] = symtab.fullname().replace("\\", "/")
        state["current_location"]["line"] = sal.line
    except Exception as e:
        state["current_location"] = False

    inferior = gdb.selected_inferior()
    
    try:
        threads = inferior.threads()
    except:
        threads = []

    state["inferior"] = {}
    state["inferior"]["num"] = inferior.num
    state["inferior"]["threads"] = []

    if inferior.num in api.globalvars.inferior_run_times.keys():
        state["inferior"]["run_time"] = api.globalvars.inferior_run_times[inferior.num]
    else:
        state["inferior"]["run_time"] = 0
    
    th0 = gdb.selected_thread()

    for _thread in threads:
        thread = {}
        thread["name"] = _thread.name
        thread["num"] = _thread.num
        thread["global_num"] = _thread.global_num
        thread["ptid"] = _thread.ptid
        thread["is_stopped"] = _thread.is_stopped()
        thread["is_running"] = _thread.is_running()
        thread["is_exited"] = _thread.is_exited()
        if th0 is None:
            thread["is_current"] = False
        else:
            thread["is_current"] = _thread.num == th0.num

        _thread.switch()

        if not _thread.is_running():
            frame = gdb.newest_frame()
            try:
                block = frame.block()
                function = block.function
            except RuntimeError as e:
                block = False
                function = False

            if function:
                file = function.symtab.filename
                line = function.line
                function_name = str(function.name)
            else:
                file = False
                line = False
                function_name = str(frame.name())

            backtrace = backTraceFrame(frame)

            backtrace_json = []
            for _frame in backtrace:
                _name = _frame.name()
                _function = _frame.function()

                _frame_json = {}
                _frame_json["pc"] = _frame.pc()
                _frame_json["function"] = _name
                _frame_json["file"] = {}
                if _function is not None:
                    _frame_json["line"] = _frame.find_sal().line
                    _frame_json["file"]["name"] = _function.symtab.filename
                    _frame_json["file"]["path"] = _function.symtab.fullname()
                else:
                    _frame_json["file"] = False

                backtrace_json.append(_frame_json)

            thread["frame"] = {}
            thread["frame"]["file"] = file
            thread["frame"]["line"] = line
            thread["frame"]["function"] = function_name
            thread["frame"]["backtrace"] = backtrace_json

        state["inferior"]["threads"].append(thread)

    if th0 is not None:
        th0.switch()

        if not th0.is_running():
            stack = backTraceFrame(gdb.newest_frame())
            selected_frames = api.globalvars.debugFlags.get(api.flags.AtomicDebugFlags.SELECTED_FRAMES)

            selected_frame = False

            for _ptid, _selected_frame in selected_frames.items():
                if _ptid == th0.ptid:
                    is_selected = False

                    for _frame in stack:
                        if _selected_frame == _frame.pc():
                            selected_frame = _frame
                            _frame.select()
                            is_selected = True
                            break

                    if not is_selected:
                        del selected_frames[_ptid]

                    break

            if not selected_frame:
                try:
                    selected_frame = gdb.selected_frame()
                except gdb.error:
                    selected_frame = False

            if selected_frame:
                try:
                    block = selected_frame.block()
                    function = block.function
                except RuntimeError as e:
                    block = False
                    function = False

                if function:
                    file = function.symtab.filename
                    path = function.symtab.fullname()
                    line = function.line
                    function_name = str(function.name)
                else:
                    file = False
                    path = False
                    line = False
                    function_name = str(selected_frame.name())

                backtrace = backTraceFrame(selected_frame)

                backtrace_json = []
                for _stack_frame in backtrace:
                    _name = _stack_frame.name()
                    _function = _stack_frame.function()

                    _stack_frame_json = {}
                    _stack_frame_json["pc"] = selected_frame.pc()
                    _stack_frame_json["function"] = _name
                    _stack_frame_json["file"] = {}
                    if _function is not None:
                        _stack_frame_json["line"] = _stack_frame.find_sal().line
                        _stack_frame_json["file"]["name"] = _function.symtab.filename
                        _stack_frame_json["file"]["path"] = _function.symtab.fullname()
                    else:
                        _stack_frame_json["file"] = False

                    backtrace_json.append(_stack_frame_json)

                variables = []

                try:
                    try:
                        block = selected_frame.block()
                    except RuntimeError:
                        block = False

                    while block:
                        for symbol in block:
                            if (symbol.is_argument or symbol.is_variable) and (symbol.name not in variables):
                                try:
                                    value = symbol.value(selected_frame)
                                except Exception as e:
                                    util.verbose("[Error]", e)

                                try:
                                    variable = getVariableByExpression(symbol.name, no_error=True).serializable()
                                    variables.append(variable)
                                except:
                                    pass


                        block = block.superblock
                except Exception as e:
                    util.verbose(e, traceback.format_exc())

                state["selected_frame"] = {}
                state["selected_frame"]["pc"] = selected_frame.pc()
                if file:
                    state["selected_frame"]["file"] = {}
                    state["selected_frame"]["file"]["name"] = file
                    state["selected_frame"]["file"]["path"] = path
                else:
                    state["selected_frame"]["file"] = False
                state["selected_frame"]["line"] = line
                state["selected_frame"]["function"] = function_name
                state["selected_frame"]["backtrace"] = backtrace_json
                state["selected_frame"]["variables"] = variables
                state["selected_frame"]["disassembly"] = disassembleFrame()
            else:
                state["selected_frame"] = False
        else:
            state["selected_frame"] = False

    state["inferior"]["threads"].reverse()

    return state

@threadSafe(no_interrupt=True)
def getBreakpoints():
    """
    Returns JSON-serializable breakpoints list.
    """

    breakpoints = []

    for _breakpoint in gdb.breakpoints():
        _breakpoint_json = {}
        _breakpoint_json["number"] = _breakpoint.number
        _breakpoint_json["enabled"] = _breakpoint.enabled
        _breakpoint_json["location"] = _breakpoint.location
        _breakpoint_json["expression"] = _breakpoint.expression
        _breakpoint_json["condition"] = _breakpoint.condition
        _breakpoint_json["thread"] = _breakpoint.thread

        if isinstance(_breakpoint.location, str) and (_breakpoint.location.__len__() > 1) and (_breakpoint.location[0] == "*"):
            try: _breakpoint_json["assembly"] = gdb.execute("x/i "+str(_breakpoint.location[1:]), to_string=True)
            except: pass

        breakpoints.append(_breakpoint_json)

    return breakpoints

@threadSafe(no_interrupt=True)
def addBreakpoint(file=None, line=None, address=None):
    thread = gdb.selected_thread()

    if thread:
        is_running = gdb.selected_thread().is_running()
    else:
        is_running = False

    if (file is not None) and (line is not None):
        if is_running:
            api.globalvars.debugFlags.set(api.flags.AtomicDebugFlags.IS_INTERRUPTED_FOR_BREAKPOINT_ADD, {
                "file": file,
                "line": line,
            })

            gdb.execute("interrupt")
        else:
            bp = Breakpoint(
                source = file,
                line = line
            )
        
        return
    
    if is_running:
        api.globalvars.debugFlags.set(api.flags.AtomicDebugFlags.IS_INTERRUPTED_FOR_BREAKPOINT_ADD, {
            "address": address
        })

        gdb.execute("interrupt")
    else:
        bp = Breakpoint(
            address = address
        )

@threadSafe(no_interrupt=True)
def getBreakpoint(num):
    """
    Returns gdb.Breakpoint() object by gdb.Breakpoint().num.
    """

    num = int(num)

    for bp in gdb.breakpoints():
        if bp.number == num:
            return bp

    return False

@threadSafe(no_interrupt=True)
def delBreakpoint(bp):
    """
    Deletes GDBFrontend.Breakpoint object.
    """

    thread = gdb.selected_thread()

    if thread:
        is_running = gdb.selected_thread().is_running()
    else:
        is_running = False

    if is_running:
        api.globalvars.debugFlags.set(api.flags.AtomicDebugFlags.IS_INTERRUPTED_FOR_BREAKPOINT_DEL, bp)
        gdb.execute("interrupt")
    else:
        bp.delete()

@threadSafe(no_interrupt=True)
def setBreakpointCondition(bp, condition):
    """
    Sets GDBFrontend.Breakpoint's condition.
    """

    thread = gdb.selected_thread()

    if thread:
        is_running = gdb.selected_thread().is_running()
    else:
        is_running = False
    
    if is_running:
        api.globalvars.debugFlags.set(api.flags.AtomicDebugFlags.IS_INTERRUPTED_FOR_BREAKPOINT_MOD, {
            "breakpoint": bp,
            "condition": condition
        })
        gdb.execute("interrupt")
    else:
        try:
            bp.condition = condition
        except gdb.error as e:
            print(e, traceback.format_exc())

@threadSafe(no_interrupt=True)
def setBreakpointEnabled(bp, is_enabled):
    """
    Sets GDBFrontend.Breakpoint's enabled/disabled.
    """

    thread = gdb.selected_thread()

    if thread:
        is_running = gdb.selected_thread().is_running()
    else:
        is_running = False
    
    if is_running:
        api.globalvars.debugFlags.set(api.flags.AtomicDebugFlags.IS_INTERRUPTED_FOR_BREAKPOINT_SET, {
            "breakpoint": bp,
            "is_enabled": is_enabled
        })
        gdb.execute("interrupt")
    else:
        try:
            bp.enabled = is_enabled
        except gdb.error as e:
            print(e, traceback.format_exc())

@threadSafe(no_interrupt=True)
def getFiles():
    """
    Returns GDB.objfile objects in a list.
    """

    objfiles = []

    for _file in gdb.objfiles():
        objfiles.append({
            "name": _file.filename
        })

    return objfiles

@threadSafe(no_interrupt=True)
def getSources():
    """
    Returns all source files as serializable from GDB.
    """

    try:
        sources = []
        
        lines = gdb.execute("i sources", to_string=True).splitlines()
        
        for line in lines:
            files = line.split(",")

            for file in files:
                file = file.strip()

                if file.startswith("/"):
                    sources.append(file)
        
        return sources
    except gdb.error as e:
        return []
    except Exception as e:
        util.verbose("[Error] An error occured:", e)
        return []

@threadSafe(no_interrupt=True)
def run(args=""):
    is_running = True

    try:
        is_running = gdb.selected_inferior().threads().__len__() > 0
    except gdb.error:
        gdb.execute("kill")
    finally:
        if is_running:
            gdb.execute("kill")
    
    api.globalvars.dont_emit_until_stop_or_exit = True

    try:
        if args == "":
            gdb.execute("set args")
        else:
            gdb.execute("set args " + args)
        
        gdb.execute("r")
    except gdb.error as e:
        print("[Error] " + str(e))
        api.globalvars.dont_emit_until_stop_or_exit = False

@threadSafe(no_interrupt=True)
def pause():
    try: gdb.execute("interrupt")
    except gdb.error as e: print("[Error] " + str(e))

@threadSafe(no_interrupt=True)
def cont():
    try: gdb.execute("c")
    except gdb.error as e: print("[Error] " + str(e))

@threadSafe(no_interrupt=True)
def stepOver():
    try: gdb.execute("n")
    except gdb.error as e: print("[Error] " + str(e))

@threadSafe(no_interrupt=True)
def step():
    try: gdb.execute("s")
    except gdb.error as e: print("[Error] " + str(e))

@threadSafe(no_interrupt=True)
def stepInstruction():
    try: gdb.execute("si")
    except gdb.error as e: print("[Error] " + str(e))

@threadSafe(no_interrupt=True)
def switchThread(global_num):
    """
    Switches between threads by gdb.Thread().global_num.
    """

    global_num = int(global_num)

    inferior = gdb.selected_inferior()
    threads = inferior.threads()

    for _thread in threads:
        if _thread.global_num == global_num:
            _thread.switch()
            break

@threadSafe(no_interrupt=True)
def backTraceFrame(frame):
    """
    Returns stack frames upper from given frame in order of oldest to newest.
    """

    trace = []
    recursion_num = 0

    def _back(frame):
        nonlocal recursion_num
        
        if recursion_num > settings.MAX_RECURSIONS:
            return
        
        recursion_num += 1

        parent = frame.older()

        if parent is not None:
            trace.append(parent)
            _back(parent)

    trace.append(frame)
    _back(frame)

    return trace

@threadSafe(no_interrupt=True)
def selectFrame(pc):
    """
    Select frame by given PC.
    PC registers for all frames maybe got from getState() once stop event.
    """

    is_switched = False

    thread = gdb.selected_thread()

    newest_frame = gdb.newest_frame()
    stack = backTraceFrame(newest_frame)

    for _frame in stack:
        if _frame.pc() == pc:
            _frame.select()

            frames = api.globalvars.debugFlags.get(api.flags.AtomicDebugFlags.SELECTED_FRAMES)
            frames[thread.ptid] = _frame.pc()

            is_switched = True
            break

    return is_switched

@threadSafe(no_interrupt=True)
def signal(posix_signal):
    """
    Sends given posix-signal to application.
    """

    try:
        gdb.execute("signal " + posix_signal)
    except Exception as e:
        print("[Error]", e)

@threadSafe(no_interrupt=True)
def terminate():
    """
    Terminates the application.
    """

    util.verbose("api.debug.terminate()")

    is_running = api.globalvars.debugFlags.get(api.flags.AtomicDebugFlags.IS_RUNNING)

    if is_running:
        try:
            api.globalvars.debugFlags.set(api.flags.AtomicDebugFlags.IS_INTERRUPTED_FOR_TERMINATE, True)
            gdb.execute("interrupt")
        except Exception as e:
            print("[Error]", e)
            api.globalvars.debugFlags.set(api.flags.AtomicDebugFlags.IS_INTERRUPTED_FOR_TERMINATE, False)
    else:
        try:
            gdb.execute("kill")
        except Exception as e:
            print("[Error]", e)
            return

@threadSafe(no_interrupt=True)
def resolveTerminalType(ctype):
    """
    Returns terminal C-type of given type.
    """

    while True:
        try:
            ctype = ctype.target()
        except:
            break

    return ctype

@threadSafe(no_interrupt=True)
def resolveTypeTree(ctype):
    """
    Returns C-type tree of given type.
    """

    tree = [ctype]

    while True:
        try:
            ctype = ctype.target()
        except:
            break

        tree.append(ctype)

    return tree

@threadSafe(no_interrupt=True)
def resolveNonPointer(tree):
    """
    Returns first non-ptr C type on type tree.
    """

    for ctype in tree:
        if ctype.code != gdb.TYPE_CODE_PTR:
            return ctype

@threadSafe(no_interrupt=True)
def serializableTypeTree(tree):
    """
    Returns C-type tree of given type.
    """

    return [serializableType(ctype) for ctype in tree]

@threadSafe(no_interrupt=True)
def serializableType(ctype):
    """
    Returns serializable dict of C type.
    """

    serializable = {}
    if "alignof" in dir(ctype):
        serializable["alignof"] = ctype.alignof
    serializable["code"] = ctype.code
    serializable["name"] = ctype.name
    serializable["sizeof"] = ctype.sizeof
    serializable["tag"] = ctype.tag
    serializable["is_pointer"] = ctype.code == gdb.TYPE_CODE_PTR

    return serializable

@threadSafe(no_interrupt=True)
def serializableRepresentation(value):
    """
    Returns serializable value to string representation dict from gdb.Value.
    """

    serializable = {}

    try:
        serializable["value"] = value.lazy_string(length=settings.MAX_BYTES_TO_FETCH).value().string()
        serializable["is_nts"] = True
    except gdb.error as e:
        serializable["is_nts"] = False
        serializable["value"] = str(value)
    except UnicodeDecodeError as e:
        serializable["is_nts"] = False
        serializable["value"] = str(value)

    return serializable

def getSerializableArrayItems(value, circular_expression=False):
    members = []

    if value.type.code != gdb.TYPE_CODE_ARRAY:
        return members

    try:
        if str(value) == "0x0":
            return None
    except gdb.error as e:
        util.verbose(e, traceback.format_exc())
        return []

    try:
        target_type = value.type.target()
    except Exception as e:
        util.verbose(e, traceback.format_exc())
        return []

    try:
        for i in range(int(value.type.sizeof / target_type.sizeof)):
            if i > settings.MAX_SERIALIZED_ARRAY_ITEMS:
                break
            
            memberValue = value[i]
            
            member = {}
            member["value"] = str(memberValue)
            member["array_index"] = i

            if circular_expression:
                member["expression"] = circular_expression + "[" + str(i) + "]"
                member["name"] = member["expression"]
            else:
                member["expression"] = False
                member["name"] = "*(" + str(memberValue.address) + " + " + str(i) + ")"
            
            member["is_pointer"] = target_type.code == gdb.TYPE_CODE_PTR
            member["address"] = str(memberValue.address) if memberValue.address else "0x0"
            member["type"] = serializableType(memberValue.type)
            member["type"]["terminal"] = serializableType(resolveTerminalType(memberValue.type))
            member["type_tree"] = serializableTypeTree(resolveTypeTree(memberValue.type))
            member["parent_type"] = serializableTypeTree(resolveTypeTree(memberValue.type))

            members.append(member)
    except Exception as e:
        util.verbose(e, traceback.format_exc())
        return []
    
    return members

def getSerializableVectorItems(value, circular_expression=False):
    members = []

    try:
        if str(value) == "0x0":
            return None
    except gdb.error as e:
        util.verbose(e, traceback.format_exc())
        return []

    try:
        _M_start = value['_M_impl']['_M_start']
        
        i = 0

        while _M_start != value['_M_impl']['_M_finish']:
            if i > settings.MAX_SERIALIZED_ARRAY_ITEMS:
                break
            
            memberValue = _M_start
            
            member = {}
            member["value"] = str(memberValue.dereference())
            member["array_index"] = i

            if circular_expression:
                member["expression"] = circular_expression + "[" + str(i) + "]"
                member["name"] = member["expression"]
            else:
                member["expression"] = False
                member["name"] = "*(" + str(memberValue.address) + " + " + str(i) + ")"
            
            member["is_pointer"] = False
            member["address"] = hex(int(_M_start))
            member["type"] = serializableType(memberValue.type)
            member["type"]["terminal"] = serializableType(resolveTerminalType(memberValue.type))
            member["type_tree"] = serializableTypeTree(resolveTypeTree(memberValue.type))
            member["parent_type"] = serializableTypeTree(resolveTypeTree(memberValue.type))

            members.append(member)
            i += 1
            _M_start += 1
    except Exception as e:
        util.verbose(e, traceback.format_exc())
        return []
    
    return members

def Nim__getSerializableArrayItems(value, circular_expression=False):
    members = []

    try:
        if str(value) == "0x0":
            return None
    except gdb.error as e:
        util.verbose(e, traceback.format_exc())
        return []

    try:
        target_type = resolveTerminalType(value.type)
    except Exception as e:
        util.verbose(e, traceback.format_exc())
        return []

    try:
        for i in range(int(value.type.sizeof / target_type.sizeof)):
            if i > settings.MAX_SERIALIZED_ARRAY_ITEMS:
                break
            
            memberValue = value[i]
            
            member = {}
            member["value"] = str(memberValue)
            member["array_index"] = i

            if circular_expression:
                member["expression"] = circular_expression + "[" + str(i) + "]"
                member["name"] = member["expression"]
            else:
                member["expression"] = False
                member["name"] = "*(" + str(memberValue.address) + " + " + str(i) + ")"
            
            member["is_pointer"] = target_type.code == gdb.TYPE_CODE_PTR
            member["address"] = str(memberValue.address) if memberValue.address else "0x0"
            member["type"] = serializableType(memberValue.type)
            member["type"]["terminal"] = serializableType(resolveTerminalType(memberValue.type))
            member["type_tree"] = serializableTypeTree(resolveTypeTree(memberValue.type))
            member["parent_type"] = serializableTypeTree(resolveTypeTree(memberValue.type))

            members.append(member)
    except Exception as e:
        util.verbose(e, traceback.format_exc())
        return []
    
    return members

def Nim__getSerializableSequenceItems(value, circular_expression=False):
    members = []

    try:
        if str(value) == "0x0":
            return None
    except gdb.error as e:
        util.verbose(e, traceback.format_exc())
        return []

    try:
        target_type = resolveTerminalType(value.type)
    except Exception as e:
        util.verbose(e, traceback.format_exc())
        return []

    try:
        for i in range(int(value["Sup"]["len"])):
            if i > settings.MAX_SERIALIZED_ARRAY_ITEMS:
                break
            
            memberValue = value["data"][i]
            
            member = {}
            member["value"] = str(memberValue)
            member["array_index"] = i

            if circular_expression:
                member["expression"] = circular_expression + "[" + str(i) + "]"
                member["name"] = member["expression"]
            else:
                member["expression"] = False
                member["name"] = "*(" + str(memberValue.address) + " + " + str(i) + ")"
            
            member["is_pointer"] = target_type.code == gdb.TYPE_CODE_PTR
            member["address"] = str(memberValue.address) if memberValue.address else "0x0"
            member["type"] = serializableType(memberValue.type)
            member["type"]["terminal"] = serializableType(resolveTerminalType(memberValue.type))
            member["type_tree"] = serializableTypeTree(resolveTypeTree(memberValue.type))
            member["parent_type"] = serializableTypeTree(resolveTypeTree(memberValue.type))

            members.append(member)
    except Exception as e:
        util.verbose(e, traceback.format_exc())
        return []
    
    return members

@threadSafe(no_interrupt=True)
def getSerializableStructMembers(value, ctype, parent_expression=False):
    members = []

    if ctype.code not in [gdb.TYPE_CODE_STRUCT, gdb.TYPE_CODE_UNION]:
        return members

    try:
        if str(value) == "0x0":
            return None
    except gdb.error as e:
        return None

    for _field in ctype.fields():
        member = {}
        try:
            memberValue = value[_field]
        except Exception as e:
            util.verbose("Member value error:", e)
            continue

        if _field.is_base_class:
            base_members = getSerializableStructMembers(memberValue, _field.type, parent_expression)
            members.extend(base_members)
            continue

        if hasattr(_field, "bitpos"):
            member["bitpos"] = _field.bitpos

        if hasattr(_field, "enumval"):
            member["enumval"] = _field.enumval

        try:
            member["value"] = memberValue.lazy_string(length=settings.MAX_BYTES_TO_FETCH).value().string()
            member["is_nts"] = True
        except gdb.error as e:
            try:
                member["is_nts"] = False
                member["value"] = str(memberValue)
            except gdb.MemoryError as e:
                continue
        except UnicodeDecodeError as e:
            member["is_nts"] = False
            member["value"] = str(memberValue)

        member["name"] = _field.name
        member["is_pointer"] = _field.type.code == gdb.TYPE_CODE_PTR
        member["address"] = str(memberValue.address) if memberValue.address else "0x0"
        member["is_base_class"] = _field.is_base_class
        member["artificial"] = _field.artificial
        member["bitsize"] = _field.bitsize
        member["type"] = serializableType(_field.type)
        member["type"]["terminal"] = serializableType(resolveTerminalType(_field.type))
        member["type_tree"] = serializableTypeTree(resolveTypeTree(_field.type))
        member["parent_type"] = serializableTypeTree(resolveTypeTree(_field.type))

        if parent_expression and _field.name:
            member["expression"] = parent_expression + "." + _field.name
        else:
            member["expression"] = _field.name

        members.append(member)

    return members

@threadSafe(no_interrupt=True)
def getVariableInBlock(name):
    """
    Returns C structure/union variable with members
    or pointers with what they point to inside current block.
    """

    frame = gdb.selected_frame()

    try:
        block = frame.block()
    except RuntimeError:
        return False

    for symbol in block:
        if symbol.name == name:
            return Variable(frame, symbol)

    return False

@threadSafe(no_interrupt=True)
def getVariableByExpression(expression, no_error=True):
    """
    Returns C member (api.debug.Variable) on current frame
    by given variable[->member](s) names expression or any expression.
    """

    try:
        value = gdb.parse_and_eval(expression)
        variable = Variable(
            frame=gdb.selected_frame(),
            symbol=False,
            value=value,
            expression=expression
        )
    except gdb.error as e:
        if config.VERBOSE or not no_error:
            print(e, traceback.format_exc())

        return None
    except Exception as e:
        util.verbose(e, traceback.format_exc())
        return None

    return variable

@threadSafe(no_interrupt=True)
def getVariable(name, no_error=True):
    return getVariableByExpression(name, no_error=no_error)

@threadSafe(no_interrupt=True)
def disassemble(start, end):
    """
    Returns serializable instructions from start adress to end address.
    """

    return gdb.selected_frame().architecture().disassemble(start, end)

@threadSafe(no_interrupt=True)
def iterateAsmToRet():
    """
    Returns instructions to return or max limit.
    """

    frame = gdb.selected_frame()
    arch = frame.architecture()

    instructions = []
    length = 0

    try:
        addr = int(re.findall("(0x.+) <", gdb.parse_and_eval(frame.name()).__str__())[0], 16)

        while True:
            instruction = arch.disassemble(addr)[0]
            instruction["asm"] = str(instruction["asm"]).strip()

            instructions.append(instruction)
            length += 1

            if length >= config.MAX_ITERATIONS_TO_RET: break
            if instruction["asm"].startswith("ret"): break
            if instruction["asm"].startswith("iret"): break
            if instruction["asm"].startswith("retn"): break
            if instruction["asm"].startswith("retf"): break
            if instruction["asm"].startswith("iretx"): break
            if instruction["asm"].startswith("sysret"): break
            
            addr += int(instruction["length"])
    except:
        return instructions

    return instructions

@threadSafe(no_interrupt=True)
def disassembleFrame():
    """
    Returns serializable instructions in selected frame.
    """

    frame = gdb.selected_frame()
    
    try:
        block = frame.block()
    except:
        try:
            instructions = iterateAsmToRet()
        except:
            util.verbose("[Error] Can not disassemble frame.")
            instructions = []

        return instructions

    pc = re.findall("\\s(0.+?)\\s+", gdb.execute("i register pc", to_string=True))

    if pc and len(pc) > 0:
        pc = int(pc[0], 16)
        
        start = block.start
        end = block.end-1

        size = end - start

        if size > config.MAX_ITERATIONS_TO_RET:
            start = pc - int(config.MAX_ITERATIONS_TO_RET/2)
            
            if start < block.start:
                start = block.start
            
            end = pc + int(config.MAX_ITERATIONS_TO_RET/2)
            
            if end > block.end-1:
                end = block.end-1

        return disassemble(start, end)
    else:
        return disassemble(block.start, block.end-1)

class Breakpoint(gdb.Breakpoint):
    @threadSafe(no_interrupt=True)
    def __init__(
        self,
        source = None,
        line = None,
        address = None
    ):
        if (source is not None) and (line is not None):
            gdb.Breakpoint.__init__(
                self,
                source = source,
                line = line
            )

            return
        
        gdb.Breakpoint.__init__(
            self,
            "*" + str(address)
        )

    def stop(self):
        return True

class Variable():
    """
    GDBFrontend's serializable variable/member class.
    """
    
    def __init__(self, frame, symbol=False, value=False, expression=False):
        self.frame = frame
        self.symbol = symbol
        self.value = value
        self.expression = expression

        if self.expression:
            self.name = self.expression.split(".")[-1].split("->")[-1]
        else:
            self.name = self.symbol.name

    @threadSafe(no_interrupt=True)
    def serializable(self):
        """
        Returns given lib.types.Variable object as JSON-serializable dict.
        """

        frame = self.frame
        symbol = self.symbol
        if symbol:
            value = symbol.value(frame)
        else:
            value = self.value
        
        try:
            block = frame.block()
        except RuntimeError as e:
            util.verbose("[Error]", str(e))
            return False

        serializable = {}
        serializable["is_global"] = block.is_global
        serializable["name"] = self.name
        serializable["expression"] = self.expression
        serializable["is_pointer"] = value.type.code == gdb.TYPE_CODE_PTR
        serializable["is_optimized_out"] = value.is_optimized_out
        try: serializable["address"] = str(value.address) if value.address else "0x0"
        except: serializable["address"] = "0x0"

        try:
            if not value.is_optimized_out:
                serializable["value"] = value.lazy_string(length=settings.MAX_BYTES_TO_FETCH).value().string()
                serializable["is_nts"] = True
            else:
                serializable["value"] = '<optimized out>'
                serializable["is_nts"] = False
        except gdb.error as e:
            try:
                serializable["is_nts"] = False
                serializable["value"] = str(value)
            except gdb.MemoryError as e:
                util.verbose(e, traceback.format_exc())
                return None
            except gdb.error as e:
                util.verbose(e, traceback.format_exc())
        except UnicodeDecodeError as e:
            serializable["is_nts"] = False
            serializable["value"] = str(value)
        except Exception as e:
            if config.VERBOSE:
                util.verbose(e, traceback.format_exc())
            
            return None

        if value.type:
            terminalType = resolveTerminalType(value.type)
            type_tree = resolveTypeTree(value.type)

            serializable["type"] = serializableType(value.type)
            serializable["type"]["terminal"] = serializableType(terminalType)
            serializable["type_tree"] = serializableTypeTree(type_tree)

            if value.type.code == gdb.TYPE_CODE_ARRAY:
                serializable["members"] = getSerializableArrayItems(value, circular_expression=self.expression)
            else:
                is_vector = True

                try:
                    _M_impl = value["_M_impl"]
                    _M_start = _M_impl['_M_start']
                except:
                    is_vector = False

                if is_vector:
                    serializable["members"] = getSerializableVectorItems(value, circular_expression=self.expression)
                elif isinstance(value.type.name, str) and value.type.name.startswith("tyArray__"):
                    serializable["members"] = Nim__getSerializableArrayItems(value, circular_expression=self.expression)
                elif isinstance(terminalType.name, str) and terminalType.name.startswith("tySequence__"):
                    serializable["members"] = Nim__getSerializableSequenceItems(value, circular_expression=self.expression)
                else:
                    serializable["members"] = getSerializableStructMembers(value, terminalType, parent_expression=self.expression)
        else:
            serializable["type"] = False

        return serializable

@threadSafe(no_interrupt=True)
def getRegisters():
    try:
        selected_thread = gdb.selected_thread()
    except Exception as e:
        util.verbose(e, traceback.format_exc())
        return {}
    
    if (not selected_thread) or gdb.selected_thread().is_running():
        return {}
    
    result = {}

    try:
        lines = gdb.execute("i registers", to_string=True).splitlines()
    except gdb.error:
        return {}

    for line in lines:
        vals = re.findall("(.+?)\\s+(.+?)\\s+(.+)", line, flags=re.IGNORECASE)
        
        if len(vals) < 1: continue
        if len(vals[0]) < 3: continue

        vals = vals[0]

        try:
            is_changed = vals[0] in api.globalvars.changed_registers and vals[1] != api.globalvars.changed_registers[vals[0]][1]
        except BrokenPipeError:
            api.globalvars.changed_registers = multiprocessing.Manager().dict()
            is_changed = False

        result[vals[0]] = (
            vals[1],
            vals[2],
            is_changed
        )

        api.globalvars.changed_registers[vals[0]] = vals[1]

    return result

@threadSafe(no_interrupt=True)
def attach(pid):
    api.globalvars.dont_emit_until_stop_or_exit = True
    
    try:
        gdb.execute("attach " + str(pid))
    except gdb.error as e:
        api.globalvars.dont_emit_until_stop_or_exit = True
        print("Could not attach to process: %s (%s)" % (pid, str(e)))