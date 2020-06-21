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
 * BreakpointsEditor shows GDBFrontend component's breakpoints.
 * BreakpointsEditor.breakpoints is a breakpoints array in the format of GDBFrontend.breakpoints
 * BreakpointsEditor.load accepts array format of GDBFrontend.breakpoints.
 */

(function($) {
    var pathFileName = function (path) {
        if (!path.length) {
            return false;
        }

        path = path.replace(/\\/g, '/');
        var s = path.split('/');

        if (path[0] == '/') {
            s = s.slice(1);
        }

        return s[s.length-1];
    };

    var pathTree = function (path) {
        if (!path.length) {
            return [];
        }

        path = path.replace(/\\/g, '/');
        var s = path.split('/');

        if (path[0] == '/') {
            s = s.slice(1);
        }

        return s;
    };

    var methods = {};

    methods.init = function (parameters) {
        var t_init = this;
        var $elements = $(this);

        if (typeof parameters == 'undefined') {
            parameters = {};
        }

        t_init.parameters = parameters;

        $elements.each(function () {
            var $breakpointsEditor = $(this);

            $breakpointsEditor.off('.BreakpointsEditor');
            $breakpointsEditor.find('*').off('.BreakpointsEditor');

            var data = {};
            $breakpointsEditor.data('BreakpointsEditor', data);
            data.$breakpointsEditor = $breakpointsEditor;
            
            data.id = ++$.fn.BreakpointsEditor.id_i;

            data.$breakpointsEditor_noItems = $breakpointsEditor.find('.BreakpointsEditor_noItems');
            data.$breakpointsEditor_items = $breakpointsEditor.find('.BreakpointsEditor_items');
            data.$breakpointsEditor_items_item__proto = data.$breakpointsEditor_items.find('.BreakpointsEditor_items_item.__proto');

            data.animation_duration = 100;

            data.is_passive = false;
            data.breakpoints = [];

            data.load = function (parameters) {
                data.breakpoints = [];

                parameters.breakpoints.forEach(function (_bp, _bp_i) {
                    var breakpoint = {};
                    breakpoint.file = _bp.file;
                    breakpoint.line = _bp.line;
                    breakpoint.address = _bp.address;
                    breakpoint.gdb_breakpoint = _bp.gdb_breakpoint;

                    data.breakpoints.push(breakpoint);
                });
            };

            data.render = function (parameters) {
                if (parameters === undefined) {
                    parameters = {};
                }

                data.$breakpointsEditor_items.find('.BreakpointsEditor_items_item:not(.__proto)').remove();

                data.breakpoints.forEach(function (breakpoint, breakpoint_i) {
                    var $item = data.$breakpointsEditor_items_item__proto.clone();
                    $item.removeClass('__proto');
                    $item.appendTo(data.$breakpointsEditor_items);

                    breakpoint.$item = $item;
                    breakpoint.$item_check = $item.find('.BreakpointsEditor_items_item_check');
                    breakpoint.$item_loc = $item.find('.BreakpointsEditor_items_item_loc');
                    breakpoint.$item_loc_val = $item.find('.BreakpointsEditor_items_item_loc_val');

                    breakpoint.$item_check_checkboxComp = breakpoint.$item_check.find('.BreakpointsEditor_items_item_check_checkboxComp');
                    breakpoint.$item_check_checkboxComp_checkbox = breakpoint.$item_check_checkboxComp.find('> .Checkbox');
                    breakpoint.$item_check_checkboxComp_checkbox.Checkbox();
                    breakpoint.item_check_checkboxComp_checkbox = breakpoint.$item_check_checkboxComp_checkbox.data('Checkbox');

                    breakpoint.$item_remove = $item.find('.BreakpointsEditor_items_item_remove');

                    breakpoint.is_enabled = breakpoint.gdb_breakpoint.enabled;

                    breakpoint.item_check_checkboxComp_checkbox.set({checked: breakpoint.gdb_breakpoint.enabled});
                    breakpoint.$item_check_checkboxComp_checkbox.on('Checkbox_changed.BreakpointsEditor', function (event, parameters) {
                        is_enabled = parameters.is_checked;

                        $breakpointsEditor.trigger('BreakpointsEditor_breakpoint_enabled_changed', {
                            breakpoint: breakpoint,
                            is_enabled: breakpoint.item_check_checkboxComp_checkbox.is_checked
                        });
                    });

                    var loc;
                    
                    if (breakpoint.file && breakpoint.line) {
                        loc = pathFileName(breakpoint.file) + ':' + breakpoint.line;
                    } else if (breakpoint.gdb_breakpoint.assembly) {
                        loc = breakpoint.gdb_breakpoint.assembly;
                    } else {
                        loc = breakpoint.gdb_breakpoint.location;
                    }

                    breakpoint.$item_loc_val.html(loc);

                    breakpoint.$item_loc.on('click.BreakpointsEditor', function (event) {
                        if (!breakpoint.file || !breakpoint.line) {
                            return;
                        }
                        
                        $breakpointsEditor.trigger('BreakpointsEditor_breakpoint_selected', {
                            breakpoint: breakpoint
                        });
                    });

                    breakpoint.$item_remove.on('click.BreakpointsEditor', function (event) {
                        $breakpointsEditor.trigger('BreakpointsEditor_breakpoint_removed', {
                            breakpoint: breakpoint
                        });
                    });
                });
            };

            $breakpointsEditor.on('BreakpointsEditor_initialize.BreakpointsEditor', function (event) {
                data.init();
            });

            $breakpointsEditor.on('BreakpointsEditor_comply.BreakpointsEditor', function (event) {
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

    $.fn.BreakpointsEditor = function(method) {
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method '+method+' does not exist on jQuery.BreakpointsEditor');
        }
    };
    
    $.fn.BreakpointsEditor.id_i = 0;
})(jQuery);