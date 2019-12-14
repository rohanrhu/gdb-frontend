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
            var $framesEditor = $(this);

            $framesEditor.off('.StackTrace');
            $framesEditor.find('*').off('.StackTrace');

            var data = {};
            $framesEditor.data('StackTrace', data);
            data.$framesEditor = $framesEditor;

            data.$framesEditor_items = $framesEditor.find('.StackTrace_items');
            data.$framesEditor_items_item__proto = data.$framesEditor_items.find('.StackTrace_items_item.__proto');

            data.animation_duration = 100;

            data.is_passive = false;
            data.frames = [];
            data.current = false;

            data.setCurrent = function (parameters) {
                data.current = parameters.frame;
            };

            data.load = function (parameters) {
                data.frames = [];

                parameters.frames.forEach(function (_frame, _frame_i) {
                    if (_frame.is_current) {
                        data.current = _frame;
                    }

                    data.frames.push(_frame);
                });
            };

            data.render = function (parameters) {
                if (parameters === undefined) {
                    parameters = {};
                }

                data.$framesEditor_items.find('.StackTrace_items_item:not(.__proto)').remove();

                data.frames.forEach(function (frame, frame_i) {
                    var $item = data.$framesEditor_items_item__proto.clone();
                    $item.removeClass('__proto');
                    $item.appendTo(data.$framesEditor_items);

                    frame.$item = $item;
                    frame.$item_num = $item.find('.StackTrace_items_item_num');
                    frame.$item_num_val = $item.find('.StackTrace_items_item_num_val');
                    frame.$item_function = $item.find('.StackTrace_items_item_function');
                    frame.$item_location = $item.find('.StackTrace_items_item_location');

                    frame.$item_num_val.html(frame_i);

                    if (!frame.is_running) {
                        if (frame.function) {
                            frame.$item_function.html(frame.function+'()');
                        } else {
                            frame.$item_function.hide();
                        }

                        if (frame.line) {
                            frame.$item_location.html(frame.file.name+':'+frame.line);
                        } else if (frame.file.name) {
                            frame.$item_location.html(frame.file.name);
                        } else {
                            frame.$item_location.hide();
                        }
                    } else {
                        frame.$item_location.html("(running)");
                        frame.$item_location.show();
                    }

                    frame.$item.on('click.StackTrace', function (event) {
                        $framesEditor.trigger('StackTrace_frame_selected', {
                            frame: frame
                        });
                    });

                    if (frame.pc == data.current.pc) {
                        frame.$item.addClass('StackTrace__current');
                    }
                });
            };

            $framesEditor.on('StackTrace_initialize.StackTrace', function (event) {
                data.init();
            });

            $framesEditor.on('StackTrace_comply.StackTrace', function (event) {
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

    $.fn.StackTrace = function(method) {
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method '+method+' does not exist on jQuery.StackTrace');
        }
    };
})(jQuery);