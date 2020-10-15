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
    var methods = {
    };

    methods.init = function (parameters) {
        var t_init = this;
        var $elements = $(this);

        if (typeof parameters == 'undefined') {
            parameters = {};
        }

        t_init.parameters = parameters;

        $elements.each(function () {
            var $resizable = $(this);

            $resizable.off('.Resizable');
            $resizable.find('*').off('.Resizable');

            var current_data = $resizable.data('Resizable');
            
            if (current_data) {
                $(window).off('Resizable-' + current_data.id);
                $(document).off('Resizable-' + current_data.id);
                $('html, body').off('Resizable-' + current_data.id)
            }

            var data = {};
            $resizable.data('Resizable', data);
            data.$resizable = $resizable;

            if (!window.hasOwnProperty('Resizable_component_id')) {
                Resizable_component_id = 0;
            }

            data.id = ++Resizable_component_id;

            data.$resizable_resizer = $resizable.find('.Resizable_resizer');
            data.$resizable_resizer_draggable = data.$resizable_resizer.find('.Resizable_resizer_draggable');

            data.is_passive = false;
            data.is_resizing = false;

            data.$overlay = $('<div></div>').css({
                position: 'absolute',
                left: 0,
                top: 0,
                width: '100%',
                height: '100%',
                zIndex: 500000
            });

            data.$resizable_resizer_draggable.on('mousedown.Resizable-'+data.id, function (event) {
                data.is_resizing = true;
                data.$resizable.trigger('Resizable_start');

                data.$overlay.appendTo(data.$resizable);
            });
            
            $(document).on('mouseup.Resizable-'+data.id, function (event) {
                data.is_resizing = false;
                data.$resizable.trigger('Resizable_end');

                data.$overlay.remove();
            });
            
            $(document).on('mousemove.Resizable-'+data.id, function (event) {
                if (!data.is_resizing) {
                    return;
                }

                var rx, ry, rl;
                var px, py;
                var width, height;

                if (data.$resizable.hasClass('Resizable__top')) {
                    ry = data.$resizable.offset().top;
                    py = event.originalEvent.clientY;

                    rl = ry + data.$resizable.outerHeight();
                    height = rl - py;

                    if (height < 5) {
                        height = 5;
                    }

                    data.$resizable.height(height);
                } else {
                    rx = data.$resizable.offset().left;
                    px = event.originalEvent.clientX;

                    if (data.$resizable.hasClass('Resizable__right')) {
                        rl = rx + data.$resizable.outerWidth();
                        width = rl - px;
                    } else {
                        width = px - rx;
                    }

                    if (width < 5) {
                        width = 5;
                    }
                    
                    data.$resizable.width(width);
                }
            });

            $resizable.on('Resizable_initialize.Resizable-' + data.id, function (event) {
                data.init();
            });

            $resizable.on('Resizable_comply.Resizable-' + data.id, function (event) {
                data.comply();
            });

            data.init = function () {
            };

            data.comply = function () {
            };

            data.init();
        });
    }

    $.fn.Resizable = function(method) {
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method '+method+' does not exist on jQuery.Resizable');
        }
    };

})(jQuery);