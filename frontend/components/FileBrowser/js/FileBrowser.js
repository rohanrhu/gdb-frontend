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
    var methods = {
        init: function (parameters) {
            var t_init = this;
            var $elements = $(this);

            if (typeof parameters == 'undefined') {
                parameters = {};
            }

            t_init.parameters = parameters;

            $elements.each(function () {
                var $fileBrowser = $(this);

                $fileBrowser.off('.FileBrowser');
                $fileBrowser.find('*').off('.FileBrowser');

                var data = {};
                $fileBrowser.data('FileBrowser', data);
                data.$fileBrowser = $fileBrowser;

                if (!window.hasOwnProperty('FileBrowser_component_id')) {
                    FileBrowser_component_id = 0;
                }

                data.id = ++FileBrowser_component_id;

                var $fileBrowser_window = $fileBrowser.find('.FileBrowser_window');
                var $fileBrowser_window_closeBtn = $fileBrowser_window.find('.FileBrowser_window_closeBtn');

                var $fileBrowser_window_box_header_path = $fileBrowser_window.find('.FileBrowser_window_box_header_path');
                var $fileBrowser_window_box_header_path_input = $fileBrowser_window_box_header_path.find('.FileBrowser_window_box_header_path_input');
                var $fileBrowser_window_box_header_path_input_rI = $fileBrowser_window_box_header_path_input.find('.FileBrowser_window_box_header_path_input_rI');

                var $fileBrowser_items = $fileBrowser.find('.FileBrowser_items');
                var $fileBrowser_items_item__proto = $fileBrowser.find('.FileBrowser_items_item.__proto');
                var $fileBrowser_items_parentBtn = $fileBrowser.find('.FileBrowser_items_parentBtn');

                var $fileBrowser_total = $fileBrowser.find('.FileBrowser_total');
                var $fileBrowser_total_number = $fileBrowser_total.find('.FileBrowser_total_number');

                data.animation_duration = 100;

                data.is_passive = false;
                data.is_opened = false;
                data.path = '/';
                data.onFileSelected = function () {};
                data.items = [];
                data.current = -1;
                data.pathUpdateRefreshTimout = 0;

                var is_first_refresh = true;
                var dont_auto_refresh = false;
                var prev_path = false;

                data.clearSelected = function () {
                    data.current = -1;
                    $fileBrowser_items_parentBtn.removeClass('FileBrowser_items_item__current');
                    $fileBrowser_items.find('.FileBrowser_items_item__current').removeClass('FileBrowser_items_item__current');
                };
                
                data.refresh = function (parameters) {
                    if (parameters === undefined) {
                        parameters = {};
                    }

                    var refresh_parameters = parameters;

                    if (parameters.onFileSelected) {
                        data.onFileSelected = parameters.onFileSelected;
                    }
                    
                    clearTimeout(data.pathUpdateRefreshTimout);

                    if (!parameters.path.length) {
                        parameters.path = '/';
                    }
                    
                    if (!parameters.ignoreSamePath && !is_first_refresh && (data.path == parameters.path)) {
                        is_first_refresh = false;
                        return;
                    }

                    is_first_refresh = false;
                    data.is_passive = true;

                    $.ajax({
                        url: '/api/fs/list',
                        cache: false,
                        method: 'get',
                        data: {
                            path: parameters.path ? parameters.path: data.path
                        },
                        success: function (result_json) {
                            if (result_json.error) {
                                if (result_json.error.not_exists) {
                                    if (!parameters.ignoreNotFound) {
                                        GDBFrontend.showMessageBox({text: 'Path not found.'});
                                    }
                                } else if (result_json.error.not_permitted) {
                                    if (!parameters.ignoreNotFound) {
                                        GDBFrontend.showMessageBox({text: 'Access denied.'});
                                    }
                                } else {
                                    GDBFrontend.showMessageBox({text: 'An error occured.'});
                                }

                                data.is_passive = false;

                                return;
                            }

                            data.path = parameters.path ? parameters.path: data.path;

                            $fileBrowser.trigger('FileBrowser_entered_directory', {path: data.path});

                            if (!parameters.dontUpdatePathInput) {
                                $fileBrowser_window_box_header_path_input_rI.val(data.path);
                            }

                            result_json.files.sort(function (a, b) {
                                return a.name.localeCompare(b.name);
                            });
                            
                            $fileBrowser_total_number.html(result_json.files.length);

                            if (data.path == '/') {
                                $fileBrowser_items_parentBtn.hide();
                            } else {
                                $fileBrowser_items_parentBtn.show();
                            }

                            $fileBrowser_items_parentBtn.off('click.FileBrowser');
                            $fileBrowser_items_parentBtn.on('click.FileBrowser-' + data.id, function (event) {
                                if (data.is_passive) {
                                    return;
                                }
                                
                                data.refresh({
                                    path: '/' + (_ = data.path.split('/')).slice(1, _.length-1).join('/'),
                                    onFileSelected: parameters.onFileSelected
                                });
                            });

                            var _append = function (_file, _file_i) {
                                var item = {};
                                data.items.push(item);
                                
                                item.is_selected = false;
                                item.file = _file;
                                
                                item.$item = $fileBrowser_items_item__proto.clone();
                                item.$item.removeClass('__proto');
                                item.$item.appendTo($fileBrowser_items);

                                item.$item.find('.FileBrowser_items_item_icon').html(_file.is_dir ? '📁': '📄');
                                item.$item.find('.FileBrowser_items_item_name').html(_file.name);

                                item.$item.on('click.FileBrowser-' + data.id, function (event) {
                                    if (data.is_passive) {
                                        return;
                                    }

                                    item.open();
                                });
                                
                                item.open = function (parameters) {
                                    if (_file.is_dir) {
                                        data.refresh({
                                            path: [(data.path == '/') ? '': data.path, _file.name].join('/'),
                                            onFileSelected: data.onFileSelected
                                        });
                                    } else {
                                        _file.path = _file.path.replace(/\/+/gi, '/');
                                        
                                        data.onFileSelected({file: _file});
                                        $fileBrowser.trigger('FileBrowser_file_selected', {file: _file, item: item});
                                    }
                                };
                            };

                            data.items = [];
                            
                            if (data.path != '/') {
                                data.items.push({
                                    is_parent_button: true,
                                    file: {
                                        path: '..',
                                        name: '..'
                                    },
                                    $item: $fileBrowser_items_parentBtn
                                });
                            }

                            data.clearSelected();
                            
                            $fileBrowser.find('.FileBrowser_items_item:not(.__proto)').remove();

                            result_json.files.forEach(function (_file, _file_i) {
                                if (!_file.is_dir) {
                                    return true;
                                }

                                _append(_file, _file_i);
                            });

                            result_json.files.forEach(function (_file, _file_i) {
                                if (_file.is_dir) {
                                    return true;
                                }

                                _append(_file, _file_i);
                            });

                            $fileBrowser_items.scrollTop(0);

                            data.is_passive = false;
                        },
                        error: function () {
                            GDBFrontend.showMessageBox({text: 'Path not found.'});
                        }
                    });
                };

                $fileBrowser_window_box_header_path_input_rI.on('keydown.FileBrowser-' + data.id, function (event) {
                    if (!data.is_opened) {
                        return;
                    }
                    
                    var path = $fileBrowser_window_box_header_path_input_rI.val();

                    if (!path.length) {
                        path = '/';
                    }

                    clearTimeout(data.pathUpdateRefreshTimout);
                    
                    var keycode = event.keyCode ? event.keyCode : event.which;
                    if (keycode == 27) {
                        event.stopPropagation();

                        if (data.current > -1) {
                            data.clearSelected();
                        } else {
                            data.close();
                        }
                    } else if (keycode == 38) {
                        event.stopPropagation();
                        event.preventDefault();
                        data.up();
                    } else if (keycode == 40) {
                        event.stopPropagation();
                        event.preventDefault();
                        data.down();
                    } else if (keycode == 13) {
                        event.stopPropagation();
                        
                        dont_auto_refresh = true;
                        
                        if (data.current == -1) {
                            data.refresh({
                                path: path,
                                onFileSelected: parameters.onFileSelected
                            });
                        } else {
                            var item = data.items[data.current];
                            
                            if (item.is_parent_button) {
                                data.refresh({
                                    path: '/' + (_ = data.path.split('/')).slice(1, _.length-1).join('/'),
                                    onFileSelected: parameters.onFileSelected
                                });
                            } else {
                                item.open();
                            }
                        }
                    } else if (keycode == 8) {
                        event.stopPropagation();
                    }
                });

                $('body').on('keydown.FileBrowser-'+data.id, function (event) {
                    if (!data.is_opened) {
                        return;
                    }

                    var path = $fileBrowser_window_box_header_path_input_rI.val();
                    
                    if (!path.length) {
                        path = '/';
                    }

                    clearTimeout(data.pathUpdateRefreshTimout);
                    
                    var keycode = event.keyCode ? event.keyCode : event.which;
                    if (keycode == 27) {
                        if (data.current > -1) {
                            data.clearSelected();
                        } else {
                            data.close();
                        }
                    } else if (keycode == 38) {
                        event.preventDefault();
                        data.up();
                    } else if (keycode == 40) {
                        event.preventDefault();
                        data.down();
                    } else if (keycode == 13) {
                        dont_auto_refresh = true;
                        
                        if (data.current != -1) {
                            var item = data.items[data.current];
                            
                            if (item.is_parent_button) {
                                data.refresh({
                                    path: '/' + (_ = data.path.split('/')).slice(1, _.length-1).join('/'),
                                    onFileSelected: parameters.onFileSelected
                                });
                            } else {
                                item.open();
                            }
                        }
                    } else if (keycode == 8) {
                        data.refresh({
                            path: '/' + (_ = data.path.split('/')).slice(1, _.length-1).join('/'),
                            onFileSelected: parameters.onFileSelected
                        });
                    }
                });
                
                $fileBrowser_window_box_header_path_input_rI.on('keyup.FileBrowser-' + data.id, function (event) {
                    var path = $fileBrowser_window_box_header_path_input_rI.val();

                    if (path == prev_path) {
                        return;
                    }

                    data.clearSelected();

                    prev_path = path;

                    if (!path.length) {
                        return;
                    }

                    if (path == data.path) {
                        return;
                    }

                    if (dont_auto_refresh) {
                        dont_auto_refresh = false;
                        return;
                    }
                    
                    clearTimeout(data.pathUpdateRefreshTimout);
                    data.pathUpdateRefreshTimout = setTimeout(function () {
                        data.refresh({
                            path: path,
                            ignoreNotFound: true,
                            dontUpdatePathInput: true
                        });
                    }, 500);
                });

                $fileBrowser_window_closeBtn.on('click.FileBrowser-' + data.id, function (event) {
                    data.close();
                });

                data.open = function (parameters) {
                    if (parameters === undefined) {
                        parameters = {};
                    }

                    if (parameters.onFileSelected) {
                        data.onFileSelected = parameters.onFileSelected;
                    }
                    
                    data.is_opened = true;

                    $fileBrowser.fadeIn(data.animation_duration);
                    $fileBrowser_window_box_header_path_input_rI.focus();

                    data.refresh({
                        path: parameters.path,
                        onFileSelected: parameters.onFileSelected
                    });
                };

                data.close = function (parameters) {
                    data.is_opened = false;

                    $fileBrowser.fadeOut(data.animation_duration);
                };

                data.up = function () {
                    if (data.current <= 0) {
                        return;
                    }
    
                    data.select({index: data.current-1});
                };
    
                data.down = function () {
                    if (data.current >= data.items.length-1) {
                        return;
                    }
    
                    data.select({index: data.current+1});
                };
    
                data.select = function (parameters) {
                    var item = data.items[parameters.index];
                    var prev = data.items[data.current];
    
                    if (prev) {
                        prev.is_selected = false;
                        prev.$item.removeClass('FileBrowser_items_item__current');
                    }
    
                    if (!item) {
                        return;
                    }
    
                    data.current = parameters.index;
    
                    item.is_selected = true;
                    item.$item.addClass('FileBrowser_items_item__current');
    
                    var scroll_y = $fileBrowser_items.scrollTop();
                    var height = $fileBrowser_items.innerHeight();
                    var item_y = scroll_y + item.$item.position().top;
                    var item_h = item.$item.outerHeight();
                    var limit = scroll_y+height-item_h;
    
                    if (item_y > limit) {
                        $fileBrowser_items.scrollTop(item_y - (height - item_h));
                    } else if (item_y < scroll_y) {
                        $fileBrowser_items.scrollTop(item_y);
                    }
                };

                data.toggle = function (parameters) {
                    data[data.is_opened ? 'close': 'open']();
                };

                $fileBrowser.on('FileBrowser_initialize.FileBrowser-' + data.id, function (event) {
                    data.init();
                });

                $fileBrowser.on('FileBrowser_comply.FileBrowser-' + data.id, function (event) {
                    data.comply();
                });

                data.init = function () {
                    
                };

                data.comply = function () {
                };

                data.init();
            });
        }
    };

    $.fn.FileBrowser = function(method) {
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method '+method+' does not exist on jQuery.FileBrowser');
        }
    };
})(jQuery);