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
GDBFrontend's VT100 Terminal Sharing
This handler is used by WebSocket handler and provides
terminal sharing fundementals over WebSocket.
"""

import os
import pty
import json
import subprocess
import threading
import time
import select
import struct
import fcntl
import termios
import signal
import atexit

import util

class TerminalDaemon:
    ws = False
    pty_proc = False
    pty_fd = False
    pty_pid = False
    terminal_command = False

    def __init__(self, ws, terminal_command):
        self.ws = ws
        self.terminal_command = terminal_command

    def start(self):
        util.verbose("Spawning terminal process for client#%d: \"%s\"" % (self.ws.client_id, " ".join(self.terminal_command)))
        
        pgid = os.getpgrp()

        (self.pty_pid, self.pty_fd) = pty.fork()

        if self.pty_pid == 0:
            pty_proc = subprocess.Popen(self.terminal_command)
            
            try:
                os.setpgid(pty_proc.pid, self.pty_pid)
            except Exception as e:
                print(e)

            pty_proc.wait()
            exit(0)
        else:
            @atexit.register
            def terminatePTYProc():
                util.verbose("Sending SIGKILL on terminatePTYProc() to PTY process. (%s)" % " ".join(self.terminal_command))
                os.killpg(self.pty_pid, signal.SIGKILL)
                os.kill(self.pty_pid, signal.SIGKILL)
                os.waitpid(self.pty_pid, 0)
            
            th = threading.Thread(target=self.syncTerm)
            th.setDaemon(True)
            th.start()
    
    def stop(self):
        util.verbose("Sending SIGKILL on TerminalDaemon.stop() to PTY process. (%s)" % " ".join(self.terminal_command))
        os.killpg(self.pty_pid, signal.SIGKILL)
        os.kill(self.pty_pid, signal.SIGKILL)
        os.waitpid(self.pty_pid, 0)

    def syncTerm(self):
        while self.ws.ws_connected:
            time.sleep(0.01)

            (ready_fds, _, _) = select.select([self.pty_fd], [], [], 0)
            
            if not ready_fds:
                continue

            try:
                output = os.read(self.pty_fd, 4094)
            except IOError:
                continue
            
            message = {
                "event": "terminal_data",
                "data": output.decode("utf-8", errors="ignore")
            }
            
            self.wsSend(json.dumps(message))
        
        try:
            os.killpg(self.pty_pid, signal.SIGKILL)
            os.kill(self.pty_pid, signal.SIGKILL)
        except:
            pass

    def wsSend(self, message):
        try:
            self.ws.wsSend(message)
        except Exception as e:
            pass

    def handleMessage(self):
        message = json.loads(self.ws.message)

        if message["event"] == "terminal_resize":
            try:
                size = struct.pack("HHHH", message["rows"], message["cols"], message["width"], message["height"])
                fcntl.ioctl(self.pty_fd, termios.TIOCSWINSZ, size)
            except:
                pass
            return True
        elif message["event"] == "terminal_data":
            try:
                os.write(self.pty_fd, message["data"].encode("utf-8"))
            except:
                return True
            return True
        
        return False