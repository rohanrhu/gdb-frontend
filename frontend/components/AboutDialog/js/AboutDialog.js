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
            var $aboutDialog = $(this);

            $aboutDialog.off('.AboutDialog');
            $aboutDialog.find('*').off('.AboutDialog');
            $('html, body').off('.AboutDialog');

            var data = {};
            $aboutDialog.data('AboutDialog', data);
            data.$aboutDialog_box = $aboutDialog.find('.AboutDialog_box');
            data.$aboutDialog_button__ok = $aboutDialog.find('.AboutDialog_button__ok');

            data.fade_duration = 250;
            data.is_opened = false;
            data.defaults = {};
            data.defaults.width = 500;

            $aboutDialog.on('AboutDialog_initialize.AboutDialog', function (event) {
                data.init();
            });

            data.open = function (parameters) {
                data.is_opened = true;
                $aboutDialog.stop().fadeIn(data.fade_duration, function (event) {
                    data.$aboutDialog_button__ok.focus();
                });
            };

            data.$aboutDialog_button__ok.on('click.AboutDialog', function (event) {
                data.close();
            });

            data.$aboutDialog_button__ok.on('keyup.AboutDialog', function (event) {
                if (!data.is_opened) {
                    return;
                }

                event.stopPropagation();
                var keycode = event.keyCode ? event.keyCode: event.which;
                if ((keycode == 32) || (keycode == 13) || (keycode == 27)) {
                    data.close();
                }
            });

            data.close = function () {
                data.is_opened = false;
                $aboutDialog.stop().fadeOut(data.fade_duration);
            };

            data.$aboutDialog_box.on('click.AboutDialog', function (event) {
                event.stopPropagation();
            });

            $('body').on('keyup.AboutDialog', function (event) {
                if (!data.is_opened) {
                    return;
                }

                event.stopPropagation();
                var keycode = event.keyCode ? event.keyCode: event.which;
                if (keycode == 27) {
                    data.close();
                }
            });

            data.init = function () {
                $aboutDialog.find('.AboutDialog_version').html(GDBFrontend.version);
            };

            data.init();
        });
    };

    $.fn.AboutDialog = function(method) {
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method '+method+' does not exist on jQuery.AboutDialog');
        }
    };
})(jQuery);