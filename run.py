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

import config
import util

path = os.path.dirname(os.path.realpath(__file__))

try:
    os.system("LD_LIBRARY_PATH=\"/lib/x86_64-linux-gnu:/usr/lib/x86_64-linux-gnu:$(pwd)/bin/deps\" ./bin/tmux -f tmux.conf new-session -s gdb-frontend -d 'gdb -ex \"python import sys, os; sys.path.append(\\\""+path+"\\\"); import main\"; read;'")
    print("Listening on %s: http://127.0.0.1:%d/" % (config.HOST_ADDRESS, config.HTTP_PORT))
    print("|---------------------------------------------------------------------|")
    print(("| Open this address in web browser: \033[0;32;40mhttp://127.0.0.1:%d/terminal/\033[0m" % config.HTTP_PORT) + "   |")
    print("|---------------------------------------------------------------------|")
    os.system("LD_LIBRARY_PATH=\"/lib/x86_64-linux-gnu:/usr/lib/x86_64-linux-gnu:$(pwd)/bin/deps\" ./bin/gotty --config gotty.conf -a 127.0.0.1 -p "+str(config.GOTTY_PORT)+" -w ./bin/tmux a -t gdb-frontend")
    os.system("LD_LIBRARY_PATH=\"/lib/x86_64-linux-gnu:/usr/lib/x86_64-linux-gnu:$(pwd)/bin/deps\" ./bin/tmux kill-session -t gdb-frontend")
except KeyboardInterrupt as e:
    print("Keyboard interrupt.")

print("Stoped GDB-Frontend.")