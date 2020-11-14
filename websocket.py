# -*- coding: utf-8 -*-
#
# gdb-frontend is a easy, flexible and extensionable gui debugger
#
# https://github.com/rohanrhu/gdb-frontend
# https://oguzhaneroglu.com/projects/gdb-frontend/
#
# Licensed under GNU/GPLv3
# Copyright (C) 2019, Oğuzhan Eroğlu (https://oguzhaneroglu.com/) <rohanrhu2@gmail.com>

import socket
import socketserver
import struct
import base64
import hashlib

import config
import util
import http.server

MAGIC = "258EAFA5-E914-47DA-95CA-C5AB0DC85B11"

class HTTPServer(socketserver.ThreadingMixIn, http.server.HTTPServer):
    ws_clients = []

class WebSocketHandler(http.server.BaseHTTPRequestHandler):
    message = None
    ws_connected = False
    
    def __init__(self, request, client_address, server):
        http.server.BaseHTTPRequestHandler.__init__(self, request, client_address, server)
    
    def wsHandle(self):
        if self.path != "/debug-server":
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

        self.ws_connected = True
        self.handleConnection()

        self._wsRead()
        
        return True

    def _wsRead(self):
        while self.ws_connected:
            try:
                header0_16 = struct.unpack("!BB", self.connection.recv(2, socket.MSG_WAITALL))
                opcode = ord(header0_16[0]) & 0b00001111
                
                is_masked = ord(header0_16[1]) & -128
                plen = ord(header0_16[1]) & 127

                if plen == 126:
                    plen = int.from_bytes(struct.unpack("!BB", self.connection.recv(2, socket.MSG_WAITALL)), "big")
                elif plen == 127:
                    plen = int.from_bytes(struct.unpack("!BBBBBBBB", self.connection.recv(2, socket.MSG_WAITALL)), "big")
                
                if is_masked:
                    mkey = struct.unpack("!BBBB", self.connection.recv(4, socket.MSG_WAITALL))
                
                self.message = list(self.connection.recv(plen, socket.MSG_WAITALL))

                if is_masked:
                    for i in range(plen):
                        self.message[i] = chr(self.message[i] ^ ord(mkey[i%4]))
                
                self.message = "".join(self.message)

                self.handleMessage()
            except Exception as e:
                util.verbose("Websocket read error:", e)

                self.ws_connected = False
                self.handleClose()
        
    def wsSend(self, message):
        mlen = len(message)

        if mlen < 126:
            frame = struct.pack("!BB", 0b10000001, mlen)
        elif mlen < (1 << 16):
            frame = struct.pack("!BBH", 0b10000001, 126, mlen)
        else:
            frame = struct.pack("!BBQ", 0b10000001, 127, mlen)
        
        self.wfile.write(frame)

        if isinstance(message, str):
            message = message.encode("utf-8")
        
        self.wfile.write(message)
    
    def handleMessage(self):
        pass
    
    def handleConnection(self):
        pass
    
    def handleClose(self):
        pass