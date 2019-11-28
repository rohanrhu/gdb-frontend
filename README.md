# gdb-frontend
gdb-frontend is a easy, flexible and extensionable gui debugger

[![GitHub release](https://img.shields.io/github/release/rohanrhu/gdb-frontend.svg?style=flat-square)](https://github.com/rohanrhu/gdb-frontend/releases)
[![GitHub issues](https://img.shields.io/github/issues/rohanrhu/gdb-frontend?style=flat-square)](https://github.com/rohanrhu/gdb-frontend/issues)
[![GitHub forks](https://img.shields.io/github/forks/rohanrhu/gdb-frontend?style=flat-square)](https://github.com/rohanrhu/gdb-frontend/network)
[![GitHub stars](https://img.shields.io/github/stars/rohanrhu/gdb-frontend?style=flat-square)](https://github.com/rohanrhu/gdb-frontend/stargazers)
[![GitHub license](https://img.shields.io/github/license/rohanrhu/gdb-frontend?style=flat-square)](https://github.com/rohanrhu/gdb-frontend/blob/master/LICENSE)
[![Twitter](https://img.shields.io/twitter/url?style=social&url=https%3A%2F%2Foguzhaneroglu.com%2Fprojects%2Fgdb-frontend%2F)](https://twitter.com/intent/tweet?text=&url=https%3A%2F%2Fgithub.com%2Frohanrhu%2Fgdb-frontend)

![gdb-frontend](https://oguzhaneroglu.com/static/images/gdbfrontend-ss.png "gdb-frontend")

## Installing 
Flatpak and linux distribution packages are TODO.

### Running From GIT
You can download latest source and run it.

#### Requirements
* GDB (with python3)
* python3

You can run gdb-frontend with following commands:
```bash
git clone https://github.com/rohanrhu/gdb-frontend.git gdb-frontend
cd gdb-frontend
./gdbfrontend
```

and you can open it with:

```
http://127.0.0.1:5551/terminal/
```

or without terminal:

```
http://127.0.0.1:5551/
```

You can open GDB shell with the command:

```bash
cd gdb-frontend
./bin/tmux a -t gdb-frontend
```

#### Troubleshooting

##### Zombie Processes
Sometimes GDB and gdb-frontend may not be closed correctly. In this case, you can terminate gdb-frontend shell.

```bash
tmux kill-session -t gdb-frontend
```

### Flatpak
Flatpak package is a TODO.

## GDB-Related Issues and Tips
* GDB does not give sources of linked object **until stepping a line once**.
You can add break point a line and step it once, then you will see sources from linked object hereafter during the session.

## Windows
In fact, gdb-frontend is able to run on Windows but there are some serious issues in the GDB's Windows version those avoid using gdb-frontend on Windows.

### Issues about Windows-GDB

* GDB's main-thread is being blocked during running process. (gdb-frontend has an interrupting mechanism to fixing this but it is not enough yet.)
* Windows-GDB's prompt is being blocked during running process and there are some issues about interrupting the application.
* Current release of GDB contain Python2. New GDB have Python3 but it is not released yet.

## Documentation
Documentation is TODO yet.

## API Documentation
API Documentation is TODO yet.

## License
GNU GPLv3