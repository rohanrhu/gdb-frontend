import importlib

import plugin

class ThemeMetalmajorPlugin(plugin.GDBFrontendPlugin):
    def __init__(self):
        plugin.GDBFrontendPlugin.__init__(self)

    def loaded(self):
        pass

    def unloaded(self):
        pass