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
GDBFrontend's WebSocket Server
(gdbfrontend.websocket.HTTPServer is wrapped by gdbfrontend.http_server.GDBFrontendHTTPServer)
WebSocket methods are not thread-safe by itself.
WebSocket client connections are threaded and you must be careful
while using WebSocketHandler.wsSend(message) because of thread-safety.
"""

import sys
import socket
import socketserver
import struct
import base64
import hashlib
import typing
import threading

import config
import util
import http.server

MAGIC = "258EAFA5-E914-47DA-95CA-C5AB0DC85B11"

client_id_i = 1

wsSend_lock = threading.Lock()

class WebSocketHandler(http.server.BaseHTTPRequestHandler):
    message = None
    ws_connected = False
    client_id = 0
    
    def __init__(self, request, client_address, server):
        global client_id_i
        
        http.server.BaseHTTPRequestHandler.__init__(self, request, client_address, server)
    
    def wsHandle(self, path):
        global client_id_i
        
        if self.path != path:
            return False
        
        connection = self.headers.get("Connection")
        if connection:
            connection = connection.split(", ")
        else:
            connection = []
        
        if "Upgrade" not in connection or self.headers.get("Upgrade") != "websocket":
            return True
        
        key = self.headers.get("Sec-WebSocket-Key")
        extensions = self.headers.get("Sec-WebSocket-Extensions")
        if extensions:
            extensions = extensions.split("; ")

        accept = base64.b64encode(
            hashlib.sha1(
                (key + MAGIC).encode("ascii")
            ).digest()
        ).decode("ascii")

        self.wfile.write(b"HTTP/1.1 101 Switching Protocols\r\n")
        self.send_header('Upgrade', 'websocket')
        self.send_header('Connection', 'Upgrade')
        self.send_header('Sec-WebSocket-Accept', accept)
        self.end_headers()

        self.client_id = client_id_i
        client_id_i += 1

        self.ws_connected = True
        self.handleConnection()

        self._wsRead()
        
        return True

    def _wsRead(self):
        while self.ws_connected:
            header0_16 = None
            is_masked = False
            plen = 0
            mkey = None
            
            try:
                header0_16 = struct.unpack("!BB", self.connection.recv(2, socket.MSG_WAITALL))
                opcode = header0_16[0] & 0b00001111
                
                if opcode == 8:
                    self.ws_connected = False
                    self.handleClose()
                    break

                is_masked = header0_16[1] & -128
                plen = header0_16[1] & 127

                if plen == 126:
                    plen = int.from_bytes(struct.unpack("!BB", self.connection.recv(2, socket.MSG_WAITALL)), "big")
                elif plen == 127:
                    plen = int.from_bytes(struct.unpack("!BBBBBBBB", self.connection.recv(2, socket.MSG_WAITALL)), "big")
                
                if is_masked:
                    mkey = struct.unpack("!BBBB", self.connection.recv(4, socket.MSG_WAITALL))
                
                self.message = list(self.connection.recv(plen, socket.MSG_WAITALL))

                if is_masked:
                    for i in range(plen):
                        self.message[i] = self.message[i] ^ mkey[i%4]
                
                self.message = bytes(self.message).decode("utf-8")

                self.handleMessage()
            except Exception as e:
                util.verbose(
                    "Websocket read error:",
                    e,
                    "(" + sys.exc_info()[-1].tb_frame.f_code.co_filename + ":" + str(sys.exc_info()[-1].tb_lineno) + ")"
                )

                if (config.VERBOSE):
                    raise e

                self.ws_connected = False
                self.handleClose()
        
    def wsSend(self, message):
        wsSend_lock.acquire()
        
        try:
            if isinstance(message, str):
                message = message.encode("utf-8")
            
            mlen = len(message)

            if mlen < 126:
                frame = struct.pack("!BB", 0b10000001, mlen)
            elif mlen < (1 << 16):
                frame = struct.pack("!BBH", 0b10000001, 126, mlen)
            else:
                frame = struct.pack("!BBQ", 0b10000001, 127, mlen)
            
            self.wfile.write(frame)
            self.wfile.write(message)
        except:
            wsSend_lock.release()
        finally:
            wsSend_lock.release()

    def handleMessage(self):
        pass
    
    def handleConnection(self):
        pass
    
    def handleClose(self):
        pass

class HTTPServer(socketserver.ThreadingMixIn, http.server.HTTPServer):
    ws_clients: typing.List[WebSocketHandler] = []

    def getClientById(self, client_id):
        for client in self.ws_clients:
            if client.client_id == client_id:
                return client
        
        return False
    
    def wsSendAll(self, message):
        for client in self.ws_clients:
            client.wsSend(message)