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

$(document).ready(function () {
    console.log("[Hello] Plugin:", GDBFrontend.plugins.hello);

    GDBFrontend.components.gdbFrontend.$gdbFrontend.on('GDBFrontend_debug_new_objfile', function (event) {
        console.log('[Hello] Event: new_objfile:', event);
    });
});