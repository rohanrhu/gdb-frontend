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
    var methods = {
        init: function (parameters) {
            var t_init = this;
            var $elements = $(this);

            if (typeof parameters == 'undefined') {
                parameters = {};
            }

            t_init.parameters = parameters;

            $elements.each(function () {
                var $evaulateExpression = $(this);

                $(window).off('EvaulateExpression');
                $(document).off('EvaulateExpression');
                $('body').off('EvaulateExpression')
                
                $evaulateExpression.off('.EvaulateExpression');
                $evaulateExpression.find('*').off('.EvaulateExpression');

                var data = {};
                $evaulateExpression.data('EvaulateExpression', data);
                data.$evaulateExpression = $evaulateExpression;

                if (!window.hasOwnProperty('EvaulateExpression_component_id')) {
                    EvaulateExpression_component_id = 0;
                }

                data.id = ++EvaulateExpression_component_id;

                data.components = {};

                data.$evaulateExpression_window = $evaulateExpression.find('.EvaulateExpression_window');
                data.$evaulateExpression_window_closeBtn = data.$evaulateExpression_window.find('.EvaulateExpression_window_closeBtn');

                data.$evaulateExpression_window_box_header_expression = data.$evaulateExpression_window.find('.EvaulateExpression_window_box_header_expression');
                data.$evaulateExpression_window_box_header_expression_input = data.$evaulateExpression_window_box_header_expression.find('.EvaulateExpression_window_box_header_expression_input');
                data.$evaulateExpression_window_box_header_expression_input_rI = data.$evaulateExpression_window_box_header_expression_input.find('.EvaulateExpression_window_box_header_expression_input_rI');

                data.$evaulateExpression_window_mover = data.$evaulateExpression_window.find('.EvaulateExpression_window_mover');

                data.$evaulateExpression_items = $evaulateExpression.find('.EvaulateExpression_items');
                data.$evaulateExpression_items_item__proto = $evaulateExpression.find('.EvaulateExpression_items_item.__proto');
                data.$evaulateExpression_items_parentBtn = $evaulateExpression.find('.EvaulateExpression_items_parentBtn');
                
                data.$evaulateExpression_window_box_content = $evaulateExpression.find('.EvaulateExpression_window_box_content');

                data.$evaulateExpression_value = $evaulateExpression.find('.EvaulateExpression_value');
                data.$evaulateExpression_noValue = $evaulateExpression.find('.EvaulateExpression_noValue');

                data.$evaulateExpression_variablesExplorerComp = data.$evaulateExpression.find('.EvaulateExpression_variablesExplorerComp');
                data.$evaulateExpression_variablesExplorer = data.$evaulateExpression_variablesExplorerComp.find('> .VariablesExplorer');
                data.$evaulateExpression_variablesExplorer.VariablesExplorer();
                data.evaulateExpression_variablesExplorer = data.$evaulateExpression_variablesExplorer.data().VariablesExplorer;
                data.components.variablesExplorer = data.evaulateExpression_variablesExplorer;

                data.components.variablesExplorer.mark_changes = false;
                data.components.variablesExplorer.setFluent(true);

                data.animation_duration = 100;

                data.is_passive = false;
                data.is_opened = false;

                data.$evaulateExpression_window_box_header_expression_input_rI.on('keydown.EvaulateExpression-'+data.id, function (event) {
                    if (!data.is_opened) {
                        return;
                    }
                    
                    var expression = data.$evaulateExpression_window_box_header_expression_input_rI.val();
                    
                    var keycode = event.keyCode ? event.keyCode : event.which;
                    if (keycode == 27) {
                        data.close();
                    } else if (keycode == 13) {
                        data.refresh({expression});
                    }
                });
                
                $evaulateExpression.on('mousedown.EvaulateExpression-' + data.id, function (event) {
                    data.focus();
                });
                
                data.$evaulateExpression_window_closeBtn.on('mousedown.EvaulateExpression-' + data.id, function (event) {
                    data.close();
                });

                $(document).on('mousedown.EvaulateExpression-'+data.id, function (event) {
                    if ($evaulateExpression.is(event.target) || $evaulateExpression.has(event.target).length) {
                        return;
                    }
                    
                    data.blur();
                });
                
                data.$evaulateExpression_window_box_content.on('resize.EvaulateExpression-' + data.id, function (event) {
                    data.variablePopup_variablesExplorer.setMaxHeight({max_height: file.$variablePopup.height()});
                });

                data.$evaulateExpression_variablesExplorer.on('VariablesExplorer_item_toggle.EvaulateExpression', function (event, parameters) {
                    if (parameters.item.is_opened) {
                        parameters.item.close();
                        return;
                    }
    
                    parameters.item.setLoading(true);
    
                    var tree = [];
    
                    parameters.item.tree.forEach(function (_member, _member_i) {
                        tree.push(_member.variable.name);
                    });
    
                    var qs = {
                        variable: parameters.item.variable.name
                    };
    
                    if (tree.length > 1) {
                        qs['expression'] = tree.join('.');
                    }
    
                    $.ajax({
                        url: '/api/frame/variable',
                        cache: false,
                        method: 'get',
                        data: qs,
                        success: function (result_json) {
                            if (!result_json.ok) {
                                GDBFrontend.showMessageBox({text: 'An error occured.'});
                                console.trace('An error occured.');
    
                                parameters.item.setLoading(false);
    
                                return;
                            }
    
                            parameters.item.load({
                                members: result_json.variable.members
                            });
    
                            parameters.item.render();
                            parameters.item.open({is_preload: parameters.is_preload});
                            parameters.item.setLoading(false);
                        },
                        error: function () {
                            GDBFrontend.showMessageBox({text: 'An error occured.'});
                            console.trace('An error occured.');
    
                            parameters.item.setLoading(false);
                        }
                    });
                });

                data.refresh = function (parameters) {
                    if (!parameters.expression) {
                        data.$evaulateExpression_noValue.show();
                        data.$evaulateExpression_value.hide();
                        return;
                    }
                    
                    $.ajax({
                        url: '/api/frame/variable',
                        cache: false,
                        method: 'get',
                        data: {
                            expression: parameters.expression
                        },
                        success: function (result_json) {
                            if (!result_json.ok) {
                                GDBFrontend.showMessageBox({text: 'An error occured.'});
                                console.trace('An error occured.');
                                return;
                            }

                            if (result_json.variable) {
                                data.$evaulateExpression_variablesExplorer.data().VariablesExplorer.load({variables: [result_json.variable]});
                                data.$evaulateExpression_variablesExplorer.data().VariablesExplorer.render();

                                data.$evaulateExpression_noValue.hide();
                                data.$evaulateExpression_value.show();
                            } else {
                                data.$evaulateExpression_noValue.show();
                                data.$evaulateExpression_value.hide();
                            }
                        },
                        error: function () {
                            GDBFrontend.showMessageBox({text: 'An error occured.'});
                            console.trace('An error occured.');
                        }
                    });
                };

                data.open = function (parameters) {
                    if (parameters === undefined) {
                        parameters = {};
                    }

                    data.is_opened = true;

                    data.focus();
                    $evaulateExpression.data().Movable.focus();
                    
                    var x = (window.innerWidth / 2) - ($evaulateExpression.outerWidth()/2);
                    var y = (window.innerHeight / 2) - ($evaulateExpression.outerHeight()/2);

                    x = x + (5 + parseInt(Math.random()*20)) * (Math.random() >= 0.5 ? 1: -1);
                    y = y + (5 + parseInt(Math.random()*20)) * (Math.random() >= 0.5 ? 1: -1);
                    
                    $evaulateExpression.css('transform', 'translate('+x+'px, '+y+'px)');
                    
                    $evaulateExpression.fadeIn(data.animation_duration, function (event) {
                        data.$evaulateExpression_window_box_header_expression_input_rI.focus();
                        
                        if (parameters.onOpened) {
                            parameters.onOpened();
                        }
                    });
                };

                data.close = function (parameters) {
                    if (parameters === undefined) {
                        parameters = {};
                    }
                    
                    data.is_opened = false;

                    data.blur();
                    $evaulateExpression.data().Movable.blur();
                    
                    $evaulateExpression.fadeOut(data.animation_duration, function (event) {
                        if (parameters.onClosed) {
                            parameters.onClosed();
                        }
                        $evaulateExpression.trigger('EvaulateExpression_closed');
                    });
                };

                data.focus = function (parameters) {
                    $evaulateExpression.addClass('EvaulateExpression__focused');
                };
                
                data.blur = function (parameters) {
                    $evaulateExpression.removeClass('EvaulateExpression__focused');
                };
                
                data.setSize = function (parameters) {
                    data.$evaulateExpression_window_box_content.width(parameters.width);
                    data.$evaulateExpression_window_box_content.height(parameters.height);
                };

                data.toggle = function (parameters) {
                    data[data.is_opened ? 'close': 'open']();
                };

                $evaulateExpression.on('EvaulateExpression_initialize.EvaulateExpression-' + data.id, function (event) {
                    data.init();
                });

                $evaulateExpression.on('EvaulateExpression_comply.EvaulateExpression-' + data.id, function (event) {
                    data.comply();
                });

                data.init = function () {
                    $evaulateExpression.Movable();
                };

                data.comply = function () {
                };

                data.init();
            });
        }
    };

    $.fn.EvaulateExpression = function(method) {
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method '+method+' does not exist on jQuery.EvaulateExpression');
        }
    };
})(jQuery);