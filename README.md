# [![GDBFrontend Website](media/gdbfrontend.png)](https://oguzhaneroglu.com/projects/gdb-frontend/)
GDBFrontend is an easy, flexible and extensionable gui debugger.

[![GitHub release](https://img.shields.io/github/release/rohanrhu/gdb-frontend.svg?style=flat-square)](https://github.com/rohanrhu/gdb-frontend/releases)
[![GitHub issues](https://img.shields.io/github/issues/rohanrhu/gdb-frontend?style=flat-square)](https://github.com/rohanrhu/gdb-frontend/issues)
[![GitHub forks](https://img.shields.io/github/forks/rohanrhu/gdb-frontend?style=flat-square)](https://github.com/rohanrhu/gdb-frontend/network)
[![GitHub stars](https://img.shields.io/github/stars/rohanrhu/gdb-frontend?style=flat-square)](https://github.com/rohanrhu/gdb-frontend/stargazers)
[![GitHub license](https://img.shields.io/github/license/rohanrhu/gdb-frontend?style=flat-square)](https://github.com/rohanrhu/gdb-frontend/blob/master/LICENSE)
[![Donate](http://img.shields.io/liberapay/receives/EvrenselKisilik.svg?logo=liberapay&style=flat-square)](https://liberapay.com/EvrenselKisilik/donate)
[![Twitter](https://img.shields.io/twitter/url?style=social&url=https%3A%2F%2Foguzhaneroglu.com%2Fprojects%2Fgdb-frontend%2F)](https://twitter.com/intent/tweet?text=&url=https%3A%2F%2Fgithub.com%2Frohanrhu%2Fgdb-frontend)

![gdb-frontend](https://oguzhaneroglu.com/static/images/gdbfrontend-ss.png "gdb-frontend")

## Installing 
Flatpak and linux distribution packages are TODO.

### Running From GIT
You can download latest source and run it.

#### Requirements
* GDB (with python3)
* python3
* tmux

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
tmux a -t gdb-frontend
```

### Flatpak
Flatpak package is a TODO.

## `./gdbfrontend`
```bash
$ gdbfrontend --help
GDBFrontend is a easy, flexible and extensionable gui debugger.

Options:
  --help, -h:                           Shows this help message.
  --version, -v:                        Shows version.
  --gdb-executable=PATH, -g PATH:       Specifies GDB executable path (Default is "gdb" command on PATH environment variable.)
  --tmux-executable=PATH, -tmux PATH:   Specifies Tmux executable path (Default is "tmux" command on PATH environment variable.)
  --terminal-id=NAME, -t NAME:          Specifies GDB executable path (Default is "gdb" command on PATH environment variable.)
```

### Options
#### `--gdb-executable=PATH`, `-g PATH`
You can specify GDB executable path like `gdbfrontend --gdb-executable=/path/to/gdb`. (Optional)

#### `--tmux-executable=PATH`, `-tmux PATH`
You can specify Tmux executable path like `gdbfrontend --tmux-executable=/path/to/tmux`. (Optional)

#### `--terminal-id=PATH`, `-t PATH`
You can specify Tmux terminal id like `gdbfrontend --terminal-id=terminal-name`. (Default: `gdb-frontend`)

## Troubleshooting
### Zombie Processes
Sometimes GDB and gdb-frontend may not be closed correctly. In this case, you can terminate gdb-frontend shell.

```bash
tmux kill-session -t gdb-frontend
```

## GDB-Related Issues and Tips
* GDB does not give sources of linked object **until stepping a line once**.
You can add break point a line and step it once, then you will see sources from linked object hereafter during the session.

## Windows
In fact, gdb-frontend is able to run on Windows but there are some serious issues in the GDB's Windows version those avoid using gdb-frontend on Windows.

### Issues about Windows-GDB

* GDB's main-thread is being blocked during running process. (gdb-frontend has an interrupting mechanism to fixing this but it is not enough yet.)
* Windows-GDB's prompt is being blocked during running process and there are some issues about interrupting the application.
* Current release of Windows-GDB contains Python2. New GDB have Python3 but it is not released yet.

## Documentation
Documentation is TODO yet.

## API Documentation
API Documentation is TODO yet.

## Plugin Development
There is an example plugin `hello` in `plugins/` directory.

## Donate
You can donate to support the project.

<a href="https://liberapay.com/EvrenselKisilik/donate"><img alt="Donate using Liberapay" src="https://liberapay.com/assets/widgets/donate.svg"></a>

## License
GNU General Public License v3 (GPL-3)

You may copy, distribute and modify the software as long as you track changes/dates in source files. Any modifications to or software including (via compiler) GPL-licensed code must also be made available under the GPL along with build & install instructions.