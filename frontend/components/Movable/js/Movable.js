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

if (!window.Movable_zIndex_i) {
    Movable_zIndex_i = 1;
}
 
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
            var $movable = $(this);

            $movable.off('.Movable');
            $movable.find('*').off('.Movable');

            var current_data = $movable.data('Movable');
        
            if (current_data) {
                $(window).off('Movable-' + current_data.id);
                $(document).off('Movable-' + current_data.id);
                $('html, body').off('Movable-' + current_data.id)
            }

            var data = {};
            $movable.data('Movable', data);
            data.$movable = $movable;

            if (!window.hasOwnProperty('Movable_component_id')) {
                Movable_component_id = 0;
            }

            data.id = ++Movable_component_id;

            data.$movable_mover = $movable.find('.Movable_mover');

            data.is_passive = false;
            data.is_moving = false;
            data.is_limit_bounds = false;
            
            var dx;
            var dy;
            var dirx;
            var diry;
            var px = 0;
            var py = 0;
            
            data.$movable_mover.on('mousedown.Movable-'+data.id, function (event) {
                data.is_moving = true;

                var px = event.clientX;
                var py = event.clientY;
                
                var mx = $movable.offset().left;
                var my = $movable.offset().top;
                
                dx = Math.abs(Math.abs(px - mx));
                dy = Math.abs(Math.abs(py - my));

                px = event.clientX;
                py = event.clientY;
            });

            $movable.on('mousedown.Movable-' + data.id, function (event) {
                data.focus();
                
                $('.Movable').not($movable).removeClass('Movable__lastFocused');
                $movable.addClass('Movable__lastFocused');
            });
            
            $(document).on('mousedown.Movable-'+data.id, function (event) {
                if ($movable.is(event.target) || $movable.has(event.target).length) {
                    return;
                }
                
                data.blur();
            });
            
            data.update = function (parameters) {
                if (!data.is_moving) {
                    return;
                }

                if (px > parameters.event.clientX) {
                    dirx = -1;
                } else if (px < parameters.event.clientX) {
                    dirx = 1;
                } else {
                    dirx = 0;
                }
                
                if (py > parameters.event.clientY) {
                    diry = -1;
                } else if (py < parameters.event.clientY) {
                    diry = 1;
                } else {
                    diry = 0;
                }
                
                px = parameters.event.clientX;
                py = parameters.event.clientY;
                
                var ww = window.innerWidth;
                var wh = window.innerHeight;
                
                var mw = $movable.outerWidth();
                var mh = $movable.outerHeight();
                
                var mx = $movable.offset().left;
                var my = $movable.offset().top;

                var lx = mw + mx;
                var ly = mh + my;
                
                var x = px - dx;
                var y = py - dy;
                
                if (data.is_limit_bounds) {
                    if (x < 0) {
                        x = 0;
                    }
                }

                if (y < 0) {
                    y = 0;
                }

                if (data.is_limit_bounds) {
                    if ((lx > ww) && (dirx > 0)) {
                        x = mx;
                        dx = Math.abs(Math.abs(px - x));
                    }
                }
                
                if (data.is_limit_bounds) {
                    if ((ly > wh) && (diry > 0)) {
                        y = my;
                        dy = Math.abs(Math.abs(py - y));
                    }
                }
                
                $movable.css('transform', 'translate('+x+'px, '+y+'px)');

                $movable.trigger('Movable_move');
            };
            
            $(document).on('mousemove.Movable-'+data.id, function (event) {
                data.update({event: event})
            });
            
            $(window).on('resize.Movable-'+data.id, function (event) {
                setTimeout(function () {
                    data.comply({event: event});
                }, 250);
            });
            
            $(document).on('mouseup.Movable-'+data.id, function (event) {
                data.is_moving = false;
            });
            
            $movable.on('Movable_initialize.Movable-' + data.id, function (event) {
                data.init();
            });

            $movable.on('Movable_comply.Movable-' + data.id, function (event) {
                data.comply();
            });

            data.init = function () {
            };

            data.focus = function (parameters) {
                $movable.css('z-index', Movable_zIndex_i++);
                $movable.addClass('Movable__focused');
                $movable.trigger('Movable_focused', {zIndex: Movable_zIndex_i});
            };
            
            data.blur = function (parameters) {
                $movable.trigger('Movable_blured');
                $movable.removeClass('Movable__focused');
            };

            data.comply = function (parameters) {
                var ww = window.innerWidth;
                var wh = window.innerHeight;
                
                var mw = $movable.outerWidth();
                var mh = $movable.outerHeight();
                
                var mx = $movable.offset().left;
                var my = $movable.offset().top;

                var lx = mw + mx;
                var ly = mh + my;

                var x = px - dx;
                var y = py - dy;

                if (data.is_limit_bounds) {
                    if (x < 0) {
                        x = 0;
                    }
                }
                
                if (y < 0) {
                    y = 0;
                }

                if (data.is_limit_bounds) {
                    if (lx > ww) {
                        x = ww - mw-1;
                    }
                }
                
                if (ly > wh) {
                    y = wh - mh-1;
                }
                
                $movable.css('transform', 'translate('+x+'px, '+y+'px)');

                $movable.trigger('Movable_move');
            };

            data.init();
        });
    }

    $.fn.Movable = function(method) {
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method '+method+' does not exist on jQuery.Movable');
        }
    };
})(jQuery);