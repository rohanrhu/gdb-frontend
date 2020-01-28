# -*- coding: utf-8 -*-
#
# gdb-frontend is a easy, flexible and extensionable gui debugger
#
# https://github.com/rohanrhu/gdb-frontend
# https://oguzhaneroglu.com/projects/gdb-frontend/
#
# Licensed under GNU/GPLv3
# Copyright (C) 2019, Oğuzhan Eroğlu (https://oguzhaneroglu.com/) <rohanrhu2@gmail.com>

import os
import sys
import io
import contextlib
import threading

import config

def verbose(*text):
    if not config.VERBOSE:
        return
        
    print("[GDBFrontend]", *text)
    sys.stdout.flush()

def gdbPath(path):
    return os.path.realpath(os.path.join(config.gdb_path, path.replace("..", "").lstrip("/")))

def appPath(path):
    return os.path.realpath(os.path.join(config.app_path, path.replace("..", "").lstrip("/")))

def webFSPath(path):
    return os.path.realpath(os.path.join(config.app_path, "frontend", path.replace("..", "").lstrip("/")))

def readFile(path):
    fd = open(path, 'r', encoding="utf8")
    content = fd.read()
    fd.close()

    return content

def versionString(version):
    release = ""

    if not version[-1].isdigit():
        release = "-"+version[-1]
        version = version[:-1]

    return "v"+".".join([str(i) for i in version])+release

class AtomicInteger():
    def __init__(self, num=0):
        self.num = num
        self.lock = threading.Lock()

    def incr(self, diff=1):
        self.lock.acquire()
        self.num += diff
        self.lock.release()

    def decr(self, diff=1):
        self.lock.acquire()
        self.num -= diff
        self.lock.release()

    def set(self, val):
        self.lock.acquire()
        self.num = val
        self.lock.release()

    def get(self):
        self.lock.acquire()
        num = self.num
        self.lock.release()

        return num

@contextlib.contextmanager
def bufferOutput():
    orig_stdout = sys.stdout
    temp_stdout = io.StringIO()
    sys.stdout = temp_stdout

    yield temp_stdout

    sys.stdout = orig_stdout
    temp_stdout.seek(0)
    temp_stdout = temp_stdout.read(0)