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
            var $Resizable = $(this);

            $Resizable.off('.Resizable');
            $Resizable.find('*').off('.Resizable');

            var data = {};
            $Resizable.data('Resizable', data);
            data.$Resizable = $Resizable;

            if (!window.hasOwnProperty('Resizable_component_id')) {
                Resizable_component_id = 0;
            }

            data.id = ++Resizable_component_id;

            data.$Resizable_resizer = $Resizable.find('.Resizable_resizer');
            data.$Resizable_resizer_draggable = data.$Resizable_resizer.find('.Resizable_resizer_draggable');

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

            data.$Resizable_resizer_draggable.on('mousedown.Resizable-'+data.id, function (event) {
                data.is_resizing = true;
                data.$Resizable.trigger('Resizable_start');

                data.$overlay.appendTo(data.$Resizable);
            });
            
            $(document).on('mouseup.Resizable-'+data.id, function (event) {
                data.is_resizing = false;
                data.$Resizable.trigger('Resizable_end');

                data.$overlay.remove();
            });
            
            $(document).on('mousemove.Resizable-'+data.id, function (event) {
                if (!data.is_resizing) {
                    return;
                }

                var rx, ry, rl;
                var px, py;
                var width, height;

                if (data.$Resizable.hasClass('Resizable__top')) {
                    ry = data.$Resizable.offset().top;
                    py = event.originalEvent.clientY;

                    rl = ry + data.$Resizable.outerHeight();
                    height = rl - py;

                    if (height < 5) {
                        height = 5;
                    }

                    data.$Resizable.height(height);
                } else {
                    rx = data.$Resizable.offset().left;
                    px = event.originalEvent.clientX;

                    if (data.$Resizable.hasClass('Resizable__right')) {
                        rl = rx + data.$Resizable.outerWidth();
                        width = rl - px;
                    } else {
                        width = px - rx;
                    }

                    if (width < 5) {
                        width = 5;
                    }
                    
                    data.$Resizable.width(width);
                }
            });

            $Resizable.on('Resizable_initialize.Resizable-' + data.id, function (event) {
                data.init();
            });

            $Resizable.on('Resizable_comply.Resizable-' + data.id, function (event) {
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