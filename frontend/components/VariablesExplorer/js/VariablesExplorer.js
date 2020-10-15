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

            var current_data = $variablesExplorer.data('VariablesExplorer');
            
            if (current_data) {
                $(window).off('VariablesExplorer-' + current_data.id);
                $(document).off('VariablesExplorer-' + current_data.id);
                $('html, body').off('VariablesExplorer-' + current_data.id)
            }
            
            var data = {};
            $variablesExplorer.data('VariablesExplorer', data);
            data.$variablesExplorer = $variablesExplorer;

            data.id = t_init.parameters.id ? t_init.parameters.id: ++$.fn.VariablesExplorer.id_i;

            data.$variablesExplorer_content = $variablesExplorer.find('.VariablesExplorer_content');
            data.$variablesExplorer_items = $variablesExplorer.find('.VariablesExplorer_items');
            data.$VariablesExplorer_items_item__proto = data.$variablesExplorer_items.find('.VariablesExplorer_items_item.__proto');

            data.animation_duration = 100;

            data.is_loading = false;
            data.is_passive = false;
            data.items = [];
            data.location = false;
            data.currents = {};
            data.modifieds = {};
            data.scroll = {x: 0, y: 0};
            data.is_mark_changes = true;
            data.is_fluent = false;
            data.is_signal_pointings = false;
            data.is_slot_pointings = false;
            data.is_linked_list_visualizer
            data.is_linked_list_visualizer_enabled = true;

            data.$pointingPlaceholder = t_init.parameters.$pointingPlaceholder ? t_init.parameters.$pointingPlaceholder: false;

            data.signal_bounds = {};
            data.signal_bounds.top = false;
            data.signal_bounds.right = false;
            data.signal_bounds.bottom = false;
            data.signal_bounds.left = false;

            data.setLinkedListVisualizerEnabled = function (is_enabled) {
                data.is_linked_list_visualizer_enabled = is_enabled;
            };
            
            data.setSignalBounds = function (parameters) {
                Object.assign(data.signal_bounds, parameters.bounds);
            };
            
            data.setLoading = function (is_loading) {
                data.is_loading = is_loading;
            };
            
            data.setPointingPlaceholder = function ($ph) {
                data.$pointingPlaceholder = $ph;
            };
            
            data.setFluent = function (is_fluent) {
                data.is_fluent = is_fluent;

                if (data.is_fluent) {
                    $variablesExplorer.addClass('VariablesExplorer__fluent');
                } else {
                    $variablesExplorer.removeClass('VariablesExplorer__fluent');
                }
            };
            
            data.setLocation = function (location) {
                data.location = location;
            };

            data.clear = function () {
                data.iterateItems({iterate: function (iteration) {
                    iteration.item.$item_pointingsSVG.remove();
                    iteration.item.clearPointingSignals();
                    iteration.item.clearPointingSlots();
                }});
                
                data.$variablesExplorer_items.find('.VariablesExplorer_items_item:not(.__proto)').remove();
                
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
                
                members.every(function (variable, variable_i) {
                    var item = {};
                    
                    if (!window.VariablesExplorer_items_item_i) {
                        VariablesExplorer_items_item_i = 1;
                    }

                    item.id = VariablesExplorer_items_item_i++;
                    
                    item.parent = parameters.parent ? parameters.parent: false;
                    item.variable = variable;
                    item.items = [];
                    
                    item.pointing_signals = [];
                    item.pointing_slots = [];

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

                    return true;
                });
            };

            data.iterateItems = function (cb) {
                var _iterate = function (_item, _level) {
                    cb(_item, _level);

                    _item.items.every(function (_subitem, _subitem_i) {
                        _iterate(_subitem, _level+1);
                        return true;
                    });
                };

                _item.items.every(function (_item, _item_i) {
                    _iterate(_item, 0);
                    return true;
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
                .every(function (item, item_i) {
                    (parameters.item ? parameters.item: data)
                    .add({
                        item: item
                    });

                    return true;
                });

                if (!is_there_ptr) {
                    (parameters.item ? parameters.item.$item_openable_items: data.$variablesExplorer_items)
                    .find('.VariablesExplorer_items_item_button:not(.__proto)  .VariablesExplorer_items_item_button_isNotPointer').hide();
                }

                data.$variablesExplorer_content.scrollLeft(data.scroll.x);
                data.$variablesExplorer_content.scrollTop(data.scroll.y);

                if (!parameters.item) {
                    data.signalPointings();
                    data.signalOthers();
                }

                $variablesExplorer.trigger('VariablesExplorer_rendered', {
                    item: parameters.item
                });

                data.$variablesExplorer_content.scrollLeft(data.scroll.x);
                data.$variablesExplorer_content.scrollTop(data.scroll.y);
            };

            data.setMaxHeight = function (parameters) {
                data.$variablesExplorer_content.css('max-height', parameters.max_height);
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

                item.is_linked_list_visualizer_opened = false;

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
                item.$item_button_menuBtn = $item.find('.VariablesExplorer_items_item_button_menuBtn');
                item.$item_button_openBtn = $item.find('.VariablesExplorer_items_item_button_openBtn');
                item.$item_button_items = $item.find('.VariablesExplorer_items_item_button_items');
                item.$item_button_isPointer = $item.find('.VariablesExplorer_items_item_button_isPointer');
                item.$item_button_preType = $item.find('.VariablesExplorer_items_item_button_preType');
                item.$item_button_isNotPointer = $item.find('.VariablesExplorer_items_item_button_isNotPointer');
                item.$item_button_type = $item.find('.VariablesExplorer_items_item_button_type');
                item.$item_button_name = $item.find('.VariablesExplorer_items_item_button_name');
                item.$item_button_value = $item.find('.VariablesExplorer_items_item_button_value');
                item.$item_pointingsSVG = $item.find('.VariablesExplorer_items_item_pointingsSVG');
                item.$item_pointingsSVG_path__proto = item.$item_pointingsSVG.find('.VariablesExplorer_items_item_pointingsSVG_path.__proto');

                item.$item_llVis = item.$item.find('.VariablesExplorer_items_item_llVis');
                item.$item_llVis_linkedListVisualizerComp = item.$item_llVis.find('.VariablesExplorer_items_item_llVis_linkedListVisualizerComp');
                item.$item_llVis_linkedListVisualizer = item.$item_llVis_linkedListVisualizerComp.find('> .LinkedListVisualizer');
                item.item_llVis_linkedListVisualizer = null;

                item.$item_contextMenu = item.$item.find('.VariablesExplorer_items_item_contextMenu');
                item.$item_contextMenu_menu = item.$item_contextMenu.find('.VariablesExplorer_items_item_contextMenu_menu');
                
                item.$item_contextMenu_menu_item__vLL = item.$item_contextMenu_menu.find('.VariablesExplorer_items_item_contextMenu_menu_item__vLL');
                item.$item_contextMenu_menu_item__vLL = item.$item_contextMenu_menu.find('.VariablesExplorer_items_item_contextMenu_menu_item__vLL');

                if (!data.is_linked_list_visualizer_enabled) {
                    item.$item_contextMenu_menu_item__vLL.hide();
                }

                item.$item_llVis_linkedListVisualizer.on('LinkedListVisualizer_close.VariablesExplorer-' + data.id, function (event) {
                    item.closeLinkedListVisualizer();
                });

                item.$item_contextMenu_menu_item__oE = item.$item_contextMenu_menu.find('.VariablesExplorer_items_item_contextMenu_menu_item__oE');

                item.is_context_menu_opened = false

                var color = [
                    50 + (Math.floor(Math.random()*255) - 50),
                    50 + (Math.floor(Math.random()*255) - 50),
                    50 + (Math.floor(Math.random()*255) - 50)
                ];

                var i = Math.floor(Math.random()*3);
                
                if ((color[i] += 120) > 255) {
                    color[i] = 255;
                }
                
                item.path_css_stroke = `rgb(${color[0]}, ${color[1]}, ${color[2]})`;

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

                if (item.variable.type.code == $.fn.VariablesExplorer.TYPE_CODE_FUNC) {
                    item.$item_button_preType.html('function');
                } else if (item.variable.type.terminal.code == $.fn.VariablesExplorer.TYPE_CODE_STRUCT) {
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
                    data.is_mark_changes &&
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

                item.iterateItems = function (parameters) {
                    if (parameters === undefined) {
                        parameters = {};
                    }
    
                    var _iter = function (items) {
                        items.forEach(function (_item, _item_i) {
                            parameters.iterate({item: _item});
                            _iter(_item.items);
                        });
                    };
    
                    _iter(item.items);
                };
                
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

                    data.$variablesExplorer_content.scrollLeft(data.scroll.x);
                    data.$variablesExplorer_content.scrollTop(data.scroll.y);

                    data.signalPointings();
                    data.signalOthers();

                    $variablesExplorer.trigger('VariablesExplorer_item_opened', {item});
                };

                item.close = function (parameters) {
                    item.is_opened = false;
                    item.$item_openable.hide();

                    item.iterateItems({iterate: function (iteration) {
                        iteration.item.clearPointingSignals();
                        iteration.item.clearPointingSlots();
                    }});
                    
                    item.$item_openable_items.find('.VariablesExplorer_items_item:not(.__proto)').remove();
                    item.items = [];

                    data.signalPointings();
                    data.signalOthers();

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

                    item.tree.every(function (_item, _item_i) {
                        if (!item.parent) {
                            tree.push(_item.variable.expression);
                        } else {
                            tree.push(_item.variable.name);
                        }
                        return true;
                    });

                    tree = tree.join(":");

                    return $.fn.VariablesExplorer.kvKey({
                        identifier: data.kv_key_identifier ? data.kv_key_identifier: data.id,
                        key: 'item:'+tree+':'+key
                    });
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

                item.signalPointings = function (parameters) {
                    if (parameters === undefined) {
                        parameters = {};
                    }

                    if (parameters.is_recursive === undefined) {
                        parameters.is_recursive = true;
                    }
                    
                    if (!data.is_signal_pointings) {
                        return true;
                    }
                    
                    item.pointing_signals = [];
                    
                    item.$item_pointingsSVG.find('.VariablesExplorer_items_item_pointingsSVG_path:not(.__proto)').remove();

                    (
                        parameters.$to 
                        ? parameters.$to
                        : $('.VariablesExplorer:not(.__proto)').not($variablesExplorer)
                    ).each(function () {
                        var $target = $(this);
                        var target = $target.data().VariablesExplorer;

                        if (!target) {
                            return true;
                        }

                        if (!target.is_slot_pointings) {
                            return true;
                        }

                        var _draw = function (items) {
                            items.forEach(function (_item, _item_i) {
                                if (
                                    (!item.variable.is_pointer)
                                    ||
                                    (item.variable.value != _item.variable.address)
                                    ||
                                    !parseInt(_item.variable.address)
                                ) {
                                    _draw(_item.items);
                                    return true;
                                }
                                
                                var c = 100;
                            
                                var ix, iy;
                                var icx, icy;
        
                                var tx, ty;
                                var tcx, tcy;
                                var tl1x, tl1y, tl2x, tl2y;
        
                                ix = item.$item_button.offset().left;
                                iy = item.$item_button.offset().top+(item.$item_button.outerHeight()/2);
        
                                if (data.signal_bounds.left && (ix < data.signal_bounds.left)) {
                                    ix = data.signal_bounds.left;
                                } else if (data.signal_bounds.right && (ix > data.signal_bounds.right)) {
                                    ix = data.signal_bounds.right;
                                }
                                
                                if (data.signal_bounds.top && (iy < data.signal_bounds.top)) {
                                    iy = data.signal_bounds.top;
                                } else if (data.signal_bounds.bottom && (iy > data.signal_bounds.bottom)) {
                                    iy = data.signal_bounds.bottom;
                                }
                                
                                icx = ix - c;
                                icy = iy - c;
        
                                tx = _item.$item.offset().left;
                                ty = _item.$item.offset().top+(item.$item_button.outerHeight()/2);
                                
                                if (target.signal_bounds.left && (tx < target.signal_bounds.left)) {
                                    tx = target.signal_bounds.left;
                                } else if (target.signal_bounds.right && (tx > target.signal_bounds.right)) {
                                    tx = target.signal_bounds.right;
                                }
                                
                                if (target.signal_bounds.top && (ty < target.signal_bounds.top)) {
                                    ty = target.signal_bounds.top;
                                } else if (target.signal_bounds.bottom && (ty > target.signal_bounds.bottom)) {
                                    ty = target.signal_bounds.bottom;
                                }

                                tcx = tx - c;
                                tcy = ty - c;
                                
                                tl1x = tx - 2;
                                tl1y = ty - 11;
                                
                                tl2x = tx - 11;
                                tl2y = ty - 3;
                                
                                var svg = `
                                    M ${ix}, ${iy}
                                    C ${icx}, ${icy}
                                    ${tcx}, ${tcy}
                                    ${tx}, ${ty}
                                    L ${tl1x}, ${tl1y}
                                    M ${tx}, ${ty}
                                    L ${tl2x}, ${tl2y}
                                `;
                                
                                var $path = item.$item_pointingsSVG_path__proto.clone();
                                $path.removeClass('__proto');
                                $path.appendTo(item.$item_pointingsSVG);
                                
                                $path.attr('d', svg);
                                $path.css('stroke', item.path_css_stroke);

                                item.pointing_signals.push({
                                    item: _item,
                                    $path: $path
                                });

                                var is_exists = false;
                                
                                _item.pointing_slots.every(function (_slot, _slot_i) {
                                    if (item.id == _slot.item.id) {
                                        _slot.$path = $path;
                                        
                                        is_exists = true;
                                        return false;
                                    }
                                    return true;
                                });

                                if (!is_exists) {
                                    _item.pointing_slots.push({
                                        item: item,
                                        $path: $path
                                    });
                                }
                                
                                _draw(_item.items);
                            }); 
                        };

                        _draw(target.items);
                    });
                    
                    data.$pointingPlaceholder && item.$item_pointingsSVG.appendTo(data.$pointingPlaceholder);
                    item.$item_pointingsSVG.show();

                    parameters.is_recursive &&
                    item.iterateItems({iterate: function (iteration) {
                        iteration.item.signalPointings();
                    }});
                };

                item.slotPointings = function (parameters) {
                    if (parameters === undefined) {
                        parameters = {};
                    }

                    if (parameters.is_recursive === undefined) {
                        parameters.is_recursive = true;
                    }
                    
                    if (!data.is_slot_pointings) {
                        return true;
                    }
                    
                    item.pointing_slots.every(function (_slot, _slot_i) {
                        _slot.item.signalPointings({is_recursive: parameters.is_recursive});
                        return true;
                    });
                    
                    parameters.is_recursive &&
                    item.iterateItems({iterate: function (iteration) {
                        iteration.item.pointing_slots.every(function (_slot, _slot_i) {
                            _slot.item.signalPointings({is_recursive: parameters.is_recursive});
                            return true;
                        });
                    }});
                };
                
                item.clearPointingSignals = function (parameters) {
                    if (parameters === undefined) {
                        parameters = {};
                    }  

                    if (parameters.is_recursive === undefined) {
                        parameters.is_recursive = true;
                    }
                    
                    item.pointing_signals.every(function (_signal, _signal_i) {
                        var slots = [];
                        
                        _signal.item.pointing_slots.every(function (_slot, _slot_i) {
                            if (_slot.item.id == item.id) {
                                return true;
                            }

                            slots.push(_slot);
                            
                            return true;
                        });

                        _signal.item.pointing_slots = slots;

                        return true;
                    });
                    
                    item.pointing_signals = [];
                    
                    item.$item_pointingsSVG.find('.VariablesExplorer_items_item_pointingsSVG_path').remove();
                    item.$item_pointingsSVG.hide();

                    parameters.is_recursive &&
                    item.iterateItems({iterate: function (iteration) {
                        iteration.item.clearPointingSignals();
                    }});
                };
                
                item.clearPointingSlots = function (parameters) {
                    if (parameters === undefined) {
                        parameters = {};
                    }  

                    if (parameters.is_recursive === undefined) {
                        parameters.is_recursive = true;
                    }
                    
                    item.pointing_slots.every(function (_slot, _slot_i) {
                        _slot.$path.remove();

                        var signals = [];
    
                        _slot.item.pointing_signals.every(function (_signal, _signal_i) {
                            if (_signal.item.id == item.id) {
                                return true;
                            }
    
                            signals.push(_signal);
                            
                            return true;
                        });
    
                        _slot.item.pointing_signals = signals;
                        
                        return true;
                    });
                    
                    item.pointing_slots = [];

                    parameters.is_recursive &&
                    item.iterateItems({iterate: function (iteration) {
                        iteration.item.clearPointingSlots();
                    }});
                };

                item.resolveExpression = function () {
                    var tree = [];
                    
                    var current = item;
                    
                    while (true) {
                        if (!current.parent) {
                            tree.push(current.variable.expression);
                            break;
                        } else {
                            tree.push(current.variable.name);
                        }

                        current = current.parent;
                    }
                    
                    tree.reverse();
                    
                    return tree.join(".");
                };

                item.openInEvaluater = function () {
                    GDBFrontend.components.gdbFrontend.createEvaluater({expression: item.resolveExpression()});
                };
                
                item.openLinkedListVisualizer = function () {
                    item.is_linked_list_visualizer_opened = true;

                    item.$item_llVis.show();
                    
                    if (!item.$item_llVis_linkedListVisualizer.data('LinkedListVisualizer')) {
                        item.$item_llVis_linkedListVisualizer.LinkedListVisualizer();
                        item.item_llVis_linkedListVisualizer = item.$item_llVis_linkedListVisualizer.data().LinkedListVisualizer;
                    }

                    item.item_llVis_linkedListVisualizer.load({
                        variables: [item.variable]
                    });
                    item.item_llVis_linkedListVisualizer.render();
                    
                    item.item_llVis_linkedListVisualizer.items[0].expand();
                };
                
                item.closeLinkedListVisualizer = function () {
                    item.is_linked_list_visualizer_opened = false;
                    item.$item_llVis.hide();
                };
                
                item.toggleLinkedListVisualizer = function () {
                    if (item.is_linked_list_visualizer_opened) {
                        item.closeLinkedListVisualizer();
                    } else {
                        item.openLinkedListVisualizer();
                    }
                };
                
                item.$item_button_value.on('click.VariablesExplorer-'+data.id, function (event) {
                    event.stopPropagation();
                });
                
                item.$item_button_menuBtn.on('click.VariablesExplorer.'+data.id, function (event) {
                    event.stopPropagation();
                    item.toggleContextMenu();
                });

                item.$item_button.on('click.VariablesExplorer.'+data.id, function (event) {
                    item.expand();
                });

                item.$item_contextMenu_menu_item__vLL.on('click.VariablesExplorer.'+data.id, function (event) {
                    item.closeContextMenu();
                    item.toggleLinkedListVisualizer();
                });
                
                item.$item_contextMenu_menu_item__oE.on('click.VariablesExplorer.'+data.id, function (event) {
                    item.closeContextMenu();
                    item.openInEvaluater();
                });
                
                item.openContextMenu = function () {
                    data.iterateItems({iterate: function (_item, _level) {
                        _item.item.closeContextMenu();
                    }});
                    
                    item.is_context_menu_opened = true;
                    item.$item_contextMenu.addClass('VariablesExplorer__opened');
                };
                
                item.closeContextMenu = function () {
                    item.is_context_menu_opened = false;
                    item.$item_contextMenu.removeClass('VariablesExplorer__opened');
                };
               
                item.toggleContextMenu = function () {
                    if (!item.is_context_menu_opened) {
                        item.openContextMenu();
                    } else {
                        item.closeContextMenu();
                    }
                };
                
                item.$item_button.on('contextmenu.VariablesExplorer.'+data.id, function (event) {
                    event.preventDefault();

                    item.toggleContextMenu();
                });

                item.$item_llVis.on('click.VariablesExplorer.'+data.id, function (event) {
                    event.stopPropagation();
                    event.stopImmediatePropagation();
                });
                
                item.$item_contextMenu.on('click.VariablesExplorer.'+data.id, function (event) {
                    event.stopPropagation();
                    event.stopImmediatePropagation();
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

            data.signalOthers = function (parameters) {
                if (parameters === undefined) {
                    parameters = {};
                }

                $('.VariablesExplorer:not(.__proto)').not($variablesExplorer).each(function () {
                    var $source = $(this);
                    var source = $source.data().VariablesExplorer;

                    if (!source) {
                        return true;
                    }

                    if (!source.is_signal_pointings) {
                        return true;
                    }

                    source.signalPointings({$to: $variablesExplorer});
                });
            };
            
            data.iterateItems = function (parameters) {
                if (parameters === undefined) {
                    parameters = {};
                }

                var _iter = function (items) {
                    items.forEach(function (_item, _item_i) {
                        parameters.iterate({item: _item});
                        _iter(_item.items);
                    });
                };

                _iter(data.items);
            };
            
            data.signalPointings = function (parameters) {
                if (parameters === undefined) {
                    parameters = {};
                }

                data.items.forEach(function (_item, _item_i) {
                    _item.signalPointings({is_recursive: parameters.is_recursive});
                });
            };
            
            data.slotPointings = function (parameters) {
                if (parameters === undefined) {
                    parameters = {};
                }

                data.items.forEach(function (_item, _item_i) {
                    _item.slotPointings({is_recursive: parameters.is_recursive});
                });
            };
            
            data.clearPointingSignals = function (parameters) {
                if (parameters === undefined) {
                    parameters = {};
                }

                data.items.forEach(function (_item, _item_i) {
                    _item.clearPointingSignals({is_recursive: parameters.is_recursive});
                });
            };
            
            data.clearPointingSlots = function (parameters) {
                if (parameters === undefined) {
                    parameters = {};
                }

                data.items.forEach(function (_item, _item_i) {
                    _item.clearPointingSlots({is_recursive: parameters.is_recursive});
                });
            };
            
            data.$variablesExplorer_content.on('mousewheel.VariablesExplorer.'+data.id, function (event) {
                setTimeout(function () {
                    var scroll_x = data.$variablesExplorer_content.scrollLeft();
                    var scroll_y = data.$variablesExplorer_content.scrollTop();

                    data.scroll.x = scroll_x;
                    data.scroll.y = scroll_y;
                }, 500);
            });

            $variablesExplorer.on('VariablesExplorer_initialize.VariablesExplorer.'+data.id, function (event) {
                data.init();
            });

            $variablesExplorer.on('VariablesExplorer_comply.VariablesExplorer.'+data.id, function (event) {
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

    $.fn.VariablesExplorer.kvKey = function (parameters) {
        return 'VariablesExplorer-'+parameters.identifier+':'+parameters.key;
    };

    $.fn.VariablesExplorer.id_i = 0;
    
    $.fn.VariablesExplorer.TYPE_CODE_STRUCT = 3;
    $.fn.VariablesExplorer.TYPE_CODE_UNION = 4;
    $.fn.VariablesExplorer.TYPE_CODE_FUNC = 7;
    $.fn.VariablesExplorer.TYPE_CODE_CHAR = 20;
    $.fn.VariablesExplorer.TYPE_CODE_PTR = 1;
})(jQuery);