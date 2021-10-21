/*
 * gdb-frontend is a easy, flexible and extensionable gui debugger
 *
 * https://github.com/rohanrhu/gdb-frontend
 * https://oguzhaneroglu.com/projects/gdb-frontend/
 *
 * Licensed under GNU/GPLv3
 * Copyright (C) 2019, Oğuzhan Eroğlu (https://oguzhaneroglu.com/) <rohanrhu2@gmail.com>
*/

GDBFrontend.imports.GDBFrontendCollabrationDraw = function (component) {
    var draw = {};
    var data = component;

    draw.is_enabled = false;
    draw.is_drawing = false;

    draw.pixel_treshold = 10;

    draw.current_path = [];

    data.$gdbFrontend_collabration_drawLayer = $('<canvas></canvas>');
    data.$gdbFrontend_collabration_drawLayer.addClass('GDBFrontend_collabration_drawLayer');
    data.$gdbFrontend_collabration_drawLayer.appendTo(data.$gdbFrontend);
    data.drawLayer_context = data.$gdbFrontend_collabration_drawLayer.get(0).getContext('2d');
    
    draw.init = function (parameters) {
        GDBFrontend.verbose("GDBFrontend collabration.draw.init()", data);
    };

    draw.render = function (parameters) {
        var i = Math.abs(data.collabration.state.draw.path_color - (data.collabration.state.draw.paths.length % 10 - 1));

        data.drawLayer_context.clearRect(0, 0, data.$gdbFrontend_collabration_drawLayer.width(), data.$gdbFrontend_collabration_drawLayer.height());
        
        data.collabration.state.draw.paths.forEach(function (_path, _path_i) {
            var j = i++ % 10;
            var color = draw.colors[j];
            
            _path.forEach(function (_point, _point_i) {
                var _x1 = _point[0];
                var _y1 = _point[1];

                var _x2 = _point[2];
                var _y2 = _point[3];
                
                drawLine(_x1, _y1, _x2, _y2, color);
            });
        });

        if (data.collabration.state.draw.paths.length) {
            data.$gdbFrontend_layout_status_collabration_clearDrawings.css('display', 'flex');
        } else {
            data.$gdbFrontend_layout_status_collabration_clearDrawings.hide();
        }
    };

    draw.clear = function (parameters) {
        data.collabration.state.draw.paths = [];
        data.collabration.state.draw.path_color = 0;
        
        data.drawLayer_context.clearRect(0, 0, data.$gdbFrontend_collabration_drawLayer.width(), data.$gdbFrontend_collabration_drawLayer.height());
        data.$gdbFrontend_layout_status_collabration_clearDrawings.hide();
    };

    draw.colors = ['aqua', 'silver', 'maroon', 'red', 'purple', 'fuchsia', 'green', 'yellow', 'navy', 'blue'];
    draw.fps = 15;

    var x1 = Infinity;
    var y1 = Infinity;

    data.$gdbFrontend_collabration_drawLayer.on('mousedown.GDBFrontend', function (event) {
        draw.is_drawing = true;
    });
    
    data.$gdbFrontend_collabration_drawLayer.on('mouseup.GDBFrontend', function (event) {
        draw.is_drawing = false;

        x1 = event.pageX;
        y1 = event.pageY;

        data.collabration.state.draw.paths.push(draw.current_path);
        data.collabration.sendEnhancedCollabrationState__draw_path();

        draw.current_path = [];
    });

    data.$gdbFrontend_collabration_drawLayer.on('mousemove.GDBFrontend', function (event) {
        if (!data.debug.state.is_enhanced_collabration) {
            return;
        }
        
        if ((x1 == Infinity) || (y1 == Infinity)) {
            x1 = event.pageX;
            y1 = event.pageY;
        }
        
        if (draw.is_enabled && draw.is_drawing && ((Math.abs(x1 - event.pageX) > draw.pixel_treshold) || (Math.abs(y1 - event.pageY) > draw.pixel_treshold))) {
            draw.current_path.push([x1, y1, event.pageX, event.pageY]);
            drawLine(x1, y1, event.pageX, event.pageY, draw.colors[(data.collabration.state.draw.path_color + 1) % 10]);
        }

        if (draw.is_enabled && ((Math.abs(x1 - event.pageX) > draw.pixel_treshold) || (Math.abs(y1 - event.pageY) > draw.pixel_treshold))) {
            x1 = event.pageX;
            y1 = event.pageY;
        }
    });

    var drawLine = function (x1, y1, x2, y2, color) {
        data.drawLayer_context.beginPath();
        data.drawLayer_context.strokeStyle = (color !== undefined) ? color: draw.colors[data.collabration.state.draw.path_color];
        data.drawLayer_context.lineWidth = 1;
        data.drawLayer_context.moveTo(x1, y1);
        data.drawLayer_context.lineTo(x2, y2);
        data.drawLayer_context.stroke();
        data.drawLayer_context.closePath();
    };

    var $window = $(window);
    
    $window.on('resize.GDBFrontend', function (event) {
        data.$gdbFrontend_collabration_drawLayer.attr({
            width: $window.width(),
            height: $window.height()
        });
    });

    data.$gdbFrontend_collabration_drawLayer.attr({
        width: $window.width(),
        height: $window.height()
    });
    
    $('body').on('keydown.GDBFrontend', function (event) {
        if (!data.debug.state.is_enhanced_collabration) {
            return;
        }
        
        var key_comb = event.shiftKey && event.ctrlKey && (event.keyCode == "X".charCodeAt());
        var esc = event.keyCode == 27;

        if (key_comb) {
            event.preventDefault();
        }

        if (key_comb && !draw.is_enabled) {
            draw.start();
        } else if (key_comb || esc) {
            draw.stop();
        }
    });

    $('body').on('keydown.GDBFrontend', function (event) {
        if (!data.debug.state.is_enhanced_collabration) {
            return;
        }
        
        var key_comb = event.shiftKey && event.ctrlKey && (event.keyCode == "C".charCodeAt());

        if (key_comb) {
            event.preventDefault();
        }

        if (key_comb) {
            draw.clear();
            data.debug.emit("collabration_state__draw_clear");
        }
    });

    draw.start = function (parameters) {
        draw.is_enabled = true;
            
        x1 = Infinity;
        y1 = Infinity;

        draw.current_path = [];
        
        data.$gdbFrontend_collabration_drawLayer.addClass('GDBFrontend__drawing');
    };
    
    draw.stop = function (parameters) {
        draw.is_enabled = false;
        data.$gdbFrontend_collabration_drawLayer.removeClass('GDBFrontend__drawing');
    };
    
    data.collabration.sendEnhancedCollabrationState__draw_path = function (parameters) {
        if (window.GDBFrontend_is_evaluater_window) {
            return;
        }
        
        var message = {};

        message.path = data.collabration.state.draw.paths[data.collabration.state.draw.paths.length-1];
        
        data.debug.emit("collabration_state__draw_path", message);

        data.$gdbFrontend_layout_status_collabration_clearDrawings.css('display', 'flex');
    };

    data.$gdbFrontend.on('GDBFrontend_debug_enhanced_collabration_state__draw_path.GDBFrontend', function (event, message) {
        if (window.GDBFrontend_is_evaluater_window) {
            return;
        }
        
        GDBFrontend.verbose('Enhanced collabration draw path:', message);

        data.collabration.state.draw.path_color = message.draw.path_color;
        
        if (message.is_from_me) {
            return;
        }
        
        message.path.forEach(function (_path, _path_i) {
            var _x1 = _path[0];
            var _y1 = _path[1];

            var _x2 = _path[2];
            var _y2 = _path[3];

            drawLine(_x1, _y1, _x2, _y2);
        });

        data.$gdbFrontend_layout_status_collabration_clearDrawings.css('display', 'flex');
    });
    
    data.$gdbFrontend.on('GDBFrontend_debug_enhanced_collabration_state__draw_clear.GDBFrontend', function (event, message) {
        if (window.GDBFrontend_is_evaluater_window) {
            return;
        }
        
        GDBFrontend.verbose('Enhanced collabration draw clear.');

        if (message.is_from_me) {
            return;
        }
        
        draw.clear();
    });

    data.$gdbFrontend_layout_status_collabration_clearDrawings.on('click.GDBFrontend', function (event) {
        data.debug.emit("collabration_state__draw_clear");
        draw.clear();
    });
    
    data.$gdbFrontend_layout_status_collabration_toggleDrawing.on('click.GDBFrontend', function (event) {
        if (draw.is_enabled) {
            draw.stop();
        } else {
            draw.start();
        }
    });
    
    return draw;
};