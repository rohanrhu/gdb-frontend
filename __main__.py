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
import os
import sys

path = os.path.dirname(__file__)

os.chdir(path)
sys.path.insert(0, path)

spec = importlib.util.spec_from_file_location("run", os.path.join(os.path.dirname(__file__), "run.py"))
run = importlib.util.module_from_spec(spec)
spec.loader.exec_module(run)