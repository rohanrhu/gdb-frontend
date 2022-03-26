# Contributing to GDBFrontend
Feel free to send pull requests. You may ask about development on [Discord](https://discord.gg/Vwyr9vrU).

[![GDBFrontend Discord](https://img.shields.io/discord/780821881783713813.svg?color=7289da&label=Discord&logo=discord&style=for-the-badge)](https://discord.gg/RyVY9MtB4S)

# Architecture and Coding Standards of GDBFrontend
The main approach is not using third party things as possible. We can call it "pure as possible".

* GDBFrontend doesn't use any unnecessary intermediate language like TypeScript.
* GDBFrontend doesn't use any framework for neither backend nor frontend.
* GDBFrontend doesn't use any package management tools like NPM or PIP.

GDBFrontend's frontend architecture is 100% pure and clean; it is occuring by different components
that are fully controllable from outside (for extensibility).

![Dependency Hell](https://i.imgur.com/28YtvNu.png)

When you get GDBFrontend source, it is immediately ready to run without anything like installing
**tons of dependency-hell stuff** that you could never know what they are exactly.

## Frontend
![JS Framework Hell](https://i.imgur.com/5R3MzSG.png)

Frontend components are basically HTML DOM element references inside JavaScript (just enccapsulated with jQuery)
and they have their own methods and renderers.

jQuery is not a framework, it is just like a "shortcut" to things without any performance loss, architecture imposition
or any overhead. It is same to writing pure JavaScript.

Our argument behind that not using any framework is very strong and conscious.

* It is not that "you can never know that the framework will be deprecated or not".
* It is not that "frameworks are good but not necessary".

The short explaination is:

* Frameworks are **breaking programmability**.
* Frameworks are not good (usually).

Most of people don't even know how computers and tons of computer science concepts work
and they are looking for starting to programming. The first thing they see is **a framework hell**.

My opinion is on creation of frontend frameworks:

* Forcing some developers who never have an idea aboout what they are doing exactly to write some better code.
* Making developers of frameworks fancy and celebrate.

All GDBFrontend frontend stuff is integration-ready for DevTools. There is no any and intermediate language or source-mapping.

### What about benefits of things like TypeScript or JSX?
TypeScript is awesome when it is used directly or using TypeScript libraries with JavaScript (ES6)
for linter integration and strongly-typed development but it is not the only thing that is good for development.

Our philoshopy in GDBFrontend is extensibility with weakly-typed JavaScript with benefits of DevTools and flexibility of JavaScript.

You can always interact with GDBFrontend components from DevTools and see what things (like properties and methods) they have in action.

JSX is also incredible but it is incredible with the concepts of frameworks that use it. When you know web development concepts enough,
you don't need it as you thought.

### What about frontend extensibility?
GDBFrontend is very extensible and has powerful APIs. Some examples of GDBFrontend's extensibility.

![](media/extensibility-1.png)

![](media/extensibility-2.png)

## Backend
GDBFrontend's backend is written in Python and running inside GDB-embedded Python3. Backend too doesn't use
any framework or thirdparty things.

### What about backend extensibility?
You can access GDBFrontend's Python API via `gdbfrontend` module.

```
(gdb) python-interactive
```

```python
>>> dir(gdbfrontend)
['__builtins__', '__cached__', '__doc__', '__file__', '__loader__', '__name__', '__package__', '__spec__', 'all_urls', 'api', 'commands', 'config', 'gdb', 'http_handler', 'http_server', 'importlib', 'os', 'plugin', 'settings', 'sys', 'thread', 'threading', 'urls', 'util', 'websocket']
>>> dir(gdbfrontend.api)
['__builtins__', '__cached__', '__doc__', '__file__', '__loader__', '__name__', '__package__', '__path__', '__spec__', 'collabration', 'debug', 'flags', 'globalvars', 'process', 'url']
>>> dir(gdbfrontend.api.flags)
['AtomicDebugFlags', '__builtins__', '__cached__', '__doc__', '__file__', '__loader__', '__name__', '__package__', '__spec__', 'threading']
>>> dir(gdbfrontend.api.globalvars)
['__annotations__', '__builtins__', '__cached__', '__doc__', '__file__', '__loader__', '__name__', '__package__', '__spec__', 'access', 'api', 'changed_registers', 'collabration_state', 'debugFlags', 'dont_emit_until_stop_or_exit', 'httpServer', 'http_server', 'inferior_run_times', 'init', 'is_enhanced_collabration', 'lock', 'multiprocessing', 'step_time', 'terminal_id', 'threading']
>>> dir(gdbfrontend.api.debug)
['Breakpoint', 'Nim__getSerializableArrayItems', 'Nim__getSerializableSequenceItems', 'Variable', '__builtins__', '__cached__', '__doc__', '__file__', '__loader__', '__name__', '__package__', '__spec__', 'addBreakpoint', 'api', 'attach', 'backTraceFrame', 'config', 'connect', 'cont', 'delBreakpoint', 'disassemble', 'disassembleFrame', 'execCommand', 'gdb', 'getBreakpoint', 'getBreakpoints', 'getFiles', 'getRegisters', 'getSerializableArrayItems', 'getSerializableStructMembers', 'getSerializableVectorItems', 'getSources', 'getState', 'getVariable', 'getVariableByExpression', 'getVariableInBlock', 'importlib', 'iterateAsmToRet', 'load', 'multiprocessing', 'os', 'pause', 're', 'resolveNonPointer', 'resolveTerminalType', 'resolveTypeTree', 'run', 'selectFrame', 'serializableRepresentation', 'serializableType', 'serializableTypeTree', 'setBreakpointCondition', 'setBreakpointEnabled', 'settings', 'signal', 'step', 'stepInstruction', 'stepOver', 'switchThread', 'sys', 'terminate', 'threadSafe', 'threading', 'time', 'traceback', 'util']
```

For example, you can get all client sockets like this:

```python
>>> gdbfrontend.api.globalvars.httpServer.ws_clients
{1: <server.GDBFrontendSocket object at 0x...>}
```

or you can get all plugins:

```python
>>> gdbfrontend.plugin.getAll()
['hello', 'theme_light', 'theme_red']
```

# API Status
GDBFrontend's API is currently done to make GDBFrontend working correctly but not completely done and fancy for extensibility.

But still you can extend it as you want with contributing the core or writing a plugin. It doesn't force you to use any framework.
You can use a frontend or backend framework/library for plugins.

# Additional Resources
### [Plugin Development Tutorial](https://rohanrhu.github.io/gdb-frontend/tutorials/plugin-development/)
### [Makefile Integration](https://rohanrhu.github.io/gdb-frontend/tutorials/makefile-integration/)