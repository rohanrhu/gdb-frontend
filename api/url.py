# -*- coding: utf-8 -*-
#
# gdb-frontend is a easy, flexible and extensionable gui debugger
#
# https://github.com/rohanrhu/gdb-frontend
# https://oguzhaneroglu.com/projects/gdb-frontend/
#
# Licensed under GNU/GPLv3
# Copyright (C) 2019, Oğuzhan Eroğlu (https://oguzhaneroglu.com/) <rohanrhu2@gmail.com>

import re
import string
import urllib
import importlib
import collections

class URLS(collections.OrderedDict):
    def append(self, key, value):
        self[key] = value
        self.move_to_end(key, last=True)
    
    def prepend(self, key, value):
        self[key] = value
        self.move_to_end(key, last=False)

class URL:
    def __init__(self, urls):
        self.urls = urls

        for _url_name, _url in urls.items():
            _url["module"] = importlib.import_module(_url["module"])

    def getModule(self, url):
        for _url_name, _url in self.urls.items():
            match = re.findall(_url["match"], url)

            if match.__len__() > 0:
                params = {}
                i = 0
                for p in string.Formatter().parse(_url["url"]):
                    if p[1] is None: break

                    params[p[1]] = match[i]
                    i += 1

                return {
                    "url_name": _url_name,
                    "url": _url,
                    "params": params
                }

        return False

    def runModule(self, request):
        url_path = urllib.parse.urlparse(request.path)
        url = self.getModule(url_path.path)

        if url:
            if url["url"].get("force_slash") and url_path.path[-1] != "/":
                request.send_response(307)
                request.send_header("Location", url_path.path+"/")
                request.end_headers()
                return True

            url["url"]["module"].run(
                request=request,
                params=url["params"]
            )

            return True

        return False

    def url(self, name, params):
        return self.urls[name]["url"].format(**params)

    def route(self, url, method, qs, data):
        pass