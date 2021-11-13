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
            var $contextMenu = $(this);

            $contextMenu.off('.ContextMenu');
            $contextMenu.find('*').off('.ContextMenu');
            $('html, body').off('.ContextMenu');

            var data = {};
            $contextMenu.data('ContextMenu', data);
            data.$contextMenu = $contextMenu;
            
            data.$ContextMenuWindow = false;
            
            data.fade_duration = 250;
            data.is_opened = false;

            data.defaults = {};
            data.defaults.width = 500;

            data.event = false;

            data.actions = t_init.parameters.actions ? t_init.parameters.actions: {};

            if (t_init.parameters.hasOwnProperty('actions')) {
                data.actions = t_init.parameters.actions;
            }

            data.setActions = function (parameters) {
                data.actions = parameters.actions;
            };

            data.render = function (parameters) {
                if (!data.$ContextMenuWindow) {
                    return;
                }
                
                var $noActions  = data.$ContextMenuWindow.find('.ContextMenuWindow_noAction');
                var $actions = data.$ContextMenuWindow.find('.ContextMenuWindow_actions');
                var $actions_action__proto = $actions.find('.ContextMenuWindow_actions_action.__proto');

                if (!data.actions || !Object.keys(data.actions).length) {
                    $noActions.show();
                    $actions.hide();
                    return;
                }

                $noActions.hide();
                $actions.show();

                $actions.find('.ContextMenuWindow_actions_action:not(.__proto)').remove();

                Object.keys(data.actions).forEach(function (_action_name, _action_i) {
                    var action = data.actions[_action_name];
                    var $action = $actions_action__proto.clone(true);
                    $action.removeClass('__proto');
                    $action.appendTo($actions);

                    var $action_label = $action.find('.ContextMenuWindow_actions_action_label');

                    $action_label.html(action.label);

                    $action_label.on('click.ContextMenu', function (event) {
                        data.close();
                        action.function();
                    });
                });
            };
            
            data.open = function (parameters) {
                if (data.is_opened) {
                    data.close();
                }

                data.is_opened = true;
                
                data.$ContextMenuWindow = $($.fn.ContextMenu.HTML);
                data.$ContextMenuWindow.appendTo($('body'));
                var $ContextMenuWindow_box = data.$ContextMenuWindow.find('.ContextMenuWindow_box');

                var x = $contextMenu.offset().left;
                var y = $contextMenu.offset().top;

                if (data.event) {
                    x += data.event.offsetX;
                    y += data.event.offsetY;
                    
                    data.event = false;
                }
                
                $ContextMenuWindow_box.css('left', x);
                $ContextMenuWindow_box.css('top', y);

                data.render();

                data.$ContextMenuWindow.on('click.ContextMenu, contextmenu.ContextMenu', function (event) {
                    event.preventDefault();
                    
                    if (event.target != data.$ContextMenuWindow[0]) {
                        return;
                    }
                    
                    if (data.is_opened) {
                        data.close();
                    }
                });
            };

            data.close = function () {
                data.is_opened = false;

                data.$ContextMenuWindow.remove();
                data.$ContextMenu = false;
            };
            
            $contextMenu.on('contextmenu.ContextMenu', function (event) {
                event.preventDefault();
                event.stopPropagation();

                data.event = event;
                
                data.open();
            });

            data.init = function () {
            };

            $contextMenu.on('ContextMenu_initialize.ContextMenu', function (event) {
                data.init();
            });

            $(window).on('keyup.ContextMenu', function (event) {
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

    $.fn.ContextMenu = function(method) {
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method '+method+' does not exist on jQuery.ContextMenu');
        }
    };

    $.fn.ContextMenu.HTML = `
        <div class="ContextMenuWindow">
            <div class="ContextMenuWindow_box">
                <div class="ContextMenuWindow_noAction">
                    <div class="ContextMenuWindow_noAction_label">
                        No action
                    </div>
                </div>
                <div class="ContextMenuWindow_actions">
                    <div class="ContextMenuWindow_actions_action __proto">
                        <div class="ContextMenuWindow_actions_action_label">
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
})(jQuery);