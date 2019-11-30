# -*- coding: utf-8 -*-
#
# gdb-frontend is a easy, flexible and extensionable gui debugger
#
# https://github.com/rohanrhu/gdb-frontend
# https://oguzhaneroglu.com/projects/gdb-frontend/
#
# Licensed under MIT
# Copyright (C) 2019, Oğuzhan Eroğlu (https://oguzhaneroglu.com/) <rohanrhu2@gmail.com>

import os
import sys
import shutil

import statics
import config
import util

path = os.path.dirname(os.path.realpath(__file__))

gdb_executable = "gdb"
tmux_executable = "./bin/tmux"

import subprocess

if shutil.which("tmux"):
    tmux_executable = "tmux"
else:
    print("[Notice] Tmux is not found in PATH. Fallback to built-in tmux.")

def argHandler_gdbExecutable(path):
    global gdb_executable

    if not os.path.exists(path):
        print("[Error] GDB executable: "+path+" not found.\n")
        exit(0)

    gdb_executable = path

def argHandler_help():
    global gdb_executable

    print("GDBFrontend is a easy, flexible and extensionable gui debugger.\n")
    print("Options:")
    print("  --help, -h:\t\t\t\tShows this help message.")
    print("  --version, -v:\t\t\tShows version.")
    print("  --gdb-executable=PATH, -g PATH:\tSpecifies GDB executable path (Default is \"gdb\" command on PATH environment variable.)")
    print("")

    exit(0)

def argHandler_version():
    global gdb_executable

    print("GDBFrontend is a easy, flexible and extensionable gui debugger.\n")
    print("Version: " + util.versionString(statics.VERSION))
    print("")

    exit(0)

args = [
    ["--help", "-h", argHandler_help, False],
    ["--version", "-v", argHandler_version, False],
    ["--gdb-executable", "-g", argHandler_gdbExecutable, True]
]

value_expected_arg = []

for _user_arg in sys.argv[1:]:
    is_exists = False

    if value_expected_arg:
        value_expected_arg[2](_user_arg)
        value_expected_arg = []

        continue

    for _arg in args:
        if len(_user_arg) > 2 and _user_arg[:2] == "--":
            arg = _user_arg.split("=")
            val = "=".join(arg[1:])
            arg = arg[0]

            if arg == _arg[0]:
                is_exists = True

                if _arg[3] and val == "":
                    print("Missing value for option:", _arg[0])
                    exit(0)

                if _arg[3]:
                    _arg[2](val)
                else:
                    _arg[2]()

                break
        elif _user_arg == _arg[1]:
            is_exists = True

            if _arg[3]:
                value_expected_arg = _arg
            else:
                _arg[2]()

            break

    if not is_exists:
        print("Invalid argument:", _user_arg)
        print("")
        argHandler_help()
        exit(0)

if value_expected_arg:
    print("Missing value for option:", value_expected_arg[1])
    exit(0)

try:
    os.system("LD_LIBRARY_PATH=\"/lib/x86_64-linux-gnu:/usr/lib/x86_64-linux-gnu:$(pwd)/bin/deps\" "+tmux_executable+" -f tmux.conf new-session -s gdb-frontend -d '"+gdb_executable+" -ex \"python import sys, os; sys.path.append(\\\""+path+"\\\"); import main\"; read;'")
    print("Listening on %s: http://127.0.0.1:%d/" % (config.HOST_ADDRESS, config.HTTP_PORT))
    print("|---------------------------------------------------------------------|")
    print(("| Open this address in web browser: \033[0;32;40mhttp://127.0.0.1:%d/terminal/\033[0m" % config.HTTP_PORT) + "   |")
    print("|---------------------------------------------------------------------|")
    os.system("LD_LIBRARY_PATH=\"/lib/x86_64-linux-gnu:/usr/lib/x86_64-linux-gnu:$(pwd)/bin/deps\" ./bin/gotty --config gotty.conf -a 127.0.0.1 -p "+str(config.GOTTY_PORT)+" -w "+tmux_executable+" a -t gdb-frontend")
    os.system("LD_LIBRARY_PATH=\"/lib/x86_64-linux-gnu:/usr/lib/x86_64-linux-gnu:$(pwd)/bin/deps\" "+tmux_executable+" kill-session -t gdb-frontend")
except KeyboardInterrupt as e:
    print("Keyboard interrupt.")

print("Stoped GDB-Frontend.")