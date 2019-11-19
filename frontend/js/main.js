/*
 * gdb-frontend is a easy, flexible and extensionable gui debugger
 *
 * https://github.com/rohanrhu/gdb-frontend
 * https://oguzhaneroglu.com/projects/gdb-frontend/
 *
 * Licensed under MIT
 * Copyright (C) 2019, Oğuzhan Eroğlu (https://oguzhaneroglu.com/) <rohanrhu2@gmail.com>
*/

/*
 * GDB-Frontend GUI modes.
 * 
 * GDB-Frontend can run different GUI modes:
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
GDBFrontend.is_verbose = true;

GDBFrontend.verbose = function () {
    if (!GDBFrontend.is_verbose) return;
    console.log.apply(console, ["[GDBFrontend]"].concat(Array.prototype.slice.call(arguments)));
};

/*
 * GDB-Frontend loaded plugins.
 *
 * Loaded plugins are accesable like:
 * GDBFrontend.plugins[plugin_name] = {GDBFrontendPlugin Object}
 */
GDBFrontend.plugins = {};

/*
 * GDB-Frontend GUI channel.
 */
GDBFrontend.gui = {};

GDBFrontend.gui.state = {};
GDBFrontend.gui.state.is_loaded = false;

GDBFrontend.gui.events = {};

GDBFrontend.gui.events.loaded = function () {
    GDBFrontend.verbose("GDBFrontend is running in GUI mode.")
    GDBFrontend.gui.state.is_loaded = true;
};

GDBFrontend.stdPathSep = function (path) {
    return path.replace('\\', '/');
};

var $messageBox;
$(document).ready(function () {
    $messageBox = $('.MessageBox');
    $messageBox.MessageBox();
});

var showMessageBox = function (parameters) {
    $messageBox.data('MessageBox').open(parameters);
};

var $aboutDialog;
$(document).ready(function () {
    $aboutDialog = $('.AboutDialog');
    $aboutDialog.AboutDialog();
});

var showAboutDialog = function (parameters) {
    $aboutDialog.data('AboutDialog').open(parameters);
};

var copyToClipboard = function (text) {
    var input = document.createElement('input');
    document.body.append(input);

    input.value = text;
    input.focus();
    input.setSelectionRange(0, input.value.length);

    document.execCommand('copy');

    input.remove();
};

$(document).ready(function () {
    var $fileBrowser = $('.FileBrowser');
    $fileBrowser.FileBrowser();
    GDBFrontend.components.fileBrowser = $fileBrowser.data().FileBrowser;
    
    var $gdbFrontend = $('.GDBFrontend');
    $gdbFrontend.GDBFrontend();
    GDBFrontend.components.gdbFrontend = $gdbFrontend.data().GDBFrontend;
});