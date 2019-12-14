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

from ui_MainWindow import Ui_MainWindow

class AboutDialog(PyQt5.QtWidgets.QDialog):
    def __init__(self, *args, **kwargs):
        PyQt5.QtWidgets.QDialog.__init__(self, *args, **kwargs)

        self.setFixedSize(400, 300)
        self.setWindowTitle("About GDBFrontend")
        
        self.layout = PyQt5.QtWidgets.QVBoxLayout()
        self.setLayout(self.layout)

        self.buttonBox = PyQt5.QtWidgets.QDialogButtonBox(PyQt5.QtWidgets.QDialogButtonBox.Ok)
        self.buttonBox.accepted.connect(self.ok)
        self.layout.addWidget(self.buttonBox)

        aboutText = PyQt5.QtWidgets.QLabel()
        aboutText.setText(
            "<center>" +
            "GDBFrontend is is a easy, flexible and extensionable gui debugger.<br />" +
            "Copyright (C) 2019, Oğuzhan Eroğlu (https://oguzhaneroglu.com/) <rohanrhu2@gmail.com>" +
            "</center>"
        )
        self.layout.addWidget(aboutText)

    def ok(self):
        self.close()