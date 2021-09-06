# -*- coding: utf-8 -*-
#
# gdb-frontend is a easy, flexible and extensionable gui debugger
#
# https://github.com/rohanrhu/gdb-frontend
# https://oguzhaneroglu.com/projects/gdb-frontend/
#
# Licensed under GNU/GPLv3
# Copyright (C) 2019, Oğuzhan Eroğlu (https://oguzhaneroglu.com/) <rohanrhu2@gmail.com>

VERSION = [0, 6, 1, "beta"]
VERSION_STRING = "v"+".".join([str(i) for i in VERSION[:-1]])+"-"+VERSION[-1]

"""
GDB-Frontend GUI modes.

GDB-Frontend can run different GUI modes:
WEB      : Accessible via http://host:port/ and layout does not contain GDB terminal.
WEB_TMUX : Same as WEB but layout contains GDB terminal on bottom.
GUI      : It means layout is being opened from native GUI.
           Also in this mode, layout contains GDB terminal at bottom as natively.
"""

GUI_MODE_WEB = 1
GUI_MODE_WEB_TMUX = 2
GUI_MODE_GUI = 3