/*
 * gdb-frontend is a easy, flexible and extensionable gui debugger
 *
 * https://github.com/rohanrhu/gdb-frontend
 * https://oguzhaneroglu.com/projects/gdb-frontend/
 *
 * Licensed under MIT
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

                var $fileBrowser_window = $fileBrowser.find('.FileBrowser_window');
                var $fileBrowser_window_closeBtn = $fileBrowser_window.find('.FileBrowser_window_closeBtn');

                var $fileBrowser_path = $fileBrowser.find('.FileBrowser_path');

                var $fileBrowser_items = $fileBrowser.find('.FileBrowser_items');
                var $fileBrowser_items_item__proto = $fileBrowser.find('.FileBrowser_items_item.__proto');
                var $fileBrowser_items_parentBtn = $fileBrowser.find('.FileBrowser_items_parentBtn');

                var $fileBrowser_total = $fileBrowser.find('.FileBrowser_total');
                var $fileBrowser_total_number = $fileBrowser_total.find('.FileBrowser_total_number');

                data.animation_duration = 100;

                data.is_passive = false;
                data.is_opened = false;
                data.path = '/';

                data.refresh = function (parameters) {
                    if (parameters === undefined) {
                        parameters = {};
                    }

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
                                    GDBFrontend.showMessageBox({text: 'Path not found.'});
                                } else if (result_json.error.not_permitted) {
                                    GDBFrontend.showMessageBox({text: 'Access denied.'});
                                } else {
                                    GDBFrontend.showMessageBox({text: 'An error occured.'});
                                }

                                data.is_passive = false;

                                return;
                            }

                            data.path = parameters.path ? parameters.path: data.path;
                            $fileBrowser_path.html(data.path);

                            $fileBrowser_total_number.html(result_json.files.length);

                            if (data.path == '/') {
                                $fileBrowser_items_parentBtn.hide();
                            } else {
                                $fileBrowser_items_parentBtn.show();
                            }

                            $fileBrowser_items_parentBtn.off('click.FileBrowser');
                            $fileBrowser_items_parentBtn.on('click.FileBrowser', function (event) {
                                if (data.is_passive) {
                                    return;
                                }
                                
                                data.refresh({
                                    path: '/' + (_ = data.path.split('/')).slice(1, _.length-1).join('/'),
                                    on_file_selected: parameters.on_file_selected
                                });
                            });

                            var _append = function (_file, _file_i) {
                                var $item = $fileBrowser_items_item__proto.clone();
                                $item.removeClass('__proto');
                                $item.appendTo($fileBrowser_items);

                                $item.find('.FileBrowser_items_item_icon').html(_file.is_dir ? '📁': '📄');
                                $item.find('.FileBrowser_items_item_name').html(_file.name);

                                $item.on('click.FileBrowser', function (event) {
                                    if (data.is_passive) {
                                        return;
                                    }

                                    if (_file.is_dir) {
                                        data.refresh({
                                            path: [(data.path == '/') ? '': data.path, _file.name].join('/'),
                                            on_file_selected: parameters.on_file_selected
                                        });

                                        $fileBrowser.trigger('FileBrowser_entered_directory', {directory: _file});
                                    } else {
                                        if (parameters.on_file_selected) {
                                            parameters.on_file_selected({file: _file});
                                        }

                                        $fileBrowser.trigger('FileBrowser_file_selected', {file: _file});
                                    }
                                });
                            };

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

                $fileBrowser_window_closeBtn.on('click.FileBrowser', function (event) {
                    data.close();
                });

                data.open = function (parameters) {
                    if (parameters === undefined) {
                        parameters = {};
                    }

                    data.is_opened = true;

                    $fileBrowser.fadeIn(data.animation_duration);

                    data.refresh({
                        path: parameters.path,
                        on_file_selected: parameters.on_file_selected
                    });
                };

                data.close = function (parameters) {
                    data.is_opened = false;

                    $fileBrowser.fadeOut(data.animation_duration);
                };

                data.toggle = function (parameters) {
                    data[data.is_opened ? 'close': 'open']();
                };

                $fileBrowser.on('FileBrowser_initialize.FileBrowser', function (event) {
                    data.init();
                });

                $fileBrowser.on('FileBrowser_comply.FileBrowser', function (event) {
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