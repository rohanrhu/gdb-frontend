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
            var $messageBox = $(this);

            $messageBox.off('.MessageBox');
            $messageBox.find('*').off('.MessageBox');
            $('html, body').off('.MessageBox');

            var data = {};
            $messageBox.data('MessageBox', data);
            data.$messageBox_box = $messageBox.find('.MessageBox_box');
            data.$messageBox_text = $messageBox.find('.MessageBox_text');
            data.$messageBox_button__ok = $messageBox.find('.MessageBox_button__ok');
            data.$messageBox_button__no = $messageBox.find('.MessageBox_button__no');

            data.fade_duration = 250;
            data.is_opened = false;
            data.defaults = {};
            data.defaults.width = 500;

            data.init = function () {

            };

            $messageBox.on('MessageBox_initialize.MessageBox', function (event) {
                data.init();
            });

            data.open = function (parameters) {
                data.$messageBox_text.html(parameters.text);

                if (typeof parameters.width != 'undefined') {
                    data.$messageBox_box.width(parameters.width);
                } else {
                    data.$messageBox_box.width(data.defaults.width);
                }

                data.is_opened = true;
                $messageBox.stop().fadeIn(data.fade_duration, function (event) {
                    data.$messageBox_button__ok.focus();
                });
            };

            data.$messageBox_button__ok.on('click.MessageBox', function (event) {
                data.close();
            });

            data.$messageBox_button__ok.on('keyup.MessageBox', function (event) {
                if (!data.is_opened) {
                    return;
                }

                event.stopPropagation();
                var keycode = event.keyCode ? event.keyCode: event.which;
                if ((keycode == 32) || (keycode == 13) || (keycode == 27)) {
                    data.close();
                }
            });

            data.$messageBox_button__no.on('click.MessageBox', function (event) {
                data.close();
            });

            data.close = function () {
                data.is_opened = false;
                $messageBox.stop().fadeOut(data.fade_duration);
            };

            data.$messageBox_box.on('click.MessageBox', function (event) {
                event.stopPropagation();
            });

            $('body').on('keyup.MessageBox', function (event) {
                if (!data.is_opened) {
                    return;
                }

                event.stopPropagation();
                var keycode = event.keyCode ? event.keyCode: event.which;
                if (keycode == 27) {
                    data.close();
                }
            });

            data.init();
        });
    };

    $.fn.MessageBox = function(method) {
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method '+method+' does not exist on jQuery.MessageBox');
        }
    };
})(jQuery);