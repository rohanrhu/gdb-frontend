# -*- coding: utf-8 -*-
#
# gdb-frontend is a easy, flexible and extensionable gui debugger
#
# https://github.com/rohanrhu/gdb-frontend
# https://oguzhaneroglu.com/projects/gdb-frontend/
#
# Licensed under GNU/GPLv3
# Copyright (C) 2019, Oğuzhan Eroğlu (https://oguzhaneroglu.com/) <rohanrhu2@gmail.com>

import json
import time
import socket
import importlib

import api.debug

gdb = importlib.import_module("gdb")

def run(request, params):
    if params is None: params = {}

    result_json = {}
    result_json["ok"] = True

    handled = False

    def _gdb_on_new_objfile(event):
        nonlocal handled

        print("EVENT:", event)
        result_json["event"] = "new_objfile"
        result_json["file"] = {}
        result_json["file"]["name"] = event.new_objfile.filename
        result_json["state"] = api.debug.getState()

        handled = True

    def _gdb_on_clear_objfiles(event):
        nonlocal handled

        print("EVENT:", event)
        result_json["event"] = "clear_objfiles"
        result_json["state"] = api.debug.getState()

        handled = True

    def _gdb_on_breakpoint_created(event):
        nonlocal handled

        print("EVENT:", event)
        result_json["event"] = "breakpoint_created"
        result_json["state"] = api.debug.getState()

        handled = True

    def _gdb_on_breakpoint_modified(event):
        nonlocal handled

        print("EVENT:", event)
        result_json["event"] = "breakpoint_modified"
        result_json["state"] = api.debug.getState()

        handled = True

    def _gdb_on_breakpoint_deleted(event):
        nonlocal handled

        print("EVENT:", event)
        result_json["event"] = "breakpoint_deleted"
        result_json["state"] = api.debug.getState()

        handled = True

    gdb.events.new_objfile.connect(_gdb_on_new_objfile)
    gdb.events.clear_objfiles.connect(_gdb_on_clear_objfiles)
    gdb.events.breakpoint_created.connect(_gdb_on_breakpoint_created)
    gdb.events.breakpoint_modified.connect(_gdb_on_breakpoint_modified)
    gdb.events.breakpoint_deleted.connect(_gdb_on_breakpoint_deleted)

    def _off():
        gdb.events.new_objfile.disconnect(_gdb_on_new_objfile)
        gdb.events.clear_objfiles.disconnect(_gdb_on_clear_objfiles)
        gdb.events.breakpoint_created.disconnect(_gdb_on_breakpoint_created)
        gdb.events.breakpoint_modified.disconnect(_gdb_on_breakpoint_modified)
        gdb.events.breakpoint_deleted.disconnect(_gdb_on_breakpoint_deleted)

    while not handled:
        time.sleep(0.5)
        try:
            request.wfile.write(b"")
        except socket.error:
            _off()
            return

    request.send_response(200)
    request.send_header("Content-Type", "application/json; charset=utf-8")
    request.end_headers()
    try:
        request.wfile.write(json.dumps(result_json).encode())
    except BrokenPipeError:
        pass