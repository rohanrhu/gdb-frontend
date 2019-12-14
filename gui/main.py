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

import ctypes

import PyQt5
import PyQt5.QtCore
import PyQt5.QtWidgets

from MainWindow import MainWindow

win32_app_id = "rohanrhu.GDBFrontend.GDBFrontendGUI.1"
ctypes.windll.shell32.SetCurrentProcessExplicitAppUserModelID(win32_app_id)

app = PyQt5.QtWidgets.QApplication(sys.argv)
app.setStyleSheet("QMainWindow{border: 1px solid black;}")

mainWindow = MainWindow()
mainWindow.show()

sys.exit(app.exec_())