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
 * GDBFrontend Variable Explorer
 * This componant accepts state.variables format.
 *
 * Example:
 * variablesExplorer.load(state.variables);
 * variablesExplorer.render();
 *
 * Loading members of item:
 * item.load(members);
 * item.render();
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
            var $variablesExplorer = $(this);

            $variablesExplorer.off('.VariablesExplorer');
            $variablesExplorer.find('*').off('.VariablesExplorer');

            var data = {};
            $variablesExplorer.data('VariablesExplorer', data);
            data.$variablesExplorer = $variablesExplorer;

            data.$variablesExplorer_content = $variablesExplorer.find('.VariablesExplorer_content');
            data.$variablesExplorer_items = $variablesExplorer.find('.VariablesExplorer_items');
            data.$VariablesExplorer_items_item__proto = data.$variablesExplorer_items.find('.VariablesExplorer_items_item.__proto');

            data.animation_duration = 100;

            data.is_passive = false;
            data.items = [];
            data.location = false;
            data.currents = {};
            data.modifieds = {};
            data.scroll = {x: 0, y: 0};

            data.setLocation = function (location) {
                data.location = location;
            };

            data.clear = function () {
                data.items = [];
                data.location = false;
                data.currents = {};
                data.modifieds = {};
            };

            data.load = function (parameters) {
                if (parameters.parent === undefined) {
                    data.items = [];
                } else {
                    parameters.parent.items = [];
                }

                var members = (parameters.variables ? parameters.variables: parameters.members)

                if (!members) {
                    if (parameters.parent !== undefined) {
                        parameters.parent.is_empty = true;
                    }

                    parameters.parent.close();
                    return false;
                } else {
                    if (parameters.parent !== undefined) {
                        parameters.parent.is_empty = false;
                    }
                }
                
                members.forEach(function (variable, variable_i) {
                    var item = {};
                    item.parent = parameters.parent ? parameters.parent: false;
                    item.variable = variable;
                    item.items = [];

                    item.expression = [];

                    item.resolveTree = function () {
                        var tree = [];

                        var _add = function (_item) {
                            item.expression.push(_item.variable.name);
                            tree.push(_item);

                            if (_item.parent) {
                                _add(_item.parent);
                            }
                        };

                        _add(item);

                        tree.reverse();

                        return tree;
                    };

                    item.tree = item.resolveTree();

                    item.expression.reverse();
                    item.expression = item.expression.join(".");

                    if (parameters.parent === undefined) {
                        data.items.push(item);
                    } else {
                        parameters.parent.items.push(item);
                    }
                });
            };

            data.render = function (parameters) {
                if (parameters === undefined) {
                    parameters = {};
                }

                (parameters.item ? parameters.item.$item_openable_items: data.$variablesExplorer_items)
                .find('.VariablesExplorer_items_item:not(.__proto)').remove();

                var is_there_ptr = false;

                (parameters.item ? parameters.item.items: data.items)
                .forEach(function (item, item_i) {
                    (parameters.item ? parameters.item: data)
                    .add({
                        item: item
                    });
                });

                if (!is_there_ptr) {
                    (parameters.item ? parameters.item.$item_openable_items: data.$variablesExplorer_items)
                    .find('.VariablesExplorer_items_item_button:not(.__proto)  .VariablesExplorer_items_item_button_isNotPointer').hide();
                }

                data.$variablesExplorer_content.scrollLeft(data.scroll.x);
                data.$variablesExplorer_content.scrollTop(data.scroll.y);
            };

            data.add = function (parameters) {
                var item = parameters.item;

                var $items;

                if (parameters.$items === undefined) {
                    $items = data.$variablesExplorer_items;
                } else {
                    $items = parameters.$items;
                }

                var $item = data.$VariablesExplorer_items_item__proto.clone();
                $item.removeClass('__proto');
                $item.appendTo($items);

                item.is_empty = true;
                item.is_opened = false;
                item.is_loading = false;

                item.resolveNonPointer = function () {
                    var type = false;
                    var tree_length = 0;

                    item.variable.type_tree.every(function (_type, _type_i) {
                        if (!_type.is_pointer) {
                            type = _type;
                            return false;
                        }

                        tree_length++;

                        return true;
                    });

                    return type ? {
                        type: type,
                        tree_length: tree_length
                    }: false;
                };

                if (item.variable.is_pointer) {
                    item.non_ptr = item.resolveNonPointer();
                } else {
                    item.non_ptr = item.variable.type;
                }

                item.$item = $item;
                item.$item_button = $item.find('.VariablesExplorer_items_item_button');
                item.$item_openable = $item.find('.VariablesExplorer_items_item_openable');
                item.$item_openable_loading = $item.find('.VariablesExplorer_items_item_openable_loading');
                item.$item_openable_items = $item.find('.VariablesExplorer_items_item_openable_items');
                item.$item_button_openBtn = $item.find('.VariablesExplorer_items_item_button_openBtn');
                item.$item_button_items = $item.find('.VariablesExplorer_items_item_button_items');
                item.$item_button_isPointer = $item.find('.VariablesExplorer_items_item_button_isPointer');
                item.$item_button_preType = $item.find('.VariablesExplorer_items_item_button_preType');
                item.$item_button_isNotPointer = $item.find('.VariablesExplorer_items_item_button_isNotPointer');
                item.$item_button_type = $item.find('.VariablesExplorer_items_item_button_type');
                item.$item_button_name = $item.find('.VariablesExplorer_items_item_button_name');
                item.$item_button_value = $item.find('.VariablesExplorer_items_item_button_value');

                if (item.variable.is_pointer) {
                    item.$item_button_isPointer.show();
                    item.$item_button_isNotPointer.hide();
                    is_there_ptr = true;
                } else {
                    item.$item_button_isPointer.hide();
                    item.$item_button_isNotPointer.show();
                }

                item.$item_button_name.html(item.variable.name);
                item.$item_button_value.html(item.variable.value);

                if (item.variable.type.terminal.code == $.fn.VariablesExplorer.TYPE_CODE_STRUCT) {
                    item.$item_button_preType.html('struct');
                    item.$item_button_isNotPointer.hide();
                } else if (item.variable.type.terminal.code == $.fn.VariablesExplorer.TYPE_CODE_UNION) {
                    item.$item_button_preType.html('union');
                    item.$item_button_isNotPointer.hide();
                } else {
                    item.$item_button_preType.hide();
                }

                if (item.variable.type.name) {
                    item.$item_button_type.html(item.variable.type.name);
                } else if (item.variable.is_pointer && (item.variable.type_tree.length > 1)) {
                    item.$item_button_type.html(
                        item.non_ptr.type.name
                        +
                        '*'.repeat(item.non_ptr.tree_length)
                    );
                } else {
                    item.$item_button_type.hide();
                }

                if (
                    (data.currents[item.expression] != item.variable.value)
                    ||
                    (
                        data.modifieds[item.expression]
                        &&
                        (data.modifieds[item.expression].file == data.location.file)
                        &&
                        (data.modifieds[item.expression].line == data.location.line)
                    )
                ) {
                    item.$item.addClass('VariablesExplorer__changed');
                    data.modifieds[item.expression] = {file: data.location.file, line: data.location.line};
                }

                if (
                    (data.currents[item.expression] == item.variable.value)
                    &&
                    !(
                        data.modifieds[item.expression]
                        &&
                        (data.modifieds[item.expression].file == data.location.file)
                        &&
                        (data.modifieds[item.expression].line == data.location.line)
                    )
                ) {
                    delete data.modifieds[item.expression];
                }

                data.currents[item.expression] = item.variable.value;

                item.setLoading = function (is_loading) {
                    item.is_loading = is_loading;

                    if (is_loading) {
                        item.$item_openable_loading.show();
                    } else {
                        item.$item_openable_loading.hide();

                        data.$variablesExplorer_content.scrollLeft(data.scroll.x);
                        data.$variablesExplorer_content.scrollTop(data.scroll.y);
                    }
                };

                item.open = function (parameters) {
                    if (item.is_empty) {
                        if (!parameters.is_preload) {
                            GDBFrontend.showMessageBox({text: "Structure or union is not initialized yet."});
                        }
                        return false;
                    }

                    item.is_opened = true;
                    item.$item_openable.show();

                    item.saveState({
                        is_opened: true
                    });
                };

                item.close = function (parameters) {
                    item.is_opened = false;
                    item.$item_openable.hide();

                    item.saveState();
                };

                item.toggle = function (parameters) {
                    item[item.is_opened ? 'close': 'close']();
                };

                item.render = function (parameters) {
                    data.render({
                        item: item
                    });
                };

                item.load = function (parameters) {
                    data.load({
                        members: parameters.members,
                        parent: item
                    });
                };

                item.add = function (parameters) {
                    data.add({
                        item: parameters.item,
                        $items: item.$item_openable_items
                    });
                };

                item.kvKey = function (key) {
                    var tree = [];

                    item.tree.forEach(function (_item, _item_i) {
                        tree.push(_item.variable.name);
                    });

                    tree = tree.join(":");

                    return $.fn.VariablesExplorer.kvKey('item:'+tree+':'+key);
                };

                item.saveState = function (parameters) {
                    if (parameters === undefined) {
                        parameters = {};
                    }

                    var state = {
                        is_opened: (parameters.is_opened !== undefined) ? parameters.is_opened: item.is_opened
                    };

                    localStorage.setItem(item.kvKey('state'), JSON.stringify(state));
                };

                item.getState = function () {
                    var state = localStorage.getItem(item.kvKey('state'));

                    if (!state) {
                        state = {
                            is_opened: false
                        };
                    } else {
                        state = JSON.parse(state);
                    }

                    return {
                        state: state
                    };
                };

                item.expand = function (parameters) {
                    if (parameters === undefined) {
                        parameters = {};
                    }

                    if (
                        (item.variable.type.terminal.code != $.fn.VariablesExplorer.TYPE_CODE_STRUCT)
                        &&
                        (item.variable.type.terminal.code != $.fn.VariablesExplorer.TYPE_CODE_UNION)
                    ) {
                        return;
                    }

                    $variablesExplorer.trigger('VariablesExplorer_item_toggle', {
                        item: item,
                        is_preload: parameters.is_preload ? true: false
                    });
                };

                item.$item_button.on('click.VariablesExplorer', function (event) {
                    item.expand();
                });

                if (
                    (item.variable.type.terminal.code == $.fn.VariablesExplorer.TYPE_CODE_STRUCT)
                    ||
                    (item.variable.type.terminal.code == $.fn.VariablesExplorer.TYPE_CODE_UNION)
                ) {
                    var state = item.getState().state;

                    if (state.is_opened) {
                        item.expand({
                            is_preload: true
                        });
                    }
                }
            };

            data.$variablesExplorer_content.on('mousewheel.VariablesExplorer', function (event) {
                setTimeout(function () {
                    var scroll_x = data.$variablesExplorer_content.scrollLeft();
                    var scroll_y = data.$variablesExplorer_content.scrollTop();

                    data.scroll.x = scroll_x;
                    data.scroll.y = scroll_y;
                }, 500);
            });

            $variablesExplorer.on('VariablesExplorer_initialize.VariablesExplorer', function (event) {
                data.init();
            });

            $variablesExplorer.on('VariablesExplorer_comply.VariablesExplorer', function (event) {
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

    $.fn.VariablesExplorer = function(method) {
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method '+method+' does not exist on jQuery.VariablesExplorer');
        }
    };

    $.fn.VariablesExplorer.kvKey = function (key) {
        return 'VariablesExplorer:'+key;
    };

    $.fn.VariablesExplorer.TYPE_CODE_STRUCT = 3;
    $.fn.VariablesExplorer.TYPE_CODE_UNION = 4;
    $.fn.VariablesExplorer.TYPE_CODE_FUNC = 7;
    $.fn.VariablesExplorer.TYPE_CODE_CHAR = 20;
})(jQuery);