# -*- coding: utf-8 -*-
#
# gdb-frontend is a easy, flexible and extensionable gui debugger
#
# https://github.com/rohanrhu/gdb-frontend
# https://oguzhaneroglu.com/projects/gdb-frontend/
#
# Licensed under GNU/GPLv3
# Copyright (C) 2019, Oğuzhan Eroğlu (https://oguzhaneroglu.com/) <rohanrhu2@gmail.com>

import sys
import os

import config

import PyQt5
import PyQt5.QtCore
import PyQt5.QtGui
import PyQt5.QtWebEngineWidgets
import PyQt5.QtWebChannel

from AboutDialog import AboutDialog

from ui_MainWindow import Ui_MainWindow

class MainWindow(PyQt5.QtWidgets.QMainWindow, Ui_MainWindow):
    def __init__(self):
        PyQt5.QtWidgets.QMainWindow.__init__(self)
        self.setupUi(self)

        # self.setWindowFlags(PyQt5.QtCore.Qt.FramelessWindowHint)
        self.setWindowIcon(PyQt5.QtGui.QIcon(
            os.path.join(
                os.path.dirname(os.path.realpath(__file__)),
                "images/icon.png"
            )
        ))

        self.webView = PyQt5.QtWebEngineWidgets.QWebEngineView()

        self.webChannel = PyQt5.QtWebChannel.QWebChannel(self.webView.page())
        self.webView.page().setWebChannel(self.webChannel)

        self.webLayout.addWidget(self.webView)
        self.webView.load(PyQt5.QtCore.QUrl("http://" + config.HOST_ADDRESS + ":" + str(config.HTTP_PORT)+"/gui/"))

        self.channel = PyQt5.QtWebChannel.QWebChannel(self.webView.page())
        self.webView.page().setWebChannel(self.channel)

        self.channel.registerObject("bridge", self)

        @self.webView.loadFinished.connect
        def webView_on_load_finished():
            self.webView.page().runJavaScript("GDBFrontend.gui.is_gui = true;")
            self.webView.page().runJavaScript("GDBFrontend.gui.events.loaded();")

    @PyQt5.QtCore.pyqtSlot()
    def webViewBridgeSlot_about(self):
        aboutDialog = AboutDialog()
        aboutDialog.exec_()