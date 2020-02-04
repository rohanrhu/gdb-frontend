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
                var $evaluateExpression = $(this);

                $(window).off('EvaluateExpression');
                $(document).off('EvaluateExpression');
                $('body').off('EvaluateExpression')
                
                $evaluateExpression.off('.EvaluateExpression');
                $evaluateExpression.find('*').off('.EvaluateExpression');

                var data = {};
                $evaluateExpression.data('EvaluateExpression', data);
                data.$evaluateExpression = $evaluateExpression;

                if (!window.hasOwnProperty('EvaluateExpression_component_id')) {
                    EvaluateExpression_component_id = 0;
                }

                data.id = ++EvaluateExpression_component_id;

                data.components = {};

                data.$evaluateExpression_window = $evaluateExpression.find('.EvaluateExpression_window');
                data.$evaluateExpression_window_closeBtn = data.$evaluateExpression_window.find('.EvaluateExpression_window_closeBtn');

                data.$evaluateExpression_window_box_header_expression = data.$evaluateExpression_window.find('.EvaluateExpression_window_box_header_expression');
                data.$evaluateExpression_window_box_header_expression_input = data.$evaluateExpression_window_box_header_expression.find('.EvaluateExpression_window_box_header_expression_input');
                data.$evaluateExpression_window_box_header_expression_input_rI = data.$evaluateExpression_window_box_header_expression_input.find('.EvaluateExpression_window_box_header_expression_input_rI');

                data.$evaluateExpression_window_mover = data.$evaluateExpression_window.find('.EvaluateExpression_window_mover');

                data.$evaluateExpression_items = $evaluateExpression.find('.EvaluateExpression_items');
                data.$evaluateExpression_items_item__proto = $evaluateExpression.find('.EvaluateExpression_items_item.__proto');
                data.$evaluateExpression_items_parentBtn = $evaluateExpression.find('.EvaluateExpression_items_parentBtn');
                
                data.$evaluateExpression_window_box_content = $evaluateExpression.find('.EvaluateExpression_window_box_content');

                data.$evaluateExpression_value = $evaluateExpression.find('.EvaluateExpression_value');
                data.$evaluateExpression_noValue = $evaluateExpression.find('.EvaluateExpression_noValue');

                data.$evaluateExpression_variablesExplorerComp = data.$evaluateExpression.find('.EvaluateExpression_variablesExplorerComp');
                data.$evaluateExpression_variablesExplorer = data.$evaluateExpression_variablesExplorerComp.find('> .VariablesExplorer');
                data.$evaluateExpression_variablesExplorer.VariablesExplorer();
                data.evaluateExpression_variablesExplorer = data.$evaluateExpression_variablesExplorer.data().VariablesExplorer;
                data.components.variablesExplorer = data.evaluateExpression_variablesExplorer;

                data.components.variablesExplorer.mark_changes = false;
                data.components.variablesExplorer.setFluent(true);

                data.animation_duration = 100;

                data.is_passive = false;
                data.is_opened = false;

                data.$evaluateExpression_window_box_header_expression_input_rI.on('keydown.EvaluateExpression-'+data.id, function (event) {
                    if (!data.is_opened) {
                        return;
                    }
                    
                    var expression = data.$evaluateExpression_window_box_header_expression_input_rI.val();
                    
                    var keycode = event.keyCode ? event.keyCode : event.which;
                    if (keycode == 27) {
                        data.close();
                    } else if (keycode == 13) {
                        data.refresh({expression});
                    }
                });
                
                $evaluateExpression.on('mousedown.EvaluateExpression-' + data.id, function (event) {
                    data.focus();
                });
                
                data.$evaluateExpression_window_closeBtn.on('mousedown.EvaluateExpression-' + data.id, function (event) {
                    data.close();
                });

                $(document).on('mousedown.EvaluateExpression-'+data.id, function (event) {
                    if ($evaluateExpression.is(event.target) || $evaluateExpression.has(event.target).length) {
                        return;
                    }
                    
                    data.blur();
                });
                
                data.$evaluateExpression_window_box_content.on('resize.EvaluateExpression-' + data.id, function (event) {
                    data.variablePopup_variablesExplorer.setMaxHeight({max_height: file.$variablePopup.height()});
                });

                data.$evaluateExpression_variablesExplorer.on('VariablesExplorer_item_toggle.EvaluateExpression', function (event, parameters) {
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
                        data.$evaluateExpression_noValue.show();
                        data.$evaluateExpression_value.hide();
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
                                data.$evaluateExpression_variablesExplorer.data().VariablesExplorer.load({variables: [result_json.variable]});
                                data.$evaluateExpression_variablesExplorer.data().VariablesExplorer.render();

                                data.$evaluateExpression_noValue.hide();
                                data.$evaluateExpression_value.show();
                            } else {
                                data.$evaluateExpression_noValue.show();
                                data.$evaluateExpression_value.hide();
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
                    $evaluateExpression.data().Movable.focus();
                    
                    var x = (window.innerWidth / 2) - ($evaluateExpression.outerWidth()/2);
                    var y = (window.innerHeight / 2) - ($evaluateExpression.outerHeight()/2);

                    x = x + (5 + parseInt(Math.random()*20)) * (Math.random() >= 0.5 ? 1: -1);
                    y = y + (5 + parseInt(Math.random()*20)) * (Math.random() >= 0.5 ? 1: -1);
                    
                    $evaluateExpression.css('transform', 'translate('+x+'px, '+y+'px)');
                    
                    $evaluateExpression.fadeIn(data.animation_duration, function (event) {
                        data.$evaluateExpression_window_box_header_expression_input_rI.focus();
                        
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
                    $evaluateExpression.data().Movable.blur();
                    
                    $evaluateExpression.fadeOut(data.animation_duration, function (event) {
                        if (parameters.onClosed) {
                            parameters.onClosed();
                        }
                        $evaluateExpression.trigger('EvaluateExpression_closed');
                    });
                };

                data.focus = function (parameters) {
                    $evaluateExpression.addClass('EvaluateExpression__focused');
                };
                
                data.blur = function (parameters) {
                    $evaluateExpression.removeClass('EvaluateExpression__focused');
                };
                
                data.setSize = function (parameters) {
                    data.$evaluateExpression_window_box_content.width(parameters.width);
                    data.$evaluateExpression_window_box_content.height(parameters.height);
                };

                data.toggle = function (parameters) {
                    data[data.is_opened ? 'close': 'open']();
                };

                $evaluateExpression.on('EvaluateExpression_initialize.EvaluateExpression-' + data.id, function (event) {
                    data.init();
                });

                $evaluateExpression.on('EvaluateExpression_comply.EvaluateExpression-' + data.id, function (event) {
                    data.comply();
                });

                data.init = function () {
                    $evaluateExpression.Movable();
                };

                data.comply = function () {
                };

                data.init();
            });
        }
    };

    $.fn.EvaluateExpression = function(method) {
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method '+method+' does not exist on jQuery.EvaluateExpression');
        }
    };
})(jQuery);