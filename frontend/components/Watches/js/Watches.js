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
 * GDBFrontend Watches Component
 * Watches has its own watches independed from GDB that is evulated and parsed by GDBFrontend.
 */

(function($) {
    var methods = {};

    methods.init = function (parameters) {
        var t_init = this;
        var $elements = $(this);

        if (typeof parameters == 'undefined') {
            parameters = {};
        }

        t_init.parameters = parameters;

        $elements.each(function () {
            var $watches = $(this);

            $watches.off('.Watches');
            $watches.find('*').off('.Watches');

            var data = {};
            $watches.data('Watches', data);
            data.$watches = $watches;

            data.$watches_noItems = $watches.find('.Watches_noItems');
            data.$watches_items = $watches.find('.Watches_items');
            data.$watches_items_item__proto = data.$watches_items.find('.Watches_items_item.__proto');

            data.animation_duration = 100;

            data.is_passive = false;
            data.watches = [];
            data.id_i = 1;
            data.adder = false;

            data.add = function (parameters) {
                if (parameters === undefined) {
                    parameters = {};
                }

                var $item = data.$watches_items_item__proto.clone();
                $item.removeClass('__proto');
                $item[parameters.prepend ? 'prependTo': 'appendTo'](data.$watches_items);

                var watch = {};
                data.watches.push(watch);
                watch.id = parameters.id ? data.id_i++: data.id_i++;
                watch.is_adder = parameters.is_adder ? true: false;
                watch.expression = parameters.expression;
                watch.value = parameters.value;
                watch.$item = $item;
                watch.$item_remove = $item.find('.Watches_items_item_remove');
                watch.$item_expression = $item.find('.Watches_items_item_expression');
                watch.$item_expression_input = watch.$item_expression.find('.Watches_items_item_expression_input');
                watch.$item_expression_input_rI = watch.$item_expression_input.find('.Watches_items_item_expression_input_rI');
                watch.$item_value = $item.find('.Watches_items_item_value');
                watch.$item_value_input = watch.$item_value.find('.Watches_items_item_value_input');
                watch.$item_value_input_rI = watch.$item_value_input.find('.Watches_items_item_value_input_rI');

                if (parameters.is_adder) {
                    data.adder = watch;
                    $item.addClass('Watches_items_item__adder');
                }

                watch.$item_expression_input_rI.val(parameters.expression);
                watch.$item_value_input_rI.val(parameters.value);

                var save_state_timeout = 0;

                watch.$item_expression_input_rI.on('change.Watches, cut.Watches, paste.Watches, drop.Watches, keyup.Watches, focus.Watches', function (event) {
                    clearTimeout(save_state_timeout);

                    var expression = watch.$item_expression_input_rI.val();

                    watch.expression = expression;

                    if (expression.length && watch.is_adder) {
                        watch.is_adder = false;
                        $item.removeClass('Watches_items_item__adder');
                        data.add({is_adder: true});
                    } else if (!expression.length) {
                        watch.remove();
                        if (watch.id != data.adder.id) {
                            data.adder.$item_expression_input_rI.focus();
                        }
                    }

                    save_state_timeout = setTimeout(data.saveState, 1000);
                });

                watch.$item_remove.on('click.Watches', function (event) {
                    watch.remove();
                });

                watch.setExpression = function (parameters) {
                    watch.expression = parameters.expression;
                    watch.$item_expression_input_rI.val(parameters.expression);
                };

                watch.setValue = function (parameters) {
                    watch.value = parameters.value;
                    watch.$item_value_input_rI.val(parameters.value);
                };

                watch.remove = function (parameters) {
                    if (watch.is_adder) {
                        return;
                    }

                    data.watches.every(function (_watch, _watch_i) {
                        if (watch.id == _watch.id) {
                            _watch.$item.remove();
                            data.watches.splice(_watch_i, 1);
                            return false;
                        }

                        return true;
                    });

                    data.saveState();
                };

                if (!watch.is_adder && !parameters.is_preload) {
                    data.saveState();
                }
            };

            data.kvKey = function (key) {
                return 'GDBFrontend:Watches:'+key;
            };

            data.saveState = function (parameters) {
                if (parameters === undefined) {
                    parameters = {};
                }

                var state = {
                    id_i: data.id_i,
                    watches: []
                };

                data.watches.every(function (_watch, _watch_i) {
                    if (_watch.is_adder) {
                        return true;
                    }

                    state.watches.push({
                        id: _watch.id,
                        expression: _watch.expression,
                        value: _watch.value
                    });

                    return true;
                });

                localStorage.setItem(data.kvKey('state'), JSON.stringify(state));
            };

            data.getState = function () {
                var state = localStorage.getItem(data.kvKey('state'));

                if (!state) {
                    state = {
                        id_i: 1,
                        watches: []
                    };
                } else {
                    state = JSON.parse(state);
                }

                return {
                    state: state
                };
            };

            data.getWatchByExpression = function (parameters) {
                var watch = false;

                data.watches.every(function (_watch, _watch_i) {
                    if (_watch.expression == parameters.expression) {
                        watch = _watch;
                        return false;
                    }

                    return true;
                });
            };

            $watches.on('Watches_initialize.Watches', function (event) {
                data.init();
            });

            $watches.on('Watches_comply.Watches', function (event) {
                data.comply();
            });

            data.init = function () {
                var state = data.getState().state;

                data.id_i = state.id_i;

                state.watches.every(function (_watch, _watch_i) {
                    data.add({
                        is_preload: true,
                        id: _watch.id,
                        expression: _watch.expression
                    });

                    return true;
                });

                data.add({is_adder: true});
                data.comply();
            };

            data.comply = function () {
            };

            data.init();
        });
    }

    $.fn.Watches = function(method) {
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method '+method+' does not exist on jQuery.Watches');
        }
    };
})(jQuery);