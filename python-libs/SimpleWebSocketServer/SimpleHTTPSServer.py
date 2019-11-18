'''
The MIT License (MIT)
Copyright (c) 2013 Dave P.
'''

import ssl

try:
    from BaseHTTPServer import HTTPServer
except:
    from http.server import HTTPServer

try:
    from SimpleHTTPServer import SimpleHTTPRequestHandler
except:
    from http.server import SimpleHTTPRequestHandler

if __name__ == "__main__":
    # openssl req -new -x509 -days 365 -nodes -out cert.pem -keyout key.pem
    httpd = HTTPServer(('', 443), SimpleHTTPRequestHandler)
    httpd.socket = ssl.wrap_socket(httpd.socket, server_side=True, certfile='./cert.pem', 
                                 keyfile='./key.pem', ssl_version=ssl.PROTOCOL_TLSv1)
    httpd.serve_forever()
