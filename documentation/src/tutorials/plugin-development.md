# How to develop GDBFrontend plugins
GDBFrontend supports plugins. Plugin development includes a few simple steps. You can develop plugins easily with following the instructions.

## Example Plugin
There is an example plugin (`hello`) in `plugins/hello`.

Enable it before start the tutorial: Go to `config.py` and comment the line `"hello"`:
```python
disabled_plugins = [
    "hello"
]
```

## Plugin FS Structure
GDBFrontend plugins are stored in `plugins/` directory in the GDBFrontend root.

A typical plugin files look like this:
```
plugins/
   hello/
       frontend/
           html/
               hello.html
           js/
               hello.js
           css/
               hello.css
       url_modules/
           api.py
       config.py
       urls.py
       hello.py
```
Plugins those are inside plugins directory will be loaded automatically.

### Plugin Name Format
* On File System: `hello` (`hello/` directory, `hello.py`)
* Plugin Backend Class: `HelloPlugin`

## Enabling/Disabling a Plugin
You can disable a plugin with adding plugin name to `config.disabled_plugins`.

## Plugin Load Order
You can specify plugin load order with `config.plugin_order`. Plugins from `config.plugin_order` will be loaded in order, after that the rest will be loaded.

## Plugin Files
### config.py
Includes basic information about your plugin.

```python
DESCRIPTION = "Example GDBFrontend plugin."
AUTHOR = "Oğuzhan Eroğlu <rohanrhu2@gmail.com> (https://oguzhaneroglu.com/)"
HOMEPAGE = "https://github.com/rohanrhu/gdb-frontend"
VERSION = [0, 0, 1]
```

### hello.py
Plugin backend file must be named as `[plugin name].py` and plugin class must be named as `[plugin name]Plugin` and intherits `plugin.GDBFrontendPlugin`.

```python
import importlib

import plugin

gdb = importlib.import_module("gdb")

class HelloPlugin(plugin.GDBFrontendPlugin):
    def __init__(self):
        plugin.GDBFrontendPlugin.__init__(self)

    def loaded(self):
        gdb.events.new_objfile.connect(self.gdb_on_new_objfile)

    def unloaded(self):
        gdb.events.new_objfile.disconnect(self.gdb_on_new_objfile)

    def gdb_on_new_objfile(self, event):
        print("[HELLO] Event: new_objfile:", event)
```

### urls.py
Includes URL definitions for GDBFrontend REST API. Plugins can define URLs and use them for communicating with each other.

URLs must be defined in a python dict named as `urls` in the following format:
```python
urls = {
    "example-api": {
        "url": "/hello/api",
        "match": "^/hello/api",
        "module": "plugins.hello.url_modules.api"
    }
}
```

### Rest API Modules
Rest API Module URLs must be defined in `plugin.urls`. Module files are stored in `url_modules/` directory.

Plugin URL modules can be accessed with the path like `plugins.hello.url_modules.[module name]` and you must use it for `plugin.urls["[plugin name]"]["module"]`.

A URL module file includes a function named as `run(request, params)` and GDBFrontend calls that on HTTP request. A typical URL module like this:
```python
import json
import urllib

import api.debug

def run(request, params):
    if params is None: params = {}

    url_path = urllib.parse.urlparse(request.path)
    qs_params = urllib.parse.parse_qs(url_path.query)

    result_json = {}
    result_json["ok"] = True

    result_json["sources"] = api.debug.getSources()

    request.send_response(200)
    request.send_header("Content-Type", "application/json; charset=utf-8")
    request.end_headers()
    request.wfile.write(json.dumps(result_json).encode())
```

## Plugin Objects
Plugin objects are exists in `plugin.plugins` dict as `plugin.plugins["[plugin name]"] = plugin` and `plugin` is an instance of your plugin class that inherits `GDBFrontendPlugin`.

### Plugin Object Attributes
* `plugin.module`
* `plugin.name`
* `plugin.is_loaded`
* `plugin.location`
* `plugin.config`
* `plugin.urls`

## Frontend
Frontend files are stored in the `plugins/[plugin name]/frontend/` directory. There are three basic directory:
```
frontend/
    css/
        [plugin name].css
    html/
        [plugin name].html
    js/
        [plugin name].js
```
Those three files will be included as default:
* `html/[plugin_name].html` will be included to DOM as default.
* `css/[plugin_name].css` will be included as default.
* `js/[plugin_name].js` will be included as default.

Plugin's `frontend/` directory is also served over **HTTP** and its content will be accessable with a URL like `/plugins/[plugin_name]/html/foo.html` or `/plugins/[plugin_name]/js/bar.js`.

### GDBFrontend Namespace
All GDBFrontend stuff are exists in `GDBFrontend` object in Javascript. An example, you can access version like `GDBFrontend.version`.

### Backend Configuration
You can access backend configuration via `GDBFrontend.config`.

## Frontend Components
### Root Components
All root components are stored in `GDBFrontend.components`.

### Sub Components
Sub components are stored in `component.components`.

#### Component: `gdbFrontend`
`GDBFrontend` is the main component at root and it uses another components as sub component. It is accesable with `GDBFrontend.components.gdbFrontend`.

Sub components of `gdbFrontend` are accessable via `GDBFrontend.components.gdbFrontend.components`.

For an example you can get open file tabs like this:
```javascript
> GDBFrontend.components.gdbFrontend.components.fileTabs.files
< (3) [{…}, {…}, {…}]
```

or getting breakpoints from `BreakpointsEditor` component instance from `GDBFrontend` component instance.
```javascript
> GDBFrontend.components.gdbFrontend.components.breakpointsEditor.breakpoints
< [{…}, {…}]
```

Let's switch to first file tab:
```javascript
var switchTo = GDBFrontend.components.gdbFrontend.components.fileTabs.files[0];
GDBFrontend.components.gdbFrontend.components.fileTabs.switchFile({file: switchTo});
```