/*
 * gdb-frontend is a easy, flexible and extensionable gui debugger
 *
 * https://github.com/rohanrhu/gdb-frontend
 * https://oguzhaneroglu.com/projects/gdb-frontend/
 *
 * Licensed under GNU/GPLv3
 * Copyright (C) 2019, Oğuzhan Eroğlu (https://oguzhaneroglu.com/) <rohanrhu2@gmail.com>
 *
 */

(function () {

/*
 * GDBFrontend namespace.
 */
GDBFrontend;

/*
 * GDBFrontend GUI modes.
 * 
 * GDBFrontend can run different GUI modes:
 * WEB      : Accessible via http://host:port/ and layout does not contain GDB terminal.
 * WEB_TMUX : Same as WEB but layout contains GDB terminal on bottom.
 * GUI      : It means layout is being opened from native GUI.
 *            Also in this mode, layout contains GDB terminal at bottom as natively.
 */
GDBFrontend.GUI_MODE_WEB = 1;
GDBFrontend.GUI_MODE_WEB_TMUX = 2;
GDBFrontend.GUI_MODE_GUI = 3;

GDBFrontend.gui_mode = 0;

GDBFrontend.components = {};
GDBFrontend.is_verbose = false;

/*
 * Backend loaded plugins.
 *
 * These array will be set by evulated code in HTML from backend.
 */
GDBFrontend.load_plugins;

/*
 * GDBFrontend loaded plugins.
 *
 * Loaded plugins are accesable like:
 * GDBFrontend.plugins[plugin_name] = {GDBFrontendPlugin Object}
 */
GDBFrontend.plugins = {};

GDBFrontend.Plugin = function GDBFrontendPlugin(parameters) {
    Object.assign(this, parameters.plugin);
};

GDBFrontend.Plugin.prototype.path = function GDBFrontendPlugin(parameters) {
    var path = parameters;
    if (path instanceof Object) {
        path = parameters.path;
    }

    return '/plugins/'+this.name+'/'+path;
};

/*
 * Registers GDBFrontend plugin.
 * Plugins will be set into GDBFrontend.plugins["PluginName"].
 */
GDBFrontend.registerPlugin = function (parameters) {
    var plugin = parameters;
    if (parameters instanceof Object) {
        plugin = parameters.plugin;
    }

    GDBFrontend.plugins[parameters.plugin.name] = new GDBFrontend.Plugin({plugin: plugin});

    var $link = $('<link rel="stylesheet" type="text/css" />');
    var $script = $('<script type="text/javascript"></script>');

    $link.attr('href', '/plugins/'+plugin.name+'/css/'+plugin.name+'.css');
    $script.attr('src', '/plugins/'+plugin.name+'/js/'+plugin.name+'.js');

    $link.appendTo($('body'));
    $script.appendTo($('body'));
};

/*
 * GDBFrontend GUI channel.
 */
GDBFrontend.gui = {};

GDBFrontend.gui.state = {};
GDBFrontend.gui.state.is_loaded = false;

GDBFrontend.gui.events = {};

GDBFrontend.gui.events.loaded = function () {
    GDBFrontend.verbose("GDBFrontend is running in GUI mode.");
    GDBFrontend.gui.state.is_loaded = true;
};

var $messageBox;
var $aboutDialog;

$(document).ready(function () {
    $messageBox = $('.MessageBox');
    $messageBox.MessageBox();

    $aboutDialog = $('.AboutDialog');
    $aboutDialog.AboutDialog();
});

GDBFrontend.verbose = function () {
    if (!GDBFrontend.is_verbose) return;
    console.log.apply(console, ["[GDBFrontend]"].concat(Array.prototype.slice.call(arguments)));
};

GDBFrontend.showMessageBox = function (parameters) {
    $messageBox.data('MessageBox').open(parameters);
};

GDBFrontend.showAboutDialog = function (parameters) {
    $aboutDialog.data('AboutDialog').open(parameters);
};

GDBFrontend.copyToClipboard = function (text) {
    var input = document.createElement('input');
    document.body.append(input);

    input.value = text;
    input.focus();
    input.setSelectionRange(0, input.value.length);

    document.execCommand('copy');

    input.remove();
};

GDBFrontend.stdPathSep = function (path) {
    return path.replace('\\', '/');
};

$(document).ready(function () {
    var $fileBrowser = $('.FileBrowser');
    $fileBrowser.FileBrowser();
    GDBFrontend.components.fileBrowser = $fileBrowser.data().FileBrowser;

    var $fuzzyFinder = $('.FuzzyFinder');
    $fuzzyFinder.FuzzyFinder();
    GDBFrontend.components.fuzzyFinder = $fuzzyFinder.data().FuzzyFinder;
    GDBFrontend.components.fuzzyFinder.sources = function () {
        return GDBFrontend.components.gdbFrontend.debug.state.sources;
    };

    $('body').on('keydown.__GDBFrontend__', function (event) {
        if (event.ctrlKey && event.keyCode == 80) {
            event.preventDefault();

            GDBFrontend.components.fuzzyFinder.open({
                onSelected: function (parameters) {
                    GDBFrontend.components.gdbFrontend.openSource({file: parameters.item.file});
                }
            });
        }
    });

    GDBFrontend.components.fuzzyFinder.$fuzzyFinder.on('FuzzyFinder_keydown.__GDBFrontend__', function (event, parameters) {
        if (parameters.event.ctrlKey && parameters.event.keyCode == 80) {
            parameters.event.preventDefault();
            GDBFrontend.components.fuzzyFinder.close();
        }
    });
    
    var $gdbFrontend = $('.GDBFrontend');
    $gdbFrontend.GDBFrontend({is_readonly: GDBFrontend.config.is_readonly});
    GDBFrontend.components.gdbFrontend = $gdbFrontend.data().GDBFrontend;

    GDBFrontend.load_plugins.every(function (_plugin, _plugin_i) {
        GDBFrontend.registerPlugin({plugin: _plugin});
        return true;
    });
});

})();
