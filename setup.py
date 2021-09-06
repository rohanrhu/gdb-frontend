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
import glob
import setuptools

import statics

exluded_files = ["build", "dist", "gdbfrontend.egg-info"]

with open(os.path.join(os.path.abspath(os.path.dirname(__file__)), "README.md")) as f:
    long_description = f.read()

package_data = []
for d in glob.glob("*"):
    if d.split(os.path.sep)[-1] in exluded_files:
        continue

    if os.path.isdir(d):
        for d2 in glob.glob(d + "/**", recursive=True):
            package_data.append(d2)
    else:
        package_data.append(d)

setuptools.setup(
    name = "gdbfrontend",
    version = ".".join([str(i) for i in statics.VERSION[:3]]),
    description = "GDBFrontend is a easy, flexible and extensionable gui debugger.",
    long_description = long_description,
    long_description_content_type='text/markdown',
    author = "Oğuzhan Eroğlu",
    author_email = "rohanrhu2@gmail.com",
    url = "https://github.com/rohanrhu/gdb-frontend",
    package_dir = {
        "gdbfrontend": "."
    },
    packages = [
        "gdbfrontend"
    ],
    package_data = {
        "gdbfrontend": package_data
    },
    scripts = [
        "commands/gdbfrontend"
    ],
    python_requires = '>=3.6',
    classifiers=[
        "Development Status :: 4 - Beta",
        "Programming Language :: Python :: 3",
        "License :: OSI Approved :: GNU General Public License v3 (GPLv3)",
        "Operating System :: POSIX",
        "Operating System :: POSIX :: Linux",
        "Operating System :: Unix",
        "Programming Language :: C",
        "Programming Language :: C++",
        "Topic :: Software Development",
        "Topic :: Software Development :: Debuggers",
        "Topic :: Software Development :: Disassemblers",
        "Topic :: Software Development :: Testing",
    ],
)