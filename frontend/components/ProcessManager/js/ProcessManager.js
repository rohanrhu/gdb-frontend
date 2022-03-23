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

(function($){
    var methods = {};

    methods.init = function (parameters) {
        var t_init = this;
        var $elements = $(this);

        if (typeof parameters == 'undefined') {
            parameters = {};
        }

        t_init.parameters = parameters;

        $elements.each(function () {
            var $processManager = $(this);
            
            $processManager.off('.ProcessManager');
            $processManager.find('*').off('.ProcessManager');

            var current_data = $processManager.data('ProcessManager');
            
            if (current_data) {
                $(window).off('ProcessManager-' + current_data.id);
                $(document).off('ProcessManager-' + current_data.id);
                $('html, body').off('ProcessManager-' + current_data.id)
            }
            
            var data = {};
            $processManager.data('ProcessManager', data);
            data.$processManager = $processManager;
            
            if (!window.hasOwnProperty('ProcessManager_component_id')) {
                ProcessManager_component_id = 0;
            }
            
            data.id = ++ProcessManager_component_id;

            data.components = {};

            data.$processManager_window = $processManager.find('.ProcessManager_window');
            data.$processManager_window_closeBtn = data.$processManager_window.find('.ProcessManager_window_closeBtn');
            
            data.$processManager_window_box_header_expression = data.$processManager_window.find('.ProcessManager_window_box_header_expression');
            data.$processManager_window_box_header_expression_input = data.$processManager_window_box_header_expression.find('.ProcessManager_window_box_header_expression_input');
            data.$processManager_window_box_header_expression_input_rI = data.$processManager_window_box_header_expression_input.find('.ProcessManager_window_box_header_expression_input_rI');
            
            data.$processManager_window_box_header_btn__autoRefreshEnabled = data.$processManager_window.find('.ProcessManager_window_box_header_btn__autoRefreshEnabled');

            data.$processManager_window_mover = data.$processManager_window.find('.ProcessManager_window_mover');
            
            data.$processManager_window_box = $processManager.find('.ProcessManager_window_box');
            data.$processManager_window_box_content = $processManager.find('.ProcessManager_window_box_content');

            data.$processManager_processes = $processManager.find('.ProcessManager_processes');
            data.$processManager_noProcess = $processManager.find('.ProcessManager_noProcess');

            data.$processManager_processes_items = data.$processManager_processes.find('.ProcessManager_processes_items');
            data.$processManager_processes_items_item__proto = data.$processManager_processes_items.find('.ProcessManager_processes_items_item.__proto');

            data.animation_duration = 100;

            data.processes = {};
            
            data.is_passive = false;
            data.is_opened = false;

            data.is_auto_refresh = false;
            data.auto_refresh_delay = $.fn.ProcessManager.AUTO_DELAY_REFRESH;

            data.is_fullscreen = false;
            data.is_on_native_window = false;

            var resize_timeout = 0;
            
            data.resizeObserver = new ResizeObserver(function (entries) {
                var entry = entries[0];
                var content = entry.target;

                clearTimeout(resize_timeout);
            });

            data.resizeObserver.observe(data.$processManager_window_box_content[0]);

            var filter_render_timeout = 0;
            var prev_filter_expr = '';
            
            data.$processManager_window_box_header_expression_input_rI.on('keyup.ProcessManager-'+data.id+', keydown.ProcessManager-'+data.id+', change.ProcessManager-'+data.id+', paste.ProcessManager-'+data.id+', cut.ProcessManager-'+data.id+', drop.ProcessManager-'+data.id, function (event) {
                event.stopPropagation();

                if (!data.is_opened) {
                    return;
                }

                var filter_expr = data.$processManager_window_box_header_expression_input_rI.val();
                
                if (filter_expr == prev_filter_expr) {
                    prev_filter_expr = filter_expr;
                    return;
                }
                
                data.$processManager_window_box_content.scrollTop(0);
                
                prev_filter_expr = filter_expr;

                clearTimeout(filter_render_timeout);
                filter_render_timeout = setTimeout(data.render, 250);
            });
            
            data.$processManager_window_box_header_expression_input_rI.on('keydown.ProcessManager-'+data.id, function (event) {
                if (!data.is_opened) {
                    return;
                }
                
                var expression = data.$processManager_window_box_header_expression_input_rI.val();
                
                var keycode = event.keyCode ? event.keyCode : event.which;
                if (keycode == 27) {
                    data.close();
                } else if (keycode == 13) {
                    data.reload();
                    data.render({expression});
                }
            });
            
            $processManager.on('mousedown.ProcessManager-' + data.id, function (event) {
                data.focus();
            });
            
            data.$processManager_window_closeBtn.on('mousedown.ProcessManager-' + data.id, function (event) {
                data.close();
            });

            $(document).on('mousedown.ProcessManager-'+data.id, function (event) {
                if ($processManager.is(event.target) || $processManager.has(event.target).length) {
                    return;
                }
                
                data.blur();
            });

            data.reload = function (parameters) {
                new Promise(function (resolve, reject) {
                    if (parameters === undefined) {
                        parameters = {};
                    }
                    
                    $.ajax({
                        url: '/api/process/all',
                        cache: false,
                        method: 'get',
                        data: {
                            expression: parameters.expression
                        },
                        success: function (result_json) {
                            if (!result_json.ok) {
                                GDBFrontend.showMessageBox({text: 'An error occured.'});
                                console.trace('An error occured.');

                                resolve();

                                return;
                            }
    
                            Object.entries(result_json.processes).map(([pid, process]) => {
                                if (data.processes[pid]) {
                                    return;
                                }

                                data.processes[pid] = process;
                            });
                            
                            Object.entries(data.processes).map(([pid, process]) => {
                                if (result_json.processes[pid]) {
                                    return;
                                }

                                data.processes[pid].will_delete = true;
                            });

                            resolve();
                        },
                        error: function () {
                            GDBFrontend.showMessageBox({text: 'An error occured.'});
                            console.trace('An error occured.');

                            resolve();
                        }
                    });
                });
            };

            var prev_render_filter_expr = '';
            
            data.render = function (parameters) {
                var filter_expr = data.$processManager_window_box_header_expression_input_rI.val();

                var is_filter_pid = !isNaN(filter_expr);
                
                if (!data.processes || !data.processes.length) {
                    data.$processManager_noProcess.hide();
                    data.$processManager_processes.show();
                } else {
                    data.$processManager_noProcess.show();
                    data.$processManager_processes.hide();
                }
                
                var ordered_pids = Object.keys(data.processes);

                ordered_pids.sort(function (x, y) {
                    x = data.processes[x];
                    y = data.processes[y];

                    if (x.start_time < y.start_time) {
                        return -1;
                    } else if (x.start_time > y.start_time) {
                        return 1;
                    }

                    return 0;
                });
                
                if (filter_expr.length) {
                    ordered_pids.sort(function (x, y) {
                        x = data.processes[x];
                        y = data.processes[y];
    
                        if ((x.cmdline.indexOf(filter_expr) >= 0) && (y.cmdline.indexOf(filter_expr) >= 0)) {
                            x.is_highlighted = true;
                            y.is_highlighted = true;
                            return 0;
                        }

                        if (x.cmdline.indexOf(filter_expr) >= 0) {
                            x.is_highlighted = true;
                            return 1;
                        }
                        
                        if (y.cmdline.indexOf(filter_expr) >= 0) {
                            y.is_highlighted = true;
                            return -1;
                        }
                    });
                    
                    ordered_pids.sort(function (x, y) {
                        x = data.processes[x];
                        y = data.processes[y];
                        
                        if ((x.status.Name.indexOf(filter_expr) >= 0) && (y.status.Name.indexOf(filter_expr) >= 0)) {
                            x.is_highlighted = true;
                            y.is_highlighted = true;
                            return 0;
                        }
                        
                        if (x.status.Name.indexOf(filter_expr) >= 0) {
                            x.is_highlighted = true;
                            return 1;
                        }
                        
                        if (y.status.Name.indexOf(filter_expr) >= 0) {
                            y.is_highlighted = true;
                            return -1;
                        }
                        
                        return 0;
                    });
                    
                    ordered_pids.sort(function (x, y) {
                        x = data.processes[x];
                        y = data.processes[y];
                        
                        if ((x.status.Name.trim() == filter_expr.trim()) && (y.status.Name.trim() == filter_expr.trim())) {
                            x.is_highlighted = true;
                            y.is_highlighted = true;
                            return 0;
                        }
                        
                        if (x.status.Name.trim() == filter_expr.trim()) {
                            x.is_highlighted = true;
                            return 1;
                        }
                        
                        if (y.status.Name.trim() == filter_expr.trim()) {
                            y.is_highlighted = true;
                            return -1;
                        }
    
                        return 0;
                    });
    
                    if (is_filter_pid) {
                        ordered_pids.sort(function (x, y) {
                            x = data.processes[x];
                            y = data.processes[y];
        
                            if ((x.status.Pid == filter_expr) && (y.status.Pid == filter_expr)) {
                                x.is_highlighted = true;
                                y.is_highlighted = true;
                                return 0;
                            }

                            if (x.status.Pid == filter_expr) {
                                x.is_highlighted = true;
                                return 1;
                            }
                            
                            if (y.status.Pid == filter_expr) {
                                y.is_highlighted = true;
                                return -1;
                            }
        
                            return 0;
                        });
                    }
                }

                ordered_pids.forEach(function (_pid, _pid_i) {
                    var process = data.processes[_pid];

                    if (process.$item) {
                        if (process.will_delete) {
                            process.$item.remove();
                            delete data.processes[_pid];

                            return;
                        }

                        process.$item.insertAfter(data.$processManager_processes_items_item__proto);

                        if (process.is_highlighted) {
                            process.is_highlighted = false;
                            process.$item.addClass('ProcessManager__highlighted');
                        } else {
                            process.$item.removeClass('ProcessManager__highlighted');
                        }
    
                        var $item_cmd = process.$item.find('.ProcessManager_processes_items_item_cmd');
    
                        if (!filter_expr.length) {
                            $item_cmd.html(process.cmdline);
                        } else {
                            var highlighted = process.cmdline.split(filter_expr);
                            var cmdline = process.cmdline;
    
                            if (highlighted.length > 1) {
                                cmdline = cmdline.replace(new RegExp(filter_expr, 'gi'), '<span class="ProcessManager_highlighted">'+filter_expr+'</span>');
                            }
                            
                            $item_cmd.html(cmdline);
                        }

                        return;
                    }

                    var $item = data.$processManager_processes_items_item__proto.clone();
                    process.$item = $item;
                    $item.insertAfter(data.$processManager_processes_items_item__proto);
                    $item.removeClass('__proto');

                    process.index = $item.index();

                    if (process.is_highlighted) {
                        process.is_highlighted = false;
                        process.$item.addClass('ProcessManager__highlighted');
                    } else {
                        process.$item.removeClass('ProcessManager__highlighted');
                    }

                    var $item_pid = process.$item.find('.ProcessManager_processes_items_item_pid');
                    var $item_name = process.$item.find('.ProcessManager_processes_items_item_name');
                    var $item_cmd = process.$item.find('.ProcessManager_processes_items_item_cmd');

                    $item_pid.html(_pid);
                    $item_name.html(process.status.Name);

                    if (!filter_expr.length) {
                        $item_cmd.html(process.cmdline);
                    } else {
                        var highlighted = process.cmdline.split(filter_expr);
                        var cmdline = process.cmdline;

                        if (highlighted.length > 1) {
                            cmdline = cmdline.replace(new RegExp(filter_expr, 'gi'), '<span class="ProcessManager_highlighted">'+filter_expr+'</span>');
                        }
                        
                        $item_cmd.html(cmdline);
                    }

                    $item.ContextMenu({
                        actions: {
                            attach: {
                                label: 'Attach to Process',
                                function: function () {
                                    $.ajax({
                                        url: '/api/runtime/attach',
                                        cache: false,
                                        method: 'get',
                                        data: {
                                            pid: _pid
                                        },
                                        success: function (result_json) {
                                            if (!result_json.ok) {
                                                GDBFrontend.showMessageBox({text: 'An error occured.'});
                                                console.trace('An error occured.');
                                                return;
                                            }
                                        },
                                        error: function () {
                                            GDBFrontend.showMessageBox({text: 'An error occured.'});
                                            console.trace('An error occured.');
                                        }
                                    });
                                }
                            },
                            copyPID: {
                                label: "Copy PID",
                                function () {
                                    navigator.clipboard.writeText(_pid);
                                }
                            },
                            copyName: {
                                label: "Copy Name",
                                function () {
                                    navigator.clipboard.writeText(process.status.Name);
                                }
                            },
                            copyCommand: {
                                label: "Copy Command",
                                function () {
                                    navigator.clipboard.writeText(process.cmdline);
                                }
                            },
                            sigterm: {
                                label: "Terminate (SIGTERM)",
                                function () {
                                    $.ajax({
                                        url: '/api/process/sigterm',
                                        cache: false,
                                        method: 'get',
                                        data: {
                                            pid: _pid
                                        },
                                        success: function (result_json) {
                                            if (!result_json.ok) {
                                                GDBFrontend.showMessageBox({text: 'An error occured.'});
                                                console.trace('An error occured.');
                                                return;
                                            }
                                        },
                                        error: function () {
                                            GDBFrontend.showMessageBox({text: 'An error occured.'});
                                            console.trace('An error occured.');
                                        }
                                    });
                                }
                            },
                            sigkill: {
                                label: "Terminate (SIGKILL)",
                                function () {
                                    $.ajax({
                                        url: '/api/process/sigkill',
                                        cache: false,
                                        method: 'get',
                                        data: {
                                            pid: _pid
                                        },
                                        success: function (result_json) {
                                            if (!result_json.ok) {
                                                GDBFrontend.showMessageBox({text: 'An error occured.'});
                                                console.trace('An error occured.');
                                                return;
                                            }
                                        },
                                        error: function () {
                                            GDBFrontend.showMessageBox({text: 'An error occured.'});
                                            console.trace('An error occured.');
                                        }
                                    });
                                }
                            }
                        }
                    });
                });

                prev_render_filter_expr = filter_expr;
            };
            
            data.refresh = async function (params) {
                await data.reload();
                data.render();
            };

            var auto_delay_timeout = 0;

            var autoRefresh = async function () {
                await data.refresh();
                auto_delay_timeout = setTimeout(autoRefresh, data.auto_refresh_delay);
            };

            data.startAutoRefresh = function (parameters) {
                data.is_auto_refresh = true;
                data.$processManager_window_box_header_btn__autoRefreshEnabled.addClass('ProcessManager__checked');
                autoRefresh();
            };
            
            data.stopAutoRefresh = function (parameters) {
                data.is_auto_refresh = false;
                data.$processManager_window_box_header_btn__autoRefreshEnabled.removeClass('ProcessManager__checked');
                clearTimeout(auto_delay_timeout);
            };
            
            data.toggleAutoRefresh = function (parameters) {
                data[(data.is_auto_refresh = !data.is_auto_refresh) ? 'startAutoRefresh': 'stopAutoRefresh']();
            };

            data.open = function (parameters) {
                if (parameters === undefined) {
                    parameters = {};
                }

                data.is_opened = true;

                data.focus();
                $processManager.data().Movable.focus();
                
                var x = (window.innerWidth / 2) - ($processManager.outerWidth()/2);
                var y = (window.innerHeight / 2) - ($processManager.outerHeight()/2);

                x = x + (5 + parseInt(Math.random()*20)) * (Math.random() >= 0.5 ? 1: -1);
                y = y + (5 + parseInt(Math.random()*20)) * (Math.random() >= 0.5 ? 1: -1);
                
                $processManager.css('transform', 'translate('+x+'px, '+y+'px)');
                
                $processManager.fadeIn(data.animation_duration, async function (event) {
                    data.$processManager_window_box_header_expression_input_rI.focus();
                    
                    if (parameters.onOpened) {
                        parameters.onOpened();
                    }

                    await data.reload();
                    data.render();
                });
            };

            data.close = function (parameters) {
                if (parameters === undefined) {
                    parameters = {};
                }
                
                data.stopAutoRefresh();

                if (data.is_on_native_window) {
                    window.close();
                    return;
                }
                
                data.is_opened = false;

                data.blur();
                $processManager.data().Movable.blur();
                
                $processManager.fadeOut(data.animation_duration, function (event) {
                    if (parameters.onClosed) {
                        parameters.onClosed();
                    }
                    $processManager.trigger('ProcessManager_closed');
                });
            };

            data.focus = function (parameters) {
                $processManager.addClass('ProcessManager__focused');
            };
            
            data.blur = function (parameters) {
                $processManager.removeClass('ProcessManager__focused');
            };
            
            data.setSize = function (parameters) {
                data.$processManager_window_box_content.width(parameters.width);
                data.$processManager_window_box_content.height(parameters.height);
            };

            var last_css_translate = 'translate(0px, 0px)';
            
            var on_resize = function (event) {
                if (!data.is_fullscreen) {
                    return;
                }

                data.$processManager_window_box.width($(window).width());
                data.$processManager_window_box.height($(window).height());

                data.$processManager_window_box_content.width('auto');
                data.$processManager_window_box_content.height('auto');
                data.$processManager_window_box_content.css('resize', 'none');

                last_css_translate = data.$processManager.css('transform');
                data.$processManager.css('transform', 'translate(0px, 0px)');
            };
            
            $(window).on('resize.ProcessManager-' + data.id, on_resize)

            data.setFullScreen = function (parameters) {
                data.is_fullscreen = parameters.is_fullscreen;
                
                if (data.is_fullscreen) {
                    on_resize();
                } else {
                    data.$processManager_window_box.width('');
                    data.$processManager_window_box.height('');

                    data.$processManager_window_box_content.width('');
                    data.$processManager_window_box_content.height('');
                    data.$processManager_window_box_content.css('resize', 'both');

                    data.$processManager.css('transform', last_css_translate);
                }

                $processManager.data().Movable.is_passive = data.is_fullscreen;
            };
            
            data.toggle = function (parameters) {
                data[data.is_opened ? 'close': 'open']();
            };

            data.setOnNativewindow = function (parameters) {
                data.is_on_native_window = parameters.is_on_native_window;
            };

            data.$processManager_window_box_header_btn__autoRefreshEnabled.on('click.EvaluateExpression-' + data.id, function (event) {
                data.toggleAutoRefresh();
            });
            
            var move_timeout = 0;
            
            $processManager.on('Movable_move.ProcessManager-' + data.id, function (event) {
                clearTimeout(move_timeout);
            });
            
            $processManager.on('Movable_focused.ProcessManager-' + data.id, function (event, parameters) {
            });
            
            var scroll_timeout = 0;
            
            data.$processManager_window_box_content.on('scroll.ProcessManager-' + data.id, function (event) {
            });
            
            $processManager.on('ProcessManager_initialize.ProcessManager-' + data.id, function (event) {
                data.init();
            });

            $processManager.on('ProcessManager_comply.ProcessManager-' + data.id, function (event) {
                data.comply();
            });

            data.init = function () {
                $processManager.Movable();
                data.startAutoRefresh();
            };

            data.comply = function () {
            };

            data.init();
        });
    };

    $.fn.ProcessManager = function(method) {
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method '+method+' does not exist on jQuery.ProcessManager');
        }
    };

    $.fn.ProcessManager.AUTO_DELAY_REFRESH = 1000;
})(jQuery);