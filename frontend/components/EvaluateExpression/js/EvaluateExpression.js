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
            var $evaluateExpression = $(this);
            
            $evaluateExpression.off('.EvaluateExpression');
            $evaluateExpression.find('*').off('.EvaluateExpression');

            var current_data = $evaluateExpression.data('EvaluateExpression');
            
            if (current_data) {
                $(window).off('EvaluateExpression-' + current_data.id);
                $(document).off('EvaluateExpression-' + current_data.id);
                $('html, body').off('EvaluateExpression-' + current_data.id)
            }
            
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
            
            data.$evaluateExpression_window_box_header_btn__signalEnabled = data.$evaluateExpression_window.find('.EvaluateExpression_window_box_header_btn__signalEnabled');
            data.$evaluateExpression_window_box_header_btn__slotEnabled = data.$evaluateExpression_window.find('.EvaluateExpression_window_box_header_btn__slotEnabled');

            data.$evaluateExpression_window_mover = data.$evaluateExpression_window.find('.EvaluateExpression_window_mover');

            data.$evaluateExpression_items = $evaluateExpression.find('.EvaluateExpression_items');
            data.$evaluateExpression_items_item__proto = $evaluateExpression.find('.EvaluateExpression_items_item.__proto');
            data.$evaluateExpression_items_parentBtn = $evaluateExpression.find('.EvaluateExpression_items_parentBtn');
            
            data.$evaluateExpression_window_box_content = $evaluateExpression.find('.EvaluateExpression_window_box_content');

            data.$evaluateExpression_value = $evaluateExpression.find('.EvaluateExpression_value');
            data.$evaluateExpression_noValue = $evaluateExpression.find('.EvaluateExpression_noValue');

            data.$evaluateExpression_variablesExplorerComp = data.$evaluateExpression.find('.EvaluateExpression_variablesExplorerComp');
            data.$evaluateExpression_variablesExplorer = data.$evaluateExpression_variablesExplorerComp.find('> .VariablesExplorer');
            data.$evaluateExpression_variablesExplorer.VariablesExplorer({id: 'evaluateExpression_variablesExplorer'});
            data.evaluateExpression_variablesExplorer = data.$evaluateExpression_variablesExplorer.data().VariablesExplorer;
            data.components.variablesExplorer = data.evaluateExpression_variablesExplorer;
            
            data.components.variablesExplorer.is_signal_pointings = false;
            data.components.variablesExplorer.is_slot_pointings = false;
            data.components.variablesExplorer.is_mark_changes = false;
            data.components.variablesExplorer.is_mark_changes = false;
            data.components.variablesExplorer.setFluent(true);

            data.animation_duration = 100;

            data.is_passive = false;
            data.is_opened = false;

            data.$pointingPlaceholder = t_init.parameters.$pointingPlaceholder ? t_init.parameters.$pointingPlaceholder: false;

            var resize_timeout = 0;
            
            data.resizeObserver = new ResizeObserver(function (entries) {
                var entry = entries[0];
                var content = entry.target;

                data.complyBounds();

                clearTimeout(resize_timeout);

                resize_timeout = setTimeout(function () {
                    data.components.variablesExplorer.signalPointings();
                    data.components.variablesExplorer.slotPointings();
                    data.components.variablesExplorer.signalOthers();
                }, 250);
            });

            data.resizeObserver.observe(data.$evaluateExpression_window_box_content[0]);
        
            data.setPointingPlaceholder = function ($ph) {
                data.$pointingPlaceholder = $ph;
                data.components.variablesExplorer.setPointingPlaceholder(data.$pointingPlaceholder);
            };
            
            data.complyBounds = function () {
                var bounds = {};
                
                var x = data.$evaluateExpression_window_box_content.offset().left;
                var y = data.$evaluateExpression_window_box_content.offset().top;
                var w = data.$evaluateExpression_window_box_content.innerWidth();
                var h = data.$evaluateExpression_window_box_content.innerHeight();
                
                bounds.left = x;
                bounds.top = y;
                bounds.right = x + w;
                bounds.bottom = y + h;
                
                data.components.variablesExplorer.setSignalBounds({bounds});
            };

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

            data.$evaluateExpression_variablesExplorer.on('VariablesExplorer_item_toggle.EvaluateExpression-' + data.id, function (event, parameters) {
                if (parameters.item.is_loading) {
                    return;
                }
                
                if (parameters.item.is_opened) {
                    parameters.item.close();
                    return;
                }

                parameters.item.setLoading(true);

                var tree = [];

                parameters.item.tree.forEach(function (_member, _member_i) {
                    tree.push(_member.variable.expression ? _member.variable.expression: _member.variable.name);
                });

                var qs = {
                    variable: parameters.item.variable.expression
                };

                if (!qs.variable && (tree.length > 1)) {
                    qs['expression'] = tree.join('.');
                }

                if (
                    parameters.item.parent
                    &&
                    (
                        (parameters.item.variable.type.code == $.fn.VariablesExplorer.TYPE_CODE_STRUCT)
                        ||
                        (parameters.item.variable.type.code == $.fn.VariablesExplorer.TYPE_CODE_UNION))
                ) {
                    qs.expression = '('+parameters.item.variable.type.name+')'+qs.expression;
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

                        parameters.item.setLoading(false);
                        parameters.item.render();
                        parameters.item.open({is_preload: parameters.is_preload});
                    },
                    error: function () {
                        GDBFrontend.showMessageBox({text: 'An error occured.'});
                        console.trace('An error occured.');

                        parameters.item.setLoading(false);
                    }
                });
            });

            data.refresh = function (parameters) {
                if (data.components.variablesExplorer.is_loading) {
                    return;
                }

                data.components.variablesExplorer.setLoading(true);
                data.components.variablesExplorer.clear();

                if (!parameters.expression) {
                    data.$evaluateExpression_noValue.show();
                    data.$evaluateExpression_value.hide();

                    data.components.variablesExplorer.setLoading(false);
                    
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
                        data.components.variablesExplorer.setLoading(false);
                        
                        if (!result_json.ok) {
                            GDBFrontend.showMessageBox({text: 'An error occured.'});
                            console.trace('An error occured.');
                            return;
                        }

                        if (result_json.variable) {
                            data.$evaluateExpression_noValue.hide();
                            data.$evaluateExpression_value.show();

                            data.$evaluateExpression_variablesExplorer.data().VariablesExplorer.load({variables: [result_json.variable]});
                            data.$evaluateExpression_variablesExplorer.data().VariablesExplorer.render();
                        } else {
                            data.$evaluateExpression_noValue.show();
                            data.$evaluateExpression_value.hide();
                        }
                    },
                    error: function () {
                        data.components.variablesExplorer.setLoading(false);
                        
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
                    data.components.variablesExplorer.is_signal_pointings = true;
                    data.components.variablesExplorer.is_slot_pointings = true;
                    
                    data.complyBounds();
                    
                    data.components.variablesExplorer.signalPointings();
                    data.components.variablesExplorer.slotPointings();
                    
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

                data.components.variablesExplorer.is_signal_pointings = false;
                data.components.variablesExplorer.is_slot_pointings = false;

                data.components.variablesExplorer.clear();
            };

            data.focus = function (parameters) {
                $evaluateExpression.addClass('EvaluateExpression__focused');
            };
            
            data.blur = function (parameters) {
                $evaluateExpression.removeClass('EvaluateExpression__focused');
            };
            
            data.evaluate = function (parameters) {
                data.$evaluateExpression_window_box_header_expression_input_rI.val(parameters.expression);
                data.refresh({expression: parameters.expression});
            };
            
            data.setSize = function (parameters) {
                data.$evaluateExpression_window_box_content.width(parameters.width);
                data.$evaluateExpression_window_box_content.height(parameters.height);
            };

            data.toggle = function (parameters) {
                data[data.is_opened ? 'close': 'open']();
            };

            var move_timeout = 0;
            
            $evaluateExpression.on('Movable_move.EvaluateExpression-' + data.id, function (event) {
                clearTimeout(move_timeout);

                data.complyBounds();
                
                move_timeout = setTimeout(function () {
                    data.components.variablesExplorer.signalPointings();
                    data.components.variablesExplorer.slotPointings();
                }, 16);
            });

            data.$evaluateExpression_variablesExplorer.on('VariablesExplorer_rendered.EvaluateExpression-' + data.id, function (event, parameters) {
                data.components.variablesExplorer.iterateItems({iterate: function (iteration) {
                    iteration.item.$item_pointingsSVG.css('z-index', parseInt($evaluateExpression.css('z-index'))+1);
                    iteration.item.pointing_slots.forEach(function (_slot, _slot_i) {
                        _slot.item.$item_pointingsSVG.css('z-index', parseInt($evaluateExpression.css('z-index'))+1);
                    });
                }});
            });
            
            $evaluateExpression.on('Movable_focused.EvaluateExpression-' + data.id, function (event, parameters) {
                data.components.variablesExplorer.iterateItems({iterate: function (iteration) {
                    iteration.item.$item_pointingsSVG.css('z-index', parameters.zIndex+1);
                    iteration.item.pointing_slots.forEach(function (_slot, _slot_i) {
                        _slot.item.$item_pointingsSVG.css('z-index', parameters.zIndex+1);
                    });
                }});
            });
            
            data.$evaluateExpression_variablesExplorer.on('VariablesExplorer_item_opened.EvaluateExpression-' + data.id, function (event, parameters) {
                data.components.variablesExplorer.iterateItems({iterate: function (iteration) {
                    iteration.item.$item_pointingsSVG.css('z-index', parseInt($evaluateExpression.css('z-index'))+1);
                    iteration.item.pointing_slots.forEach(function (_slot, _slot_i) {
                        _slot.item.$item_pointingsSVG.css('z-index', parseInt($evaluateExpression.css('z-index'))+1);
                    });
                }});
            });
            
            var scroll_timeout = 0;
            
            data.$evaluateExpression_window_box_content.on('scroll.EvaluateExpression-' + data.id, function (event) {
                clearTimeout(scroll_timeout);

                scroll_timeout = setTimeout(function () {
                    data.components.variablesExplorer.signalPointings();
                    data.components.variablesExplorer.slotPointings();
                    data.components.variablesExplorer.signalOthers();
                }, 250);
            });

            data.$evaluateExpression_window_box_header_btn__signalEnabled.on('click.EvaluateExpression-' + data.id, function (event) {
                data.$evaluateExpression_window_box_header_btn__signalEnabled[
                    (
                        data.components.variablesExplorer.is_signal_pointings
                        = !data.components.variablesExplorer.is_signal_pointings
                    )
                    ? 'addClass'
                    : 'removeClass'
                ]('EvaluateExpression__checked');

                data.components.variablesExplorer.clearPointingSignals();
                data.components.variablesExplorer.clearPointingSlots();
                data.components.variablesExplorer.signalPointings();
                data.components.variablesExplorer.slotPointings();
                data.components.variablesExplorer.signalOthers();
            });
            
            data.$evaluateExpression_window_box_header_btn__slotEnabled.on('click.EvaluateExpression-' + data.id, function (event) {
                data.$evaluateExpression_window_box_header_btn__slotEnabled[
                    (
                        data.components.variablesExplorer.is_slot_pointings
                        = !data.components.variablesExplorer.is_slot_pointings
                    )
                    ? 'addClass'
                    : 'removeClass'
                ]('EvaluateExpression__checked');

                data.components.variablesExplorer.clearPointingSignals();
                data.components.variablesExplorer.clearPointingSlots();
                data.components.variablesExplorer.signalPointings();
                data.components.variablesExplorer.slotPointings();
                data.components.variablesExplorer.signalOthers();
            });
            
            $evaluateExpression.on('EvaluateExpression_initialize.EvaluateExpression-' + data.id, function (event) {
                data.init();
            });

            $evaluateExpression.on('EvaluateExpression_comply.EvaluateExpression-' + data.id, function (event) {
                data.comply();
            });

            data.init = function () {
                $evaluateExpression.Movable();

                data.$evaluateExpression_window_box_header_btn__signalEnabled[
                    (
                        data.components.variablesExplorer.is_signal_pointings
                        = !data.components.variablesExplorer.is_signal_pointings
                    )
                    ? 'addClass'
                    : 'removeClass'
                ]('EvaluateExpression__checked');
                
                data.$evaluateExpression_window_box_header_btn__slotEnabled[
                    (
                        data.components.variablesExplorer.is_slot_pointings
                        = !data.components.variablesExplorer.is_slot_pointings
                    )
                    ? 'addClass'
                    : 'removeClass'
                ]('EvaluateExpression__checked');
            };

            data.comply = function () {
            };

            data.init();
        });
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