# -*- coding: utf-8 -*-
#
# gdb-frontend is a easy, flexible and extensionable gui debugger
#
# https://github.com/rohanrhu/gdb-frontend
# https://oguzhaneroglu.com/projects/gdb-frontend/
#
# Licensed under GNU/GPLv3
# Copyright (C) 2019, Oğuzhan Eroğlu (https://oguzhaneroglu.com/) <rohanrhu2@gmail.com>

import importlib
import json
import time

import config
config.init()
import plugin
import util
import api.debug
import api.collabration
import api.flags
import api.globalvars
import api.collabration
import websocket
import terminal_daemon

gdb = importlib.import_module("gdb")

api.globalvars.init()
plugin.init()
api.collabration.init()

class GDBFrontendSocket(websocket.WebSocketHandler):
    cont_time = False
    screen_resolution = [0, 0]
    terminalDaemon = False
    
    def __init__(self, request, client_address, server):
        websocket.WebSocketHandler.__init__(self, request, client_address, server)
    
    def handleConnection(self):
        util.verbose(self.client_address[0], "is connected.")

        self.server.ws_clients.append(self)
        self.connectGDBEvents()

        util.verbose("Starting terminal daemon for client#%d" % self.client_id)

    def connectGDBEvents(self):
        gdb.events.new_objfile.connect(self.gdb_on_new_objfile)
        gdb.events.clear_objfiles.connect(self.gdb_on_clear_objfiles)
        gdb.events.breakpoint_created.connect(self.gdb_on_breakpoint_created)
        gdb.events.breakpoint_modified.connect(self.gdb_on_breakpoint_modified)
        gdb.events.breakpoint_deleted.connect(self.gdb_on_breakpoint_deleted)
        gdb.events.stop.connect(self.gdb_on_stop)
        gdb.events.new_thread.connect(self.gdb_on_new_thread)
        gdb.events.cont.connect(self.gdb_on_cont)
        gdb.events.exited.connect(self.gdb_on_exited)
        gdb.events.inferior_deleted.connect(self.gdb_on_inferior_deleted)
        gdb.events.new_inferior.connect(self.gdb_on_new_inferior)

    def disconnectGDBEvents(self):
        gdb.events.new_objfile.disconnect(self.gdb_on_new_objfile)
        gdb.events.clear_objfiles.disconnect(self.gdb_on_clear_objfiles)
        gdb.events.breakpoint_created.disconnect(self.gdb_on_breakpoint_created)
        gdb.events.breakpoint_modified.disconnect(self.gdb_on_breakpoint_modified)
        gdb.events.breakpoint_deleted.disconnect(self.gdb_on_breakpoint_deleted)
        gdb.events.stop.disconnect(self.gdb_on_stop)
        gdb.events.new_thread.disconnect(self.gdb_on_new_thread)
        gdb.events.cont.disconnect(self.gdb_on_cont)
        gdb.events.exited.disconnect(self.gdb_on_exited)
        gdb.events.inferior_deleted.disconnect(self.gdb_on_inferior_deleted)
        gdb.events.new_inferior.disconnect(self.gdb_on_new_inferior)

    def gdb_on_new_objfile(self, event):
        util.verbose("gdb_on_new_objfile()")

        api.globalvars.inferior_run_times[gdb.selected_inferior().num] = int(time.time())

        if api.globalvars.dont_emit_until_stop_or_exit: return

        def _mt():
            self.gdb_on_new_objfile__mT(event)
        
        gdb.post_event(_mt)

    def gdb_on_new_objfile__mT(self, event):
        response = {}

        response["event"] = "new_objfile"
        response["state"] = api.debug.getState()

        self.wsSend(json.dumps(response))

    def gdb_on_clear_objfiles(self, event):
        util.verbose("gdb_on_clear_objfiles()")

        if api.globalvars.dont_emit_until_stop_or_exit: return

        gdb.post_event(self.gdb_on_clear_objfiles__mT)

    def gdb_on_clear_objfiles__mT(self):
        response = {}

        response["event"] = "clear_objfiles"
        response["state"] = api.debug.getState()

        self.wsSend(json.dumps(response))

    def gdb_on_breakpoint_created(self, event):
        util.verbose("gdb_on_breakpoint_created()")

        gdb.post_event(self.gdb_on_breakpoint_created__mT)

    def gdb_on_breakpoint_created__mT(self):
        interrupted = api.globalvars.debugFlags.get(api.flags.AtomicDebugFlags.IS_INTERRUPTED_FOR_BREAKPOINT_ADD)

        if interrupted:
            pass
        else:
            response = {}

            response["event"] = "breakpoint_created"
            response["state"] = api.debug.getState()

            self.wsSend(json.dumps(response))

    def gdb_on_breakpoint_modified(self, event):
        util.verbose("gdb_on_breakpoint_modified()")

        gdb.post_event(self.gdb_on_breakpoint_modified__mT)

    def gdb_on_breakpoint_modified__mT(self):
        interrupted = api.globalvars.debugFlags.get(api.flags.AtomicDebugFlags.IS_INTERRUPTED_FOR_BREAKPOINT_MOD)
        interrupted = interrupted or api.globalvars.debugFlags.get(api.flags.AtomicDebugFlags.IS_INTERRUPTED_FOR_BREAKPOINT_SET)
        
        if interrupted:
            pass
        else:
            response = {}

            response["event"] = "breakpoint_modified"
            response["state"] = api.debug.getState()

            self.wsSend(json.dumps(response))

    def gdb_on_breakpoint_deleted(self, event):
        util.verbose("gdb_on_breakpoint_deleted()")

        if api.globalvars.dont_emit_until_stop_or_exit: return
        
        gdb.post_event(self.gdb_on_breakpoint_deleted__mT)

    def gdb_on_breakpoint_deleted__mT(self):
        interrupted = api.globalvars.debugFlags.get(api.flags.AtomicDebugFlags.IS_INTERRUPTED_FOR_BREAKPOINT_DEL)
        
        if interrupted:
            pass
        else:
            response = {}

            response["event"] = "breakpoint_deleted"
            response["state"] = api.debug.getState()

            self.wsSend(json.dumps(response))

    def gdb_on_stop(self, event):
        util.verbose("gdb_on_stop()")

        api.globalvars.dont_emit_until_stop_or_exit = False
        api.globalvars.step_time = time.time() * 1000 - self.cont_time
        
        gdb.post_event(self.gdb_on_stop__mT)

    def gdb_on_stop__mT(self):
        interrupted_for_terminate = api.globalvars.debugFlags.get(api.flags.AtomicDebugFlags.IS_INTERRUPTED_FOR_TERMINATE)
        interrupted_for_signal = api.globalvars.debugFlags.get(api.flags.AtomicDebugFlags.IS_INTERRUPTED_FOR_SIGNAL)
        interrupted_for_breakpoint_add = api.globalvars.debugFlags.get(api.flags.AtomicDebugFlags.IS_INTERRUPTED_FOR_BREAKPOINT_ADD)
        interrupted_for_breakpoint_del = api.globalvars.debugFlags.get(api.flags.AtomicDebugFlags.IS_INTERRUPTED_FOR_BREAKPOINT_DEL)
        interrupted_for_breakpoint_mod = api.globalvars.debugFlags.get(api.flags.AtomicDebugFlags.IS_INTERRUPTED_FOR_BREAKPOINT_MOD)
        interrupted_for_breakpoint_set = api.globalvars.debugFlags.get(api.flags.AtomicDebugFlags.IS_INTERRUPTED_FOR_BREAKPOINT_SET)

        if interrupted_for_terminate:
            util.verbose("Terminating for interrupt: TERMINATE.")

            api.globalvars.debugFlags.set(api.flags.AtomicDebugFlags.IS_INTERRUPTED_FOR_TERMINATE, False)
            try:
                gdb.execute("kill")
            except Exception as e:
                print("[Error] (GDBFrontendSocket.gdb_on_stop__mT)", e)
        elif interrupted_for_signal:
            try:
                util.verbose("Continuing for interrupt: SIGNAL.")
                gdb.execute("c")
            except Exception as e:
                print("[Error] (GDBFrontendSocket().gdb_on_stop__mT)", e)
        elif interrupted_for_breakpoint_add:
            util.verbose("Continuing for interrupt: BREAKPOINT_ADD.")

            bp = api.debug.Breakpoint(
                source = interrupted_for_breakpoint_add["file"],
                line = interrupted_for_breakpoint_add["line"]
            )

            api.globalvars.debugFlags.set(api.flags.AtomicDebugFlags.IS_INTERRUPTED_FOR_BREAKPOINT_ADD, False)

            try:
                gdb.execute("c")
            except Exception as e:
                print("[Error] (GDBFrontendSocket().gdb_on_stop__mT)", e)
        elif interrupted_for_breakpoint_del:
            util.verbose("Continuing for interrupt: BREAKPOINT_DEL.")

            interrupted_for_breakpoint_del.delete()

            api.globalvars.debugFlags.set(api.flags.AtomicDebugFlags.IS_INTERRUPTED_FOR_BREAKPOINT_DEL, False)

            try:
                gdb.execute("c")
            except Exception as e:
                print("[Error] (GDBFrontendSocket().gdb_on_stop__mT)", e)
        elif interrupted_for_breakpoint_mod:
            util.verbose("Continuing for interrupt: BREAKPOINT_MOD.")

            interrupted_for_breakpoint_mod["breakpoint"].condition = interrupted_for_breakpoint_mod["condition"]

            api.globalvars.debugFlags.set(api.flags.AtomicDebugFlags.IS_INTERRUPTED_FOR_BREAKPOINT_MOD, False)

            try:
                gdb.execute("c")
            except Exception as e:
                print("[Error] (GDBFrontendSocket().gdb_on_stop__mT)", e)
        elif interrupted_for_breakpoint_set:
            util.verbose("Continuing for interrupt: BREAKPOINT_SET.")

            interrupted_for_breakpoint_set["breakpoint"].enabled = interrupted_for_breakpoint_set["is_enabled"]

            api.globalvars.debugFlags.set(api.flags.AtomicDebugFlags.IS_INTERRUPTED_FOR_BREAKPOINT_SET, False)

            try:
                gdb.execute("c")
            except Exception as e:
                print("[Error] (GDBFrontendSocket().gdb_on_stop__mT)", e)
        else:
            response = {}

            response["event"] = "stop"
            response["state"] = api.debug.getState()

            self.wsSend(json.dumps(response))

    def gdb_on_new_thread(self, event):
        util.verbose("gdb_on_new_thread()")

        def _mt():
            self.gdb_on_new_thread__mT(event)

        gdb.post_event(_mt)

    def gdb_on_new_thread__mT(self, event):
        inferior_thread = event.inferior_thread
        
        if isinstance(inferior_thread, gdb.InferiorThread):
            api.globalvars.inferior_run_times[event.inferior_thread.inferior.num] = int(time.time())
        elif isinstance(inferior_thread, gdb.Inferior):
            api.globalvars.inferior_run_times[event.inferior_thread.num] = int(time.time())
        
        response = {}

        response["event"] = "new_thread"
        response["state"] = api.debug.getState()

        self.wsSend(json.dumps(response))

    def gdb_on_cont(self, event):
        util.verbose("gdb_on_cont()")

        self.cont_time = time.time() * 1000
        
        if api.globalvars.dont_emit_until_stop_or_exit: return
        
        gdb.post_event(self.gdb_on_cont__mT)

    def gdb_on_cont__mT(self):
        response = {}

        response["event"] = "cont"
        response["state"] = api.debug.getState()

        self.wsSend(json.dumps(response))

    def gdb_on_exited(self, event):
        util.verbose("gdb_on_exited()")

        api.globalvars.dont_emit_until_stop_or_exit = False
        api.globalvars.step_time = False

        def _mt():
            self.gdb_on_exited__mT(event)
        
        gdb.post_event(_mt)

    def gdb_on_exited__mT(self, event):
        response = {}

        del api.globalvars.inferior_run_times[event.inferior.num]

        api.globalvars.debugFlags.set(api.flags.AtomicDebugFlags.SELECTED_FRAMES, {})
        
        response["event"] = "exited"
        response["state"] = api.debug.getState()

        self.wsSend(json.dumps(response))

    def gdb_on_new_inferior(self, event):
        util.verbose("gdb_on_new_inferior()")

        api.globalvars.inferior_run_times[event.inferior.num] = int(time.time())

        if api.globalvars.dont_emit_until_stop_or_exit: return

        def _mt():
            self.gdb_on_new_inferior__mT(event)
        
        gdb.post_event(_mt)

    def gdb_on_new_inferior__mT(self, event):
        response = {}

        response["event"] = "new_inferior"
        response["state"] = api.debug.getState()

        self.wsSend(json.dumps(response))

    def gdb_on_inferior_deleted(self, event):
        util.verbose("gdb_on_inferior_deleted()")

        def _mt():
            self.gdb_on_inferior_deleted__mT(event)
        
        gdb.post_event(_mt)
        
    def gdb_on_inferior_deleted__mT(self, event):
        response = {}

        del api.globalvars.inferior_run_times[event.inferior.num]

        if api.globalvars.dont_emit_until_stop_or_exit: return

        response["event"] = "inferior_deleted"
        response["state"] = api.debug.getState()

        self.wsSend(json.dumps(response))

    def handleClose(self):
        util.verbose(self.client_address[0], "is disconnected.")

        if self.terminalDaemon:
            self.terminalDaemon.stop()

        if self in self.server.ws_clients:
            self.server.ws_clients.remove(self)

        self.disconnectGDBEvents()

    def emit(self, event, message={}):
        message["event"] = event
        self.wsSend(json.dumps(message))

    def handleMessage(self):
        if self.terminalDaemon and self.terminalDaemon.handleMessage():
            return
        
        message = json.loads(self.message)
        event = message["event"]

        if event == "start_terminal":
            self.terminalDaemon = terminal_daemon.TerminalDaemon(ws=self, terminal_command=["tmux", "a", "-t", config.TERMINAL_ID])
            self.terminalDaemon.start()
        elif event == "get_state":
            self.emit(message["return_event"], {
                "state": api.debug.getState()
            })
        elif event == "get_sources":
            self.emit(message["return_event"], {
                "state": {
                    "sources": api.debug.getSources()
                }
            })
        elif event == "get_registers":
            self.emit(message["return_event"], {
                "registers": api.debug.getRegisters()
            })
        elif event == "signal":
            api.debug.signal(message["signal"])
            self.emit(message["return_event"], {})
        elif event == "enhanced_collabration_enable":
            api.collabration.enableEnhancedCollabration()
        elif event == "enhanced_collabration_disable":
            api.collabration.disableEnhancedCollabration()
        elif event == "collabration_state":
            api.collabration.setState(message["state"], client_id=self.client_id)
        elif event == "collabration_state__scroll":
            api.collabration.setState__scroll(message["scroll_position"], client_id=self.client_id)
        elif event == "collabration_state__cursor":
            api.collabration.setState__cursor(message["cursor_position"], client_id=self.client_id)
        elif event == "collabration_state__watches":
            api.collabration.setState__watches(message["watches"], client_id=self.client_id)
        elif event == "collabration_state__draw_path":
            api.collabration.setState__draw_path(message["path"], client_id=self.client_id)
        elif event == "collabration_state__draw_clear":
            api.collabration.setState__draw_clear(client_id=self.client_id)

        for _plugin_name, _plugin in plugin.plugins.items():
            if hasattr(_plugin, "event"):
                _plugin.event(self, event, message)