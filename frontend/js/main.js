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

GDBFrontend.z_index_i = 1;

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

GDBFrontend.stdPathSep = function (path) {
    return path.replace('\\', '/');
};

GDBFrontend.sounds = {};
GDBFrontend.sounds.bell = new Audio("data:audio/wav;base64,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qJrx4KOQjahZxWbcZgztj2c49nKmkId44S71j0c8eV9yDK6uPRzx5X18eDvjvQ6yKo9ZSS6l//8elePK/Lf//IInrOF/FvDoADYAGBMGb7FtErm5MXMlmPAJQVgWta7Zx2go+8xJ0UiCb8LHHdftWyLJE0QIAIsI+UbXu67dZMjmgDGCGl1H+vpF4NSDckSIkk7Vd+sxEhBQMRU8j/12UIRhzSaUdQ+rQU5kGeFxm+hb1oh6pWWmv3uvmReDl0UnvtapVaIzo1jZbf/pD6ElLqSX+rUmOQNpJFa/r+sa4e/pBlAABoAAAAA3CUgShLdGIxsY7AUABPRrgCABdDuQ5GC7DqPQCgbbJUAoRSUj+NIEig0YfyWUho1VBBBA//uQZB4ABZx5zfMakeAAAAmwAAAAF5F3P0w9GtAAACfAAAAAwLhMDmAYWMgVEG1U0FIGCBgXBXAtfMH10000EEEEEECUBYln03TTTdNBDZopopYvrTTdNa325mImNg3TTPV9q3pmY0xoO6bv3r00y+IDGid/9aaaZTGMuj9mpu9Mpio1dXrr5HERTZSmqU36A3CumzN/9Robv/Xx4v9ijkSRSNLQhAWumap82WRSBUqXStV/YcS+XVLnSS+WLDroqArFkMEsAS+eWmrUzrO0oEmE40RlMZ5+ODIkAyKAGUwZ3mVKmcamcJnMW26MRPgUw6j+LkhyHGVGYjSUUKNpuJUQoOIAyDvEyG8S5yfK6dhZc0Tx1KI/gviKL6qvvFs1+bWtaz58uUNnryq6kt5RzOCkPWlVqVX2a/EEBUdU1KrXLf40GoiiFXK///qpoiDXrOgqDR38JB0bw7SoL+ZB9o1RCkQjQ2CBYZKd/+VJxZRRZlqSkKiws0WFxUyCwsKiMy7hUVFhIaCrNQsKkTIsLivwKKigsj8XYlwt/WKi2N4d//uQRCSAAjURNIHpMZBGYiaQPSYyAAABLAAAAAAAACWAAAAApUF/Mg+0aohSIRobBAsMlO//Kk4soosy1JSFRYWaLC4qZBYWFRGZdwqKiwkNBVmoWFSJkWFxX4FFRQWR+LsS4W/rFRb/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////VEFHAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAU291bmRib3kuZGUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAMjAwNGh0dHA6Ly93d3cuc291bmRib3kuZGUAAAAAAAAAACU=");;

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
