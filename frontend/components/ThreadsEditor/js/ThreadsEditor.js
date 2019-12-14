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

/*
 * ThreadsEditor shows and switches between GDB threads.
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
            var $threadsEditor = $(this);

            $threadsEditor.off('.ThreadsEditor');
            $threadsEditor.find('*').off('.ThreadsEditor');

            var data = {};
            $threadsEditor.data('ThreadsEditor', data);
            data.$threadsEditor = $threadsEditor;

            data.$threadsEditor_items = $threadsEditor.find('.ThreadsEditor_items');
            data.$threadsEditor_items_item__proto = data.$threadsEditor_items.find('.ThreadsEditor_items_item.__proto');

            data.animation_duration = 100;

            data.is_passive = false;
            data.threads = [];
            data.current = false;

            data.setCurrent = function (num) {
                data.current = parseInt(num);
            };

            data.load = function (parameters) {
                data.threads = [];

                data.current = false;

                parameters.threads.forEach(function (_th, _th_i) {
                    if (_th.is_current) {
                        data.current = _th;
                    }

                    data.threads.push(_th);
                });
            };

            data.render = function (parameters) {
                if (parameters === undefined) {
                    parameters = {};
                }

                data.$threadsEditor_items.find('.ThreadsEditor_items_item:not(.__proto)').remove();

                data.threads.forEach(function (thread, thread_i) {
                    var $item = data.$threadsEditor_items_item__proto.clone();
                    $item.removeClass('__proto');
                    $item.appendTo(data.$threadsEditor_items);

                    thread.$item = $item;
                    thread.$item_num = $item.find('.ThreadsEditor_items_item_num');
                    thread.$item_num_val = $item.find('.ThreadsEditor_items_item_num_val');
                    thread.$item_function = $item.find('.ThreadsEditor_items_item_function');
                    thread.$item_location = $item.find('.ThreadsEditor_items_item_location');

                    thread.$item_num_val.html(thread.num);

                    if (!thread.is_running) {
                        if (thread.frame.function) {
                            thread.$item_function.html(thread.frame.function+'()');
                        } else {
                            thread.$item_function.hide();
                        }

                        if (thread.frame.line) {
                            thread.$item_location.html(thread.frame.file+':'+thread.frame.line);
                        } else if (thread.frame.file) {
                            thread.$item_location.html(thread.frame.file);
                        } else {
                            thread.$item_location.hide();
                        }
                    } else {
                        thread.$item_location.html("(running)");
                        thread.$item_location.show();
                    }

                    thread.$item.on('click.ThreadsEditor', function (event) {
                        $threadsEditor.trigger('ThreadsEditor_thread_selected', {
                            thread: thread
                        });
                    });

                    if (thread.is_current) {
                        thread.$item.addClass('ThreadsEditor__current');
                    }
                });
            };

            data.setThread = function (parameters) {
                if (parameters === undefined) {
                    parameters = {};
                }

                data.current = parameters.thread;
            };

            $threadsEditor.on('ThreadsEditor_initialize.ThreadsEditor', function (event) {
                data.init();
            });

            $threadsEditor.on('ThreadsEditor_comply.ThreadsEditor', function (event) {
                data.comply();
            });

            data.init = function () {
                data.comply();
            };

            data.comply = function () {
            };

            data.init();
        });
    }

    $.fn.ThreadsEditor = function(method) {
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method '+method+' does not exist on jQuery.ThreadsEditor');
        }
    };
})(jQuery);