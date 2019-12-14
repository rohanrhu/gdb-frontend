/*
 * gdb-frontend is a easy, flexible and extensionable gui debugger
 *
 * https://github.com/rohanrhu/gdb-frontend
 * https://oguzhaneroglu.com/projects/gdb-frontend/
 *
 * Licensed under GNU/GPLv3
 * Copyright (C) 2019, Oğuzhan Eroğlu (https://oguzhaneroglu.com/) <rohanrhu2@gmail.com>
*/

(function($) {
    var methods = {};

    methods.init = function (parameters) {
        var t_init = this;
        var $elements = $(this);

        if (typeof parameters == 'undefined') {
            parameters = {};
        }

        t_init.parameters = parameters;

        $elements.each(function () {
            var $gdbFrontend = $(this);

            $gdbFrontend.off('.GDBFrontend');
            $gdbFrontend.find('*').off('.GDBFrontend');

            var data = {};
            $gdbFrontend.data('GDBFrontend', data);
            data.$gdbFrontend = $gdbFrontend;

            var $gdbFrontend_layout = $gdbFrontend.find('.GDBFrontend_layout');
            var $gdbFrontend_layout_top = $gdbFrontend.find('.GDBFrontend_layout_top');
            var $gdbFrontend_layout_left = $gdbFrontend.find('.GDBFrontend_layout_left');
            var $gdbFrontend_layout_right = $gdbFrontend.find('.GDBFrontend_layout_right');
            var $gdbFrontend_layout_middle = $gdbFrontend.find('.GDBFrontend_layout_middle');
            var $gdbFrontend_layout_bottom = $gdbFrontend.find('.GDBFrontend_layout_bottom');

            data.$gdbFrontend_load = $gdbFrontend.find('.GDBFrontend_load');
            data.$gdbFrontend_load_loadBtn = data.$gdbFrontend_load.find('.GDBFrontend_load_loadBtn');

            data.$GDBFrontend_load_connectBtn = data.$gdbFrontend_load.find('.GDBFrontend_load_connectBtn');
            data.$GDBFrontend_load_connectBtn_openable = data.$GDBFrontend_load_connectBtn.find('.GDBFrontend_load_connectBtn_openable');
            data.$GDBFrontend_load_connectBtn_openable_addressInput = data.$GDBFrontend_load_connectBtn_openable.find('.GDBFrontend_load_connectBtn_openable_addressInput');
            data.$GDBFrontend_load_connectBtn_openable_connectBtn = data.$GDBFrontend_load_connectBtn_openable.find('.GDBFrontend_load_connectBtn_openable_connectBtn');

            data.$GDBFrontend_terminal = $gdbFrontend.find('.GDBFrontend_terminal');

            data.$GDBFrontend_runtimeControls = $gdbFrontend.find('.GDBFrontend_runtimeControls');
            data.$GDBFrontend_runtimeControls_btn__run = data.$GDBFrontend_runtimeControls.find('.GDBFrontend_runtimeControls_btn__run');
            data.$GDBFrontend_runtimeControls_btn__pause = data.$GDBFrontend_runtimeControls.find('.GDBFrontend_runtimeControls_btn__pause');
            data.$GDBFrontend_runtimeControls_btn__continue = data.$GDBFrontend_runtimeControls.find('.GDBFrontend_runtimeControls_btn__continue');
            data.$GDBFrontend_runtimeControls_btn__s = data.$GDBFrontend_runtimeControls.find('.GDBFrontend_runtimeControls_btn__s');
            data.$GDBFrontend_runtimeControls_btn__n = data.$GDBFrontend_runtimeControls.find('.GDBFrontend_runtimeControls_btn__n');
            data.$GDBFrontend_runtimeControls_btn__si = data.$GDBFrontend_runtimeControls.find('.GDBFrontend_runtimeControls_btn__si');
            data.$GDBFrontend_runtimeControls_btn__t = data.$GDBFrontend_runtimeControls.find('.GDBFrontend_runtimeControls_btn__t');

            data.$gdbFrontend_sources = $gdbFrontend.find('.GDBFrontend_sources');
            data.$gdbFrontend_sources_title = data.$gdbFrontend_sources.find('.GDBFrontend_sources_title');
            data.$gdbFrontend_sourceTreeComp = data.$gdbFrontend_sources.find('.GDBFrontend_sourceTreeComp');
            data.$gdbFrontend_sourceTree = data.$gdbFrontend_sourceTreeComp.find('> .SourceTree');
            data.gdbFrontend_sourceTree = null;

            data.$gdbFrontend_watchesComp = $gdbFrontend.find('.GDBFrontend_watchesComp');
            data.$gdbFrontend_watches = data.$gdbFrontend_watchesComp.find('> .Watches');
            data.gdbFrontend_watches = null;

            data.$gdbFrontend_fileTabsComp = $gdbFrontend.find('.GDBFrontend_fileTabsComp');
            data.$gdbFrontend_fileTabs = data.$gdbFrontend_fileTabsComp.find('> .FileTabs');
            data.gdbFrontend_fileTabs = null;

            data.$gdbFrontend_breakpointsEditorComp = $gdbFrontend.find('.GDBFrontend_breakpointsEditorComp');
            data.$gdbFrontend_breakpointsEditor = data.$gdbFrontend_breakpointsEditorComp.find('> .BreakpointsEditor');
            data.gdbFrontend_breakpointsEditor = null;

            data.$gdbFrontend_threadsEditorComp = $gdbFrontend.find('.GDBFrontend_threadsEditorComp');
            data.$gdbFrontend_threadsEditor = data.$gdbFrontend_threadsEditorComp.find('> .ThreadsEditor');
            data.gdbFrontend_threadsEditor = null;

            data.$gdbFrontend_stackTraceComp = $gdbFrontend.find('.GDBFrontend_stackTraceComp');
            data.$gdbFrontend_stackTrace = data.$gdbFrontend_stackTraceComp.find('> .StackTrace');
            data.gdbFrontend_stackTrace = null;

            data.$gdbFrontend_variablesExplorerComp = $gdbFrontend.find('.GDBFrontend_variablesExplorerComp');
            data.$gdbFrontend_variablesExplorer = data.$gdbFrontend_variablesExplorerComp.find('> .VariablesExplorer');
            data.gdbFrontend_variablesExplorer = null;

            data.components = {};

            data.debug = {};
            data.debug.state = false;
            data.debug.socket = false;
            data.debug.breakpoints = [];
            data.debug.thread = false;
            data.debug.threads = [];
            data.debug.frames = [];

            data.qWebChannel = false;

            data.debug.getBreakpoint = function (parameters) {
                var bp = false;
                var bp_i = false;

                data.debug.breakpoints.forEach(function (_bp, _bp_i) {
                    if (_bp.file && (parameters.file.path == _bp.file) && (parameters.line == _bp.line)) {
                        bp = _bp;
                        bp_i = _bp_i;
                        return false;
                    }
                });

                return bp ? {
                    breakpoint: bp,
                    index: bp_i
                }: false;
            };

            data.debug.addBreakpoint = function (parameters) {
                var bp = data.debug.getBreakpoint({file: parameters.file, line: parameters.line});

                if (!bp) {
                    $.ajax({
                        url: '/api/breakpoint/add',
                        cache: false,
                        method: 'get',
                        data: {
                            file: parameters.file.path,
                            line: parameters.line
                        },
                        success: function (result_json) {
                        },
                        error: function () {
                            GDBFrontend.showMessageBox({text: 'An error occured.'});
                            console.trace('An error occured.');
                        }
                    });
                    
                    return true;
                }

                return false;
            };

            data.debug.delBreakpoint = function (parameters) {
                $.ajax({
                    url: '/api/breakpoint/del',
                    cache: false,
                    method: 'get',
                    data: {
                        number: parameters.number
                    },
                    success: function (result_json) {
                    },
                    error: function () {
                        GDBFrontend.showMessageBox({text: 'An error occured.'});
                        console.trace('An error occured.');
                    }
                });
            };

            data.debug.toggleBreakpoint = function (parameters) {
                var bp = data.debug.getBreakpoint({file: parameters.file, line: parameters.line});

                if (bp) {
                    data.debug.delBreakpoint({number: bp.breakpoint.gdb_breakpoint.number});
                } else {
                    data.debug.addBreakpoint({
                        file: parameters.file,
                        line: parameters.line
                    });
                }
            };

            data.$gdbFrontend_fileTabs.on('FileTabs_breakpoints_toggle.GDBFrontend', function (event, parameters) {
                data.debug.toggleBreakpoint({
                    file: parameters.file,
                    line: parameters.line
                });
            });

            var preloadFiles = function (parameters) {
                var switchFile = function () {
                    var to_switch = data.gdbFrontend_fileTabs.getFileById(parameters.current.id);

                    if (to_switch) {
                        data.gdbFrontend_fileTabs.switchFile({file: to_switch, is_initial: true});
                    }

                    data.initSem.leave();
                };

                var getFile = function (_file_i) {
                    var _file = parameters.files[_file_i];

                    $.ajax({
                        url: '/api/fs/read',
                        cache: false,
                        method: 'get',
                        data: {
                            path: _file.path
                        },
                        success: function (result_json) {
                            if (result_json.error) {
                                if (result_json.error.not_exists) {
                                    var msg = 'Source file not found. ('+_file.path+')'
                                    GDBFrontend.showMessageBox({text: msg});
                                    console.trace('[GDBFrontend]', msg);
                                } else if (result_json.error.not_permitted) {
                                    GDBFrontend.showMessageBox({text: 'Access denied.'});
                                } else {
                                    GDBFrontend.showMessageBox({text: 'An error occured.'});
                                    console.trace('An error occured.');
                                }

                                if (_file_i < parameters.files.length-1) {
                                    getFile(_file_i+1);
                                } else {
                                    switchFile();
                                }

                                return;
                            } else if (!result_json.ok) {
                                GDBFrontend.showMessageBox({text: 'An error occured.'});
                                console.trace('An error occured.');

                                if (_file_i < parameters.files.length-1) {
                                    getFile(_file_i+1);
                                }

                                return;
                            }

                            var file = data.gdbFrontend_fileTabs.openFile({
                                file: {
                                    path: _file.path,
                                    content: result_json.file.content
                                },
                                switch: false,
                                is_initial: true
                            });

                            if (file.file) {
                                data.debug.placeEditorFileBreakpoints({editor_file: file.file});
                                !file.is_switched && data.gdbFrontend_fileTabs.switchFile({file: file.file, is_initial: true});
                            }

                            editor_file = file.file;

                            if (_file_i < parameters.files.length-1) {
                                getFile(_file_i+1);
                            } else {
                                switchFile();
                            }
                        },
                        error: function () {
                            GDBFrontend.showMessageBox({text: 'An error occured.'});
                            console.trace("An error occured.");

                            if (file_i < parameters.files.length-1) {
                                getFile(file_i+1);
                            } else {
                                switchFile();
                            }
                        }
                    });
                };

                if (parameters.files.length) {
                    getFile(0);
                } else {
                    data.initSem.leave();
                }
            };

            data.initSem = new AsynchronousSemaphore(function () {
                data.debug.getState({
                    is_stop: true,
                    return: function () {
                    }
                });
            });

            data.initSem.lock(2);

            data.$gdbFrontend_fileTabs.on('FileTabs_preload.GDBFrontend', function (event, parameters) {
                preloadFiles(parameters);
            });

            var last_fileBrowser_path = '/';

            GDBFrontend.components.fileBrowser.$fileBrowser.on('FileBrowser_entered_directory.GDBFrontend', function (event, parameters) {
                last_fileBrowser_path = parameters.directory.path;
            });

            data.$gdbFrontend_load_loadBtn.on('click.GDBFrontend', function (event) {
                GDBFrontend.components.fileBrowser.open({
                    path: last_fileBrowser_path,
                    on_file_selected: function (parameters) {
                        $.ajax({
                            url: '/api/load',
                            cache: false,
                            method: 'get',
                            data: {
                                file: parameters.file.path
                            },
                            success: function (result_json) {
                            },
                            error: function () {
                                GDBFrontend.showMessageBox({text: 'An error occured.'});
                                console.trace('An error occured.');
                            }
                        });

                        GDBFrontend.components.fileBrowser.close();
                    }
                });
            });

            data.$GDBFrontend_load_connectBtn_openable_connectBtn.on('click.GDBFrontend', function (event) {
                var address = data.$GDBFrontend_load_connectBtn_openable_addressInput.val();

                if ((address.length < 10) || (address.indexOf(':') < 0)) {
                    GDBFrontend.showMessageBox({text: "Provide a gdbserver address like \"127.0.0.1:2345\" (host:port)."});
                    return;
                }

                $.ajax({
                    url: '/api/connect',
                    cache: false,
                    method: 'get',
                    data: {
                        address: address
                    },
                    success: function (result_json) {
                    },
                    error: function () {
                        GDBFrontend.showMessageBox({text: 'An error occured.'});
                        console.trace('An error occured.');
                    }
                });
            });

            $gdbFrontend.on('GDBFrontend_initialize.GDBFrontend', function (event) {
                data.init();
            });

            $gdbFrontend.on('GDBFrontend_comply.GDBFrontend', function (event) {
                data.comply();
            });

            data.init = function () {
                if (GDBFrontend.gui_mode == GDBFrontend.GUI_MODE_GUI) {
                    data.qWebChannel = new QWebChannel(qt.webChannelTransport, function (channel) {});
                }

                if (GDBFrontend.gui_mode == GDBFrontend.GUI_MODE_WEB_TMUX) {
                    var $iframe = $('<iframe></iframe>');
                    $iframe.addClass('GDBFrontend_terminal_iframe');
                    $iframe.appendTo(data.$GDBFrontend_terminal);
                    $iframe.attr('src', 'http://'+GDBFrontend.config.host_address+':'+GDBFrontend.config.gotty_port);
                    $gdbFrontend_layout_bottom.show();
                } else {
                    $gdbFrontend_layout_bottom.hide();
                }

                data.$gdbFrontend_watches.Watches();
                data.gdbFrontend_watches = data.$gdbFrontend_watches.data('Watches');
                data.components.watches = data.gdbFrontend_watches;

                data.$gdbFrontend_sourceTree.SourceTree();
                data.gdbFrontend_sourceTree = data.$gdbFrontend_sourceTree.data('SourceTree');
                data.components.sourceTree = data.gdbFrontend_sourceTree;

                data.$gdbFrontend_fileTabs.FileTabs();
                data.gdbFrontend_fileTabs = data.$gdbFrontend_fileTabs.data('FileTabs');
                data.components.fileTabs = data.gdbFrontend_fileTabs;

                data.$gdbFrontend_breakpointsEditor.BreakpointsEditor();
                data.gdbFrontend_breakpointsEditor = data.$gdbFrontend_breakpointsEditor.data('BreakpointsEditor');
                data.components.breakpointsEditor = data.gdbFrontend_breakpointsEditor;

                data.$gdbFrontend_threadsEditor.ThreadsEditor();
                data.gdbFrontend_threadsEditor = data.$gdbFrontend_threadsEditor.data('ThreadsEditor');
                data.components.threadsEditor = data.gdbFrontend_threadsEditor;

                data.$gdbFrontend_stackTrace.StackTrace();
                data.gdbFrontend_stackTrace = data.$gdbFrontend_stackTrace.data('StackTrace');
                data.components.stackTrace = data.gdbFrontend_stackTrace;

                data.$gdbFrontend_variablesExplorer.VariablesExplorer();
                data.gdbFrontend_variablesExplorer = data.$gdbFrontend_variablesExplorer.data('VariablesExplorer');
                data.components.variablesExplorer = data.gdbFrontend_variablesExplorer;

                data.debug.socket = new WebSocket('ws://'+GDBFrontend.config.host_address+':'+GDBFrontend.config.server_port);

                data.debug.socket.onopen = function (event) {
                    GDBFrontend.verbose('Connected to debugging server.');
                };

                data.debug.socket.onclose = function (event) {
                    GDBFrontend.verbose('Connection closed to debugging server.');
                    alert('Connection closed to GDBFrontend server!');
                    window.location.reload();
                };

                data.debug.socket.onmessage = function (event) {
                    GDBFrontend.verbose('Message:', event);
                    response = JSON.parse(event.data);
                    $gdbFrontend.trigger("GDBFrontend_debug_"+response.event, response);
                };

                data.debug.socket.onerror = function (event) {
                    GDBFrontend.verbose('Debugging server message error.');
                };

                data.initSem.leave();

                data.comply();

                $gdbFrontend.trigger("GDBFrontend_initialized");
            };

            data.debug.emit = function (event, message) {
                if (message === undefined) {
                    message = {};
                }

                message.event = event;
                message = JSON.stringify(message);
                data.debug.socket.send(message);
            };

            data.debug.setContinue = function (parameters) {
                data.debug.clearEditorStops();
                data.debug.setState({
                    event: parameters.event,
                    state: parameters.state,
                    is_continue: true
                });
            };

            data.debug.setExited = function (parameters) {
                data.debug.clearEditorStops();
                data.debug.setState({
                    event: parameters.event,
                    state: parameters.state
                });
            };

            data.debug.setStop = function (parameters) {
                data.debug.clearEditorStops();
                data.debug.setState({
                    event: parameters.event,
                    state: parameters.state,
                    is_stop: true
                });
            };

            data.debug.setWatches = function () {
                data.gdbFrontend_watches.watches.every(function (_watch, _watch_i) {
                    if (_watch.is_adder) {
                        return true;
                    }

                    $.ajax({
                        url: '/api/frame/variable',
                        cache: false,
                        method: 'get',
                        data: {
                            expression: _watch.expression
                        },
                        success: function (result_json) {
                            if (!result_json.ok) {
                                GDBFrontend.showMessageBox({text: 'An error occured.'});
                                console.trace('An error occured.');
                                return;
                            }

                            if (!result_json.variable) {
                                return;
                            }

                            _watch.setValue({value: result_json.variable.value});
                        },
                        error: function () {
                            GDBFrontend.showMessageBox({text: 'An error occured.'});
                            console.trace('An error occured.');
                        }
                    });

                    return true;
                });
            };

            $gdbFrontend.on('GDBFrontend_debug_exited.GDBFrontend', function (event, message) {
                data.debug.setExited(message);
            });

            $gdbFrontend.on('GDBFrontend_debug_stop.GDBFrontend', function (event, message) {
                data.debug.setStop(message);
            });

            $gdbFrontend.on('GDBFrontend_debug_cont.GDBFrontend', function (event, message) {
                data.debug.setContinue(message);
            });

            $gdbFrontend.on('GDBFrontend_debug_new_thread.GDBFrontend', function (event, message) {
                data.debug.setState({state: message.state});
            });

            $gdbFrontend.on('GDBFrontend_debug_breakpoint_created.GDBFrontend', function (event, message) {
                data.debug.getState();
            });

            $gdbFrontend.on('GDBFrontend_debug_breakpoint_modified.GDBFrontend', function (event, message) {
                data.debug.getState();
            });

            $gdbFrontend.on('GDBFrontend_debug_breakpoint_deleted.GDBFrontend', function (event, message) {
                data.debug.getState();
            });

            $gdbFrontend.on('GDBFrontend_debug_new_objfile.GDBFrontend', function (event, message) {
                data.debug.setState({state: message.state, reload_files: true});
            });

            $gdbFrontend.on('GDBFrontend_debug_get_sources_return.GDBFrontend', function (event, message) {
                data.gdbFrontend_sourceTree.load({files: message.state.sources});
                data.gdbFrontend_sourceTree.render();
            });

            data.$gdbFrontend_sourceTree.on('SourceTree_item_selected.GDBFrontend', function (event, parameters) {
                $.ajax({
                    url: '/api/fs/read',
                    cache: false,
                    method: 'get',
                    data: {
                        path: parameters.item.file[$.fn.SourceTree.TREE_ITEM_PATH]
                    },
                    success: function (result_json) {
                        if (result_json.error) {
                            if (result_json.error.not_exists) {
                                GDBFrontend.showMessageBox({text: 'Path not found.'});
                                console.trace("Path not found.");
                            } else if (result_json.error.not_permitted) {
                                GDBFrontend.showMessageBox({text: 'Access denied.'});
                            } else {
                                GDBFrontend.showMessageBox({text: 'An error occured.'});
                                console.trace('An error occured.');
                            }

                            return;
                        } else if (!result_json.ok) {
                            GDBFrontend.showMessageBox({text: 'An error occured.'});
                            console.trace('An error occured.');
                        }

                        var file = data.gdbFrontend_fileTabs.openFile({
                            file: {
                                name: parameters.item.file[$.fn.SourceTree.TREE_ITEM_NAME],
                                path: parameters.item.file[$.fn.SourceTree.TREE_ITEM_PATH],
                                content: result_json.file.content
                            },
                            switch: false
                        });

                        if (file.file) {
                            data.debug.placeEditorFileBreakpoints({editor_file: file.file});
                            !file.is_switched && data.gdbFrontend_fileTabs.switchFile({file: file.file});
                        }
                    },
                    error: function () {
                        GDBFrontend.showMessageBox({text: 'Path not found.'});
                        console.trace("Path not found.");
                    }
                });
            });

            data.openSource = function (parameters) {
                $.ajax({
                    url: '/api/fs/read',
                    cache: false,
                    method: 'get',
                    data: {
                        path: parameters.file.path
                    },
                    success: function (result_json) {
                        if (result_json.error) {
                            if (result_json.error.not_exists) {
                                GDBFrontend.showMessageBox({text: 'Path not found.'});
                                console.trace("Path not found.");
                            } else if (result_json.error.not_permitted) {
                                GDBFrontend.showMessageBox({text: 'Access denied.'});
                            } else {
                                GDBFrontend.showMessageBox({text: 'An error occured.'});
                                console.trace('An error occured.');
                            }

                            return;
                        } else if (!result_json.ok) {
                            GDBFrontend.showMessageBox({text: 'An error occured.'});
                            console.trace('An error occured.');
                        }

                        var file = data.gdbFrontend_fileTabs.openFile({
                            file: {
                                name: parameters.file.name,
                                path: parameters.file.path,
                                content: result_json.file.content
                            },
                            switch: false
                        });

                        if (file.file) {
                            data.debug.placeEditorFileBreakpoints({editor_file: file.file});
                            !file.is_switched && data.gdbFrontend_fileTabs.switchFile({file: file.file});
                        }
                    },
                    error: function () {
                        GDBFrontend.showMessageBox({text: 'Path not found.'});
                        console.trace("Path not found.");
                    }
                });
            };

            data.debug.getState = function (parameters) {
                if (parameters === undefined) {
                    parameters = {};
                }

                $.ajax({
                    url: '/api/state',
                    cache: false,
                    method: 'get',
                    data: {
                    },
                    success: function (result_json) {
                        data.debug.setState({
                            is_stop: parameters.is_stop,
                            state: result_json.state
                        });
                        parameters.return && parameters.return();
                    },
                    error: function () {
                        GDBFrontend.showMessageBox({text: 'An error occured.'});
                        console.trace('An error occured.');
                    }
                });
            };

            data.debug.setState = function (parameters) {
                var setState_parameters = parameters;

                data.debug.state = parameters.state;

                data.gdbFrontend_sourceTree.load({files: parameters.state.sources});
                data.gdbFrontend_sourceTree.render();

                data.debug.clearEditorBreakpoints();

                data.debug.breakpoints = [];
                parameters.state.breakpoints.forEach(function (_gdb_bp, _gdb_bp_i) {
                    var loc = _gdb_bp.location.match(/-source (.+?) -line (\d+)/i);

                    if (loc) {
                        var bp = {
                            gdb_breakpoint: _gdb_bp
                        };

                        bp.file = loc[1];
                        bp.line = loc[2];

                        data.debug.breakpoints.push(bp);
                    }
                });

                data.debug.placeEditorBreakpoints();

                data.gdbFrontend_breakpointsEditor.load({breakpoints: data.debug.breakpoints});
                data.gdbFrontend_breakpointsEditor.render();

                data.debug.threads = [];
                parameters.state.inferior.threads.forEach(function (_thread, _thread_i) {
                    data.debug.threads.push(_thread);
                });

                data.gdbFrontend_threadsEditor.load({threads: data.debug.threads});
                data.gdbFrontend_threadsEditor.render();

                data.debug.thread = data.gdbFrontend_threadsEditor.current;

                data.debug.frames = [];
                data.debug.thread.frame && data.debug.thread.frame.backtrace.forEach(function (_frame, _frame_i) {
                    data.debug.frames.push(_frame);
                });

                data.gdbFrontend_stackTrace.load({frames: data.debug.frames});

                if (parameters.state.selected_frame) {
                    data.gdbFrontend_stackTrace.setCurrent({frame: parameters.state.selected_frame});
                }

                data.gdbFrontend_stackTrace.render();

                if ((parameters.is_stop && parameters.state.selected_frame) || setState_parameters.reload_files) {
                    var editor_file = data.gdbFrontend_fileTabs.getFileByPath(parameters.state.current_location.file);

                    var _continue = function () {
                        editor_file.clearStop()
                        editor_file.setStop({line: parameters.state.current_location.line})

                        setTimeout(function () {
                            editor_file.ace.scrollToLine(parameters.state.current_location.line, true, true, function () {});
                            editor_file.ace.gotoLine(parameters.state.current_location.line, 0, true);
                        }, 0);
                    };

                    if (!editor_file || setState_parameters.reload_files) {
                        $.ajax({
                            url: '/api/fs/read',
                            cache: false,
                            method: 'get',
                            data: {
                                path: parameters.state.current_location.file
                            },
                            success: function (result_json) {
                                if (result_json.error) {
                                    if (result_json.error.not_exists) {
                                        var msg = 'Source file not found. ('+parameters.state.current_location.file+')'
                                        GDBFrontend.showMessageBox({text: msg});
                                        console.trace('[GDBFrontend]', msg);
                                    } else if (result_json.error.not_permitted) {
                                        GDBFrontend.showMessageBox({text: 'Access denied.'});
                                    } else {
                                        GDBFrontend.showMessageBox({text: 'An error occured.'});
                                        console.trace('An error occured.');
                                    }

                                    return;
                                } else if (!result_json.ok) {
                                    GDBFrontend.showMessageBox({text: 'An error occured.'});
                                    console.trace('An error occured.');
                                }

                                if (setState_parameters.reload_files) {
                                    editor_file.setContent({content: result_json.file.content});
                                } else {
                                    var file = data.gdbFrontend_fileTabs.openFile({
                                        file: {
                                            path: parameters.state.current_location.file,
                                            content: result_json.file.content
                                        },
                                        switch: false
                                    });

                                    if (file.file) {
                                        data.debug.placeEditorFileBreakpoints({editor_file: file.file});
                                        !file.is_switched && data.gdbFrontend_fileTabs.switchFile({file: file.file});
                                    }

                                    editor_file = file.file;

                                    _continue();
                                }
                            },
                            error: function () {
                                GDBFrontend.showMessageBox({text: 'Path not found.'});
                                console.trace("Path not found.");
                            }
                        });
                    } else {
                        data.gdbFrontend_fileTabs.switchFile({file: editor_file})
                        _continue();
                    }
                }

                data.components.variablesExplorer.setLocation(parameters.state.current_location);

                data.components.variablesExplorer.load({
                    variables: parameters.state.selected_frame
                        ? parameters.state.selected_frame.variables
                        : []
                });
                data.components.variablesExplorer.render();

                if (parameters.is_stop && parameters.state.selected_frame) {
                    data.debug.setWatches();
                }
            };

            data.debug.clearEditorFileBreakpoint = function (parameters) {
                var editor_file = parameters.editor_file ?
                                  parameters.editor_file:
                                  data.gdbFrontend_fileTabs.getFileByPath(parameters.file);

                if (!editor_file) return false;

                return editor_file.delBreakpoint({
                    line: parameters.line
                });
            };

            data.debug.clearEditorFileBreakpoints = function (parameters) {
                if (!data.gdbFrontend_fileTabs.files.length) return false;

                var editor_file = parameters.editor_file ?
                                  parameters.editor_file:
                                  data.gdbFrontend_fileTabs.getFileByPath(parameters.file);

                if (!editor_file) return false;

                data.debug.breakpoints.forEach(function (_bp, _bp_i) {
                    if (!_bp.file || (_bp.file != editor_file.path)) return true;
                    data.debug.clearEditorFileBreakpoint({editor_file: editor_file, line: _bp.line});
                });
            };

            data.debug.clearEditorBreakpoints = function (parameters) {
                if (!data.gdbFrontend_fileTabs.files.length) return false;

                data.debug.breakpoints.forEach(function (_bp, _bp_i) {
                    if (!_bp.file) return true;
                    data.debug.clearEditorFileBreakpoint({file: _bp.file, line: _bp.line});
                });
            };

            data.debug.placeEditorFileBreakpoint = function (parameters) {
                var editor_file = parameters.editor_file ?
                                  parameters.editor_file:
                                  data.gdbFrontend_fileTabs.getFileByPath(parameters.file);

                if (!editor_file) return false;

                return editor_file.addBreakpoint({
                    line: parameters.line
                });
            };

            data.debug.placeEditorFileBreakpoints = function (parameters) {
                if (!data.gdbFrontend_fileTabs.files.length) return false;

                var editor_file = parameters.editor_file ?
                                  parameters.editor_file:
                                  data.gdbFrontend_fileTabs.getFileByPath(parameters.file);

                if (!editor_file) return false;

                data.debug.breakpoints.forEach(function (_bp, _bp_i) {
                    if (!_bp.file || (_bp.file != editor_file.path)) return true;
                    data.debug.placeEditorFileBreakpoint({editor_file: editor_file, line: _bp.line});
                });
            };

            data.debug.placeEditorBreakpoints = function (parameters) {
                if (!data.gdbFrontend_fileTabs.files.length) return false;

                data.debug.breakpoints.forEach(function (_bp, _bp_i) {
                    if (!_bp.file) return true;
                    data.debug.placeEditorFileBreakpoint({file: _bp.file, line: _bp.line});
                });
            };

            data.debug.clearEditorStops = function (parameters) {
                if (!data.gdbFrontend_fileTabs.files.length) return false;

                data.gdbFrontend_fileTabs.files.forEach(function (_file, _file_i) {
                    _file.clearStop();
                });
            };

            data.$gdbFrontend_breakpointsEditor.on('BreakpointsEditor_breakpoint_enabled_changed.GDBFrontend', function (event, parameters) {
                $.ajax({
                    url: '/api/breakpoint/set_enabled',
                    cache: false,
                    method: 'get',
                    data: {
                        number: parameters.breakpoint.gdb_breakpoint.number,
                        is_enabled: parameters.is_enabled
                    },
                    success: function (result_json) {
                    },
                    error: function () {
                        GDBFrontend.showMessageBox({text: 'An error occured.'});
                        console.trace('An error occured.');
                    }
                });
            });

            data.$gdbFrontend_breakpointsEditor.on('BreakpointsEditor_breakpoint_removed.GDBFrontend', function (event, parameters) {
                $.ajax({
                    url: '/api/breakpoint/del',
                    cache: false,
                    method: 'get',
                    data: {
                        number: parameters.breakpoint.gdb_breakpoint.number
                    },
                    success: function (result_json) {
                    },
                    error: function () {
                        GDBFrontend.showMessageBox({text: 'An error occured.'});
                        console.trace('An error occured.');
                    }
                });
            });

            data.$gdbFrontend_breakpointsEditor.on('BreakpointsEditor_breakpoint_selected.GDBFrontend', function (event, parameters) {
                var editor_file = data.gdbFrontend_fileTabs.getFileByPath(parameters.breakpoint.file);

                var _continue = function () {
                    setTimeout(function () {
                        editor_file.ace.scrollToLine(parameters.breakpoint.line, true, false, function () {});
                        editor_file.ace.gotoLine(parameters.breakpoint.line, 0, true);
                    }, 0);
                };

                if (!editor_file) {
                    $.ajax({
                        url: '/api/fs/read',
                        cache: false,
                        method: 'get',
                        data: {
                            path: parameters.breakpoint.file
                        },
                        success: function (result_json) {
                            if (result_json.error) {
                                if (result_json.error.not_exists) {
                                    GDBFrontend.showMessageBox({text: 'Path not found.'});
                                    console.trace("Path not found.");
                                } else if (result_json.error.not_permitted) {
                                    GDBFrontend.showMessageBox({text: 'Access denied.'});
                                } else {
                                    GDBFrontend.showMessageBox({text: 'An error occured.'});
                                    console.trace('An error occured.');
                                }

                                return;
                            } else if (!result_json.ok) {
                                GDBFrontend.showMessageBox({text: 'An error occured.'});
                                console.trace('An error occured.');
                            }

                            var file = data.gdbFrontend_fileTabs.openFile({
                                file: {
                                    path: parameters.breakpoint.file,
                                    content: result_json.file.content
                                },
                                switch: false
                            });

                            if (file.file) {
                                data.debug.placeEditorFileBreakpoints({editor_file: file.file});
                                !file.is_switched && data.gdbFrontend_fileTabs.switchFile({file: file.file});
                            }

                            editor_file = file.file;

                            _continue();
                        },
                        error: function () {
                            GDBFrontend.showMessageBox({text: 'An error occured.'});
                            console.trace('An error occured.');
                        }
                    });
                } else {
                    data.gdbFrontend_fileTabs.switchFile({file: editor_file})
                    _continue();
                }
            });

            data.$gdbFrontend_threadsEditor.on('ThreadsEditor_thread_selected.GDBFrontend', function (event, parameters) {
                $.ajax({
                    url: '/api/thread/switch',
                    cache: false,
                    method: 'get',
                    data: {
                        global_num: parameters.thread.global_num
                    },
                    success: function (result_json) {
                        data.debug.getState();
                    },
                    error: function () {
                        GDBFrontend.showMessageBox({text: 'An error occured.'});
                        console.trace('An error occured.');
                    }
                });
            });

            data.$gdbFrontend_stackTrace.on('StackTrace_frame_selected.GDBFrontend', function (event, parameters) {
                $.ajax({
                    url: '/api/stack/switch',
                    cache: false,
                    method: 'get',
                    data: {
                        pc: parameters.frame.pc
                    },
                    success: function (result_json) {
                        data.debug.getState({return: function () {
                            var editor_file = data.gdbFrontend_fileTabs.getFileByPath(parameters.frame.file.path);

                            var _continue = function () {
                                setTimeout(function () {
                                    editor_file.ace.scrollToLine(parameters.frame.line, true, true, function () {});
                                    editor_file.ace.gotoLine(parameters.frame.line, 0, true);
                                }), 100;
                            };

                            if (!editor_file) {
                                $.ajax({
                                    url: '/api/fs/read',
                                    cache: false,
                                    method: 'get',
                                    data: {
                                        path: parameters.frame.file.path
                                    },
                                    success: function (result_json) {
                                        if (result_json.error) {
                                            if (result_json.error.not_exists) {
                                                var msg = 'Source file not found. ('+parameters.frame.file.path+')'
                                                GDBFrontend.showMessageBox({text: msg});
                                                console.trace('[GDBFrontend]', msg);
                                            } else if (result_json.error.not_permitted) {
                                                GDBFrontend.showMessageBox({text: 'Access denied.'});
                                            } else {
                                                GDBFrontend.showMessageBox({text: 'An error occured.'});
                                                console.trace('An error occured.');
                                            }

                                            return;
                                        } else if (!result_json.ok) {
                                            GDBFrontend.showMessageBox({text: 'An error occured.'});
                                            console.trace('An error occured.');
                                        }

                                        var file = data.gdbFrontend_fileTabs.openFile({
                                            file: {
                                                path: parameters.frame.file.path,
                                                content: result_json.file.content
                                            },
                                            switch: false
                                        });

                                        if (file.file) {
                                            data.debug.placeEditorFileBreakpoints({editor_file: file.file});
                                            !file.is_switched && data.gdbFrontend_fileTabs.switchFile({file: file.file});
                                        }

                                        editor_file = file.file;

                                        _continue();
                                    },
                                    error: function () {
                                        GDBFrontend.showMessageBox({text: 'An error occured.'});
                                        console.trace('An error occured.');
                                    }
                                });
                            } else {
                                data.gdbFrontend_fileTabs.switchFile({file: editor_file})
                                _continue();
                            }
                        }});
                    },
                    error: function () {
                        GDBFrontend.showMessageBox({text: 'An error occured.'});
                        console.trace('An error occured.');
                    }
                });
            });

            data.$gdbFrontend_variablesExplorer.on('VariablesExplorer_item_toggle.GDBFrontend', function (event, parameters) {
                if (parameters.item.is_opened) {
                    parameters.item.close();
                    return;
                }

                parameters.item.setLoading(true);

                var tree = [];

                parameters.item.tree.forEach(function (_member, _member_i) {
                    tree.push(_member.variable.name);
                });

                var qs = {
                    variable: parameters.item.variable.name
                };

                if (tree.length > 1) {
                    qs['expression'] = tree.join('.');
                }

                $.ajax({
                    url: '/api/frame/variable',
                    cache: false,
                    method: 'get',
                    data: qs,
                    success: function (result_json) {
                        if (!result_json.ok) {
                            GDBFrontend.showMessageBox({text: 'An error occured.'});
                            console.trace('An error occured.');

                            parameters.item.setLoading(false);

                            return;
                        }

                        parameters.item.load({
                            members: result_json.variable.members
                        });

                        parameters.item.render();
                        parameters.item.open({is_preload: parameters.is_preload});
                        parameters.item.setLoading(false);
                    },
                    error: function () {
                        GDBFrontend.showMessageBox({text: 'An error occured.'});
                        console.trace('An error occured.');

                        parameters.item.setLoading(false);
                    }
                });
            });

            data.$GDBFrontend_runtimeControls_btn__run.on('click.GDBFrontend', function (event) {
                $.ajax({
                    url: '/api/runtime/run',
                    cache: false,
                    method: 'get',
                    data: {
                    },
                    success: function (result_json) {
                    },
                    error: function () {
                        GDBFrontend.showMessageBox({text: 'An error occured.'});
                        console.trace('An error occured.');
                    }
                });
            });

            data.$GDBFrontend_runtimeControls_btn__pause.on('click.GDBFrontend', function (event) {
                $.ajax({
                    url: '/api/runtime/pause',
                    cache: false,
                    method: 'get',
                    data: {
                    },
                    success: function (result_json) {
                    },
                    error: function () {
                        GDBFrontend.showMessageBox({text: 'An error occured.'});
                        console.trace('An error occured.');
                    }
                });
            });

            data.$GDBFrontend_runtimeControls_btn__continue.on('click.GDBFrontend', function (event) {
                $.ajax({
                    url: '/api/runtime/continue',
                    cache: false,
                    method: 'get',
                    data: {
                    },
                    success: function (result_json) {
                    },
                    error: function () {
                        GDBFrontend.showMessageBox({text: 'An error occured.'});
                        console.trace('An error occured.');
                    }
                });
            });

            data.$GDBFrontend_runtimeControls_btn__n.on('click.GDBFrontend', function (event) {
                $.ajax({
                    url: '/api/runtime/next',
                    cache: false,
                    method: 'get',
                    data: {
                    },
                    success: function (result_json) {
                    },
                    error: function () {
                        GDBFrontend.showMessageBox({text: 'An error occured.'});
                        console.trace('An error occured.');
                    }
                });
            });

            data.$GDBFrontend_runtimeControls_btn__s.on('click.GDBFrontend', function (event) {
                $.ajax({
                    url: '/api/runtime/step',
                    cache: false,
                    method: 'get',
                    data: {
                    },
                    success: function (result_json) {
                    },
                    error: function () {
                        GDBFrontend.showMessageBox({text: 'An error occured.'});
                        console.trace('An error occured.');
                    }
                });
            });

            data.$GDBFrontend_runtimeControls_btn__si.on('click.GDBFrontend', function (event) {
                $.ajax({
                    url: '/api/runtime/stepi',
                    cache: false,
                    method: 'get',
                    data: {
                    },
                    success: function (result_json) {
                    },
                    error: function () {
                        GDBFrontend.showMessageBox({text: 'An error occured.'});
                        console.trace('An error occured.');
                    }
                });
            });

            data.$GDBFrontend_runtimeControls_btn__t.on('click.GDBFrontend', function (event) {
                $.ajax({
                    url: '/api/runtime/terminate',
                    cache: false,
                    method: 'get',
                    data: {
                    },
                    success: function (result_json) {
                    },
                    error: function () {
                        GDBFrontend.showMessageBox({text: 'An error occured.'});
                        console.trace('An error occured.');
                    }
                });
            });

            data.comply = function (parameters) {
                if (parameters === undefined) {
                    parameters = {};
                }
            };

            $(window).on('resize.GDBFrontend', function (event) {
                data.comply({event: event});
            });

            data.init();
        });
    }

    $.fn.GDBFrontend = function(method) {
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method '+method+' does not exist on jQuery.GDBFrontend');
        }
    };

    $.fn.GDBFrontend.event = function (event) {
        return 'GDBFrontend_'+event;
    };

    $.fn.GDBFrontend.events = function (events) {
        return events.map(function (e) {
            return $.fn.GDBFrontend.event(e);
        }).join(', ');
    };
})(jQuery);
