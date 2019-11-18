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
            var $breakpointEditor = $(this);

            $breakpointEditor.off('.BreakpointsEditor');
            $breakpointEditor.find('*').off('.BreakpointsEditor');

            var data = {};
            $breakpointEditor.data('BreakpointsEditor', data);
            data.$breakpointEditor = $breakpointEditor;

            data.$breakpointEditor_noItems = $breakpointEditor.find('.BreakpointsEditor_noItems');
            data.$breakpointEditor_items = $breakpointEditor.find('.BreakpointsEditor_items');
            data.$breakpointEditor_items_item__proto = data.$breakpointEditor_items.find('.BreakpointsEditor_items_item.__proto');

            data.animation_duration = 100;

            data.is_passive = false;
            data.breakpoints = [];

            data.load = function (parameters) {
                data.breakpoints = [];

                parameters.breakpoints.forEach(function (_bp, _bp_i) {
                    var breakpoint = {};
                    breakpoint.file = _bp.file;
                    breakpoint.line = _bp.line;
                    breakpoint.gdb_breakpoint = _bp.gdb_breakpoint;

                    data.breakpoints.push(breakpoint);
                });
            };

            data.render = function (parameters) {
                if (parameters === undefined) {
                    parameters = {};
                }

                data.$breakpointEditor_items.find('.BreakpointsEditor_items_item:not(.__proto)').remove();

                data.breakpoints.forEach(function (breakpoint, breakpoint_i) {
                    var $item = data.$breakpointEditor_items_item__proto.clone();
                    $item.removeClass('__proto');
                    $item.appendTo(data.$breakpointEditor_items);

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

                        $breakpointEditor.trigger('BreakpointsEditor_breakpoint_enabled_changed', {
                            breakpoint: breakpoint,
                            is_enabled: breakpoint.item_check_checkboxComp_checkbox.is_checked
                        });
                    });

                    var loc = pathFileName(breakpoint.file) + ':' + breakpoint.line;

                    breakpoint.$item_loc_val.html(loc);

                    breakpoint.$item_loc.on('click.BreakpointsEditor', function (event) {
                        $breakpointEditor.trigger('BreakpointsEditor_breakpoint_selected', {
                            breakpoint: breakpoint
                        });
                    });

                    breakpoint.$item_remove.on('click.BreakpointsEditor', function (event) {
                        $breakpointEditor.trigger('BreakpointsEditor_breakpoint_removed', {
                            breakpoint: breakpoint
                        });
                    });
                });
            };

            $breakpointEditor.on('BreakpointsEditor_initialize.BreakpointsEditor', function (event) {
                data.init();
            });

            $breakpointEditor.on('BreakpointsEditor_comply.BreakpointsEditor', function (event) {
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

    $.fn.BreakpointsEditor.TREE_ITEM_NAME = 0;
    $.fn.BreakpointsEditor.TREE_ITEM_ITEMS = 1;
    $.fn.BreakpointsEditor.TREE_ITEM_LEVEL = 2;
    $.fn.BreakpointsEditor.TREE_ITEM_PATH = 3;
    $.fn.BreakpointsEditor.TREE_ITEM_TYPE = 4;
    $.fn.BreakpointsEditor.TREE_ITEM_ITEM = 5;

    $.fn.BreakpointsEditor.TREE_ITEM_TYPE__DIR = 1;
    $.fn.BreakpointsEditor.TREE_ITEM_TYPE__FILE = 2;
})(jQuery);