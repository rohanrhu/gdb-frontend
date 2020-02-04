/*
 * gdb-frontend is a easy, flexible and extensionable gui debugger
 *
 * https://github.com/rohanrhu/gdb-frontend
 * https://oguzhaneroglu.com/projects/gdb-frontend/
 *
 * Licensed under GNU/GPLv3
 * Copyright (C) 2019, Oğuzhan Eroğlu (https://oguzhaneroglu.com/) <rohanrhu2@gmail.com>
*/

(function($){
    var pathFileName = function (path) {
        if (!path.length) {
            return false;
        }

        path = path.replace(/\\/g, '/');
        var s = path.split('/');

        if (path[0] == '/') {
            s = s.slice(1);
        }

        return s[s.length-1];
    };

    var pathTree = function (path) {
        if (!path.length) {
            return [];
        }

        path = path.replace(/\\/g, '/');
        var s = path.split('/');

        if (path[0] == '/') {
            s = s.slice(1);
        }

        return s;
    };

    var methods = {};

    methods.init = function (parameters) {
        var t_init = this;
        var $elements = $(this);

        if (typeof parameters == 'undefined') {
            parameters = {};
        }

        t_init.parameters = parameters;

        $elements.each(function () {
            var $fileTabs = $(this);

            $fileTabs.off('.FileTabs');
            $fileTabs.find('*').off('.FileTabs');

            var data = {};
            $fileTabs.data('FileTabs', data);
            data.$fileTabs = $fileTabs;

            data.id = ++$.fn.FileTabs.id_i;

            var $fileTabs_tabs = $fileTabs.find('.FileTabs_tabs');
            var $fileTabs_tabs_items = $fileTabs.find('.FileTabs_tabs_items');
            var $fileTabs_tabs_items_item__proto = $fileTabs.find('.FileTabs_tabs_items_item.__proto');

            var $fileTabs_editors = $fileTabs.find('.FileTabs_editors');
            var $fileTabs_editors_noItem = $fileTabs.find('.FileTabs_editors_noItem');
            var $fileTabs_editors_items = $fileTabs.find('.FileTabs_editors_items');
            var $fileTabs_editors_items_item__proto = $fileTabs.find('.FileTabs_editors_items_item.__proto');

            data.animation_duration = 100;

            data.is_passive = false;
            data.files = [];
            data.file_i = 0;

            data.current = false;

            data.openFile = function (parameters) {
                if (parameters === undefined) {
                    parameters = {};
                }

                if (parameters.switch === undefined) {
                    parameters.switch = false;
                }

                var file;

                if (file = data.getFile(parameters.file)) {
                    return {
                        exists: true,
                        file: file
                    };
                }

                file = {};

                file.id = ++data.file_i;
                file.path = parameters.file.path;
                file.breakpoints = [];
                file.stopped_line = 0;
                file.tokenMouseoverTimeout = 0;
                file.tokenMouseoutTimeout = 0;
                file.currentHoveredToken = null;

                if (parameters.file.name === undefined) {
                    file.name = pathFileName(parameters.file.path);
                } else {
                    file.name = parameters.file.name;
                }

                file.$tab = $fileTabs_tabs_items_item__proto.clone();
                file.$tab.removeClass('__proto');
                file.$tab.appendTo($fileTabs_tabs_items);

                file.$tab_pathTooltip = file.$tab.find('.FileTabs_tabs_items_item_pathTooltip');
                file.$tab_fileName = file.$tab.find('.FileTabs_tabs_items_item_fileName');
                file.$tab_closeBtn = file.$tab.find('.FileTabs_tabs_items_item_closeBtn');

                file.$tab_fileName.html(file.name);

                file.$tab_closeBtn.on('click.FileTabs'+data.id, function (event) {
                    data.closeFile({file: file});
                });

                file.$tab_fileName.on('click.FileTabs'+data.id, function (event) {
                    data.switchFile({file: file});
                });

                file.tab_pathTooltip_hover_delay = 500;
                file.tab_pathTooltip_hover_timeout = 0;

                file.$tab_pathTooltip.hide();

                (file.path) && (function () {
                    file.$tab_pathTooltip.find('.FileTabs_tabs_items_item_pathTooltip_path').html(file.path);
                    file.$tab_pathTooltip.appendTo($('body'));

                    file.$tab_pathTooltip.find('.FileTabs_tabs_items_item_pathTooltip_copyBtn').on('click.FileTabs'+data.id, function (event) {
                        GDBFrontend.copyToClipboard(file.path);
                    });

                    file.$tab.on('mouseover.FileTabs'+data.id, function (event) {
                        clearTimeout(file.tab_pathTooltip_hover_timeout);
                        file.tab_pathTooltip_hover_timeout = setTimeout(function () {
                            file.$tab_pathTooltip.show();

                            var tooltip_x = file.$tab.offset().left - (
                                (file.$tab_pathTooltip.outerWidth() - file.$tab.outerWidth()) / 2
                            );

                            file.$tab_pathTooltip.css({
                                top: file.$tab.offset().top + file.$tab.outerHeight() + 10,
                                left: tooltip_x
                            });
                        }, file.tab_pathTooltip_hover_delay);
                    });

                    file.$tab.on('mouseout.FileTabs'+data.id, function (event) {
                        clearTimeout(file.tab_pathTooltip_hover_timeout);
                        file.tab_pathTooltip_hover_timeout = setTimeout(function () {
                            file.$tab_pathTooltip.hide();
                        }, file.tab_pathTooltip_hover_delay/2);
                    });

                    file.$tab_pathTooltip.on('mouseover.FileTabs'+data.id, function (event) {
                        clearTimeout(file.tab_pathTooltip_hover_timeout);
                    });

                    file.$tab_pathTooltip.on('mouseout.FileTabs'+data.id, function (event) {
                        clearTimeout(file.tab_pathTooltip_hover_timeout);
                        file.tab_pathTooltip_hover_timeout = setTimeout(function () {
                            file.$tab_pathTooltip.hide();
                        }, file.tab_pathTooltip_hover_delay/2);
                    });
                })();

                file.$editor = $fileTabs_editors_items_item__proto.clone();
                file.$editor.removeClass('__proto');
                file.$editor.appendTo($fileTabs_editors_items);

                file.$variablePopup = file.$editor.find('.FileTabs_editors_items_item_variablePopup');
                file.$variablePopup_variablesExplorerComp = file.$variablePopup.find('.FileTabs_editors_items_item_variablePopup_variablesExplorerComp');
                file.$variablePopup_variablesExplorer = file.$variablePopup_variablesExplorerComp.find('> .VariablesExplorer');
                file.$variablePopup_variablesExplorer.VariablesExplorer();
                file.variablePopup_variablesExplorer = file.$variablePopup_variablesExplorer.data().VariablesExplorer;

                file.$variablePopup.appendTo($('body'));

                file.variablePopup_variablesExplorer.mark_changes = false;
                file.variablePopup_variablesExplorer.setMaxHeight({max_height: file.$variablePopup.css('max-height')});

                file.$variablePopup_variablesExplorer.on('VariablesExplorer_item_toggle.FileTabs', function (event, parameters) {
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

                            var bottom_y = file.$variablePopup.offset().top + file.$variablePopup.outerHeight();
                            var editor_bottom_y = file.$editor.offset().top + file.$editor.outerHeight();
                            
                            if (bottom_y > editor_bottom_y) {
                                file.$variablePopup.css('top', file.$variablePopup.position().top - file.$variablePopup.outerHeight() - 24);
                            }
                        },
                        error: function () {
                            GDBFrontend.showMessageBox({text: 'An error occured.'});
                            console.trace('An error occured.');
    
                            parameters.item.setLoading(false);
                        }
                    });
                });

                file.$editor_ace = file.$editor.find('.FileTabs_editors_items_item_ace');

                file.ace = ace.edit(file.$editor_ace.get(0));
                file.ace.setReadOnly(true);
                file.ace.setTheme('ace/theme/tomorrow_night_blue');
                file.ace.session.setMode(ace.require('ace/ext/modelist').getModeForPath(file.name).mode);

                file.ace.commands.addCommand({
                    name: 'fuzzySearch',
                    bindKey: {mac: 'cmd-p', win: 'ctrl-p'},
                    readOnly: true,
                    exec: function () {
                        GDBFrontend.components.fuzzyFinder.open({
                            onSelected: function (parameters) {
                                GDBFrontend.components.gdbFrontend.openSource({file: parameters.item.file});
                            }
                        });
                    }
                });

                file.ace.session.on('changeBreakpoint', function (event) {
                });

                file.ace.on('guttermousedown', function (event) {
                    var target = event.domEvent.target;

                    if (target.className.indexOf('ace_gutter-cell') == -1) {
                        return;
                    }

                    event.stop();

                    $fileTabs.trigger('FileTabs_breakpoints_toggle', {
                        file: file,
                        line: event.getDocumentPosition().row+1
                    });
                });
                
                $('body').on('click.FileTabs-'+data.id, function (event) {
                    clearTimeout(file.tokenMouseoverTimeout);
                    clearTimeout(file.tokenMouseoutTimeout);
                    file.closeVariablePopup();
                });
                
                file.$variablePopup.on('click.FileTabs-'+data.id, function (event) {
                    event.stopImmediatePropagation();
                });

                $('body').on('keydown.FileTabs-'+data.id, function (event) {
                    clearTimeout(file.tokenMouseoverTimeout);
                    clearTimeout(file.tokenMouseoutTimeout);
                    
                    var keycode = event.keyCode ? event.keyCode : event.which;
                    if (keycode == 27) {
                        file.closeVariablePopup();
                    }
                });
                
                file.$variablePopup.on('mouseover.FileTabs-'+data.id, function (event) {
                    event.stopImmediatePropagation();
                    clearTimeout(file.tokenMouseoverTimeout);
                    clearTimeout(file.tokenMouseoutTimeout);
                });

                file.$variablePopup.on('mouseout.FileTabs-'+data.id, function (event) {
                    event.stopImmediatePropagation();
                    file.tokenMouseoutTimeout = setTimeout(function () {
                        file.closeVariablePopup();
                    }, 500);
                });
                
                file.ace.on('mousemove', function (event) {
                    if (!GDBFrontend.components.gdbFrontend.debug.state.selected_frame) {
                        return;
                    }
                    
                    clearTimeout(file.tokenMouseoverTimeout);
                    clearTimeout(file.tokenMouseoutTimeout);

                    var position = event.getDocumentPosition();
                    var token = file.ace.session.getTokenAt(position.row, position.column);
                    var pixel_position = file.ace.renderer.$cursorLayer.getPixelPosition(position, true);

                    var x = pixel_position.left + file.$editor.offset().left;
                    var y = pixel_position.top + file.$editor.offset().top;
                    
                    file.tokenMouseoutTimeout = setTimeout(function () {
                        file.closeVariablePopup();
                    }, 500);
                    
                    if (!token || (token.type != 'identifier')) {
                        return;
                    }
                    
                    file.currentHoveredToken = token;
                    
                    file.tokenMouseoverTimeout = setTimeout(function () {
                        $.ajax({
                            url: '/api/frame/variable',
                            cache: false,
                            method: 'get',
                            data: {
                                expression: token.value
                            },
                            success: function (result_json) {
                                if (!result_json.ok) {
                                    GDBFrontend.showMessageBox({text: 'An error occured.'});
                                    console.trace('An error occured.');
                                    file.closeVariablePopup();
                                    return;
                                }
    
                                if (!result_json.variable) {
                                    file.closeVariablePopup();
                                    return;
                                }
    
                                file.openVariablePopup({
                                    variable: result_json.variable,
                                    position: {x, y}
                                });
                            },
                            error: function () {
                                GDBFrontend.showMessageBox({text: 'An error occured.'});
                                console.trace('An error occured.');
                            }
                        });
                    }, 500);
                });

                file.openVariablePopup = function (parameters) {
                    var x = parameters.position.x-10;
                    var y = parameters.position.y+12;
                    
                    file.$variablePopup.css({
                        left: x,
                        top: y
                    });

                    file.$variablePopup.show();
                    
                    file.$variablePopup_variablesExplorer.data().VariablesExplorer.load({variables: [parameters.variable]});
                    file.$variablePopup_variablesExplorer.data().VariablesExplorer.render();

                    var bottom_y = file.$variablePopup.offset().top + file.$variablePopup.outerHeight();
                    var editor_bottom_y = file.$editor.offset().top + file.$editor.outerHeight();
                    
                    if (bottom_y > editor_bottom_y) {
                        file.$variablePopup.css('top', file.$variablePopup.position().top - file.$variablePopup.outerHeight() - 24);
                    }
                };

                file.closeVariablePopup = function () {
                    file.currentHoveredToken = null;
                    file.$variablePopup.hide();
                };

                file.getBreakpoint = function (parameters) {
                    var bp = false;

                    file.breakpoints.forEach(function (_bp, _bp_i) {
                        if (parameters.check(_bp)) {
                            bp = _bp;
                            return false;
                        }
                    });

                    return bp;
                };

                file.getBreakpointByLine = function (line) {
                    return file.getBreakpoint({check: function (parameters) {
                        return line == parameters.line;
                    }});
                };

                file.addBreakpoint = function (parameters) {
                    var is_exists = false;

                    file.breakpoints.forEach(function (_bp, _bp_i) {
                        if (_bp.line == parameters.line) {
                            is_exists = true;
                            return false;
                        }
                    });

                    if (is_exists) return false;

                    file.breakpoints.push({line: parameters.line});
                    file.ace.session.setBreakpoint(parameters.line-1);

                    return true;
                };

                file.delBreakpoint = function (parameters) {
                    var is_exists = false;

                    file.breakpoints.forEach(function (_bp, _bp_i) {
                        if (_bp.line == parameters.line) {
                            file.breakpoints.splice(_bp_i, 1);
                            is_exists = true;
                            return false;
                        }
                    });

                    if (!is_exists) return false;

                    file.ace.session.clearBreakpoint(parameters.line-1);
                };

                file.setStop = function (parameters) {
                    file.stopped_line = parameters.line;
                    file.ace.getSession().addGutterDecoration(file.stopped_line-1, 'FileTabs__stopped');
                };

                file.clearStop = function () {
                    if (file.stopped_line == 0) return;

                    file.ace.getSession().removeGutterDecoration(file.stopped_line-1, 'FileTabs__stopped');
                    file.stopped_line = 0;
                };

                data.files.push(file);

                file.setContent = function (parameters) {
                    file.ace.setValue(parameters.content, -1);
                };

                if (parameters.file.content !== undefined) {
                    file.setContent({content: parameters.file.content});
                }

                $fileTabs_editors_noItem.hide();
                $fileTabs_editors_items.show();

                var is_switched = false;

                if ((data.files.length == 1) || parameters.switch) {
                    data.switchFile({file: file, is_initial: parameters.is_initial});
                    is_switched = true;
                } else if (!parameters.is_initial) {
                    data.saveState();
                }

                return {
                    file: file,
                    is_switched: is_switched
                };
            };

            data.closeFile = function (parameters) {
                var file = parameters.file;

                file.ace.destroy();
                file.$editor.remove();
                file.$tab.remove();

                var files = []

                data.files = data.files.map(function (_file, _file_i) {
                    if (_file.id != file.id) {
                        files.push(_file);
                    }
                });

                data.files = files;

                if (!data.files.length) {
                    $fileTabs_editors_noItem.show();
                    $fileTabs_editors_items.hide();

                    data.current = false;
                } else if (data.current.id == file.id) {
                    data.switchFile({file: data.files[0]});
                }

                clearTimeout(file.tab_pathTooltip_hover_timeout);
                file.$tab_pathTooltip.remove();

                data.saveState();
            };

            data.switchFile = function (parameters) {
                var file = parameters.file;

                $fileTabs_tabs_items.find('.FileTabs_tabs_items_item').removeClass('FileTabs_tabs_items_item__current');
                $fileTabs_editors_items.find('.FileTabs_editors_items_item').hide();

                file.$tab.addClass('FileTabs_tabs_items_item__current');
                file.$editor.show();
                file.ace.resize();

                data.current = file;

                if (!parameters.is_initial) {
                    data.saveState();
                }
            };

            data.getFileById = function (id) {
                var file = false;

                data.files.forEach(function (_file, _file_i) {
                    if (_file.id == id) {
                        file = _file;
                        return false;
                    }
                });

                return file;
            };

            data.getFile = function (parameters) {
                var file = false;

                data.files.forEach(function (_file, _file_i) {
                    if (
                        (parameters.check && parameters.check(_file))
                        ||
                        (_file.path == parameters.path)
                    ) {
                        file = _file;
                        return false;
                    }
                });

                return file;
            };

            data.getFileByName = function (name) {
                var file = false;

                data.files.forEach(function (_file, _file_i) {
                    if (_file.name == parameters.name) {
                        file = _file;
                        return false;
                    }
                });

                return file;
            };

            data.getFileByPath = function (path) {
                var file = false;

                data.files.forEach(function (_file, _file_i) {
                    if (_file.path == path) {
                        file = _file;
                        return false;
                    }
                });

                return file;
            };

            data.kvKey = function (key) {
                return 'FileTabs:'+data.id+':'+key;
            };

            data.saveState = function (parameters) {
                var files = [];

                data.files.forEach(function (_file, _file_i) {
                    var file = {};
                    file.id = _file.id;
                    file.name = _file.name;
                    file.path = _file.path;

                    files.push(file)
                });

                var state = {
                    current: {
                        id: data.current.id,
                        name: data.current.name,
                        path: data.current.path
                    },
                    files: files
                };

                localStorage.setItem(data.kvKey('state'), JSON.stringify(state));
            };

            data.getState = function (parameters) {
                var state = localStorage.getItem(data.kvKey('state'));

                if (!state) {
                    state = {
                        files: []
                    };
                } else {
                    state = JSON.parse(state);
                }

                return {
                    state: state
                };
            };

            $fileTabs.on('FileTabs_initialize.FileTabs'+data.id, function (event) {
                data.init();
            });

            $fileTabs.on('FileTabs_comply.FileTabs'+data.id, function (event) {
                data.comply();
            });

            data.init = function () {
                data.comply();

                var state = data.getState().state;

                $fileTabs.trigger('FileTabs_preload', {
                    current: state.current,
                    files: state.files
                });
            };

            data.comply = function () {
            };

            data.init();
        });
    }

    $.fn.FileTabs = function(method) {
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method '+method+' does not exist on jQuery.FileTabs');
        }
    };

    $.fn.FileTabs.id_i = 0;

    $.fn.FileTabs.TREE_ITEM_NAME = 0;
    $.fn.FileTabs.TREE_ITEM_ITEMS = 1;
    $.fn.FileTabs.TREE_ITEM_LEVEL = 2;
    $.fn.FileTabs.TREE_ITEM_PATH = 3;
    $.fn.FileTabs.TREE_ITEM_TYPE = 4;
    $.fn.FileTabs.TREE_ITEM_ITEM = 5;

    $.fn.FileTabs.TREE_ITEM_TYPE__DIR = 1;
    $.fn.FileTabs.TREE_ITEM_TYPE__FILE = 2;
})(jQuery);