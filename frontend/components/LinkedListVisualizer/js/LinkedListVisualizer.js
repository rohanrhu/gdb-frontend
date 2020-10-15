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
 * GDBFrontend Linked-List Visualizer
 * This componant accepts state.variables format.
 *
 * Example:
 * linkedListVisualizer.load(state.variables);
 * linkedListVisualizer.render();
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
            var $linkedListVisualizer = $(this);

            $linkedListVisualizer.off('.LinkedListVisualizer');
            $linkedListVisualizer.find('*').off('.LinkedListVisualizer');

            var current_data = $linkedListVisualizer.data('LinkedListVisualizer');
            
            if (current_data) {
                $(window).off('LinkedListVisualizer-' + current_data.id);
                $(document).off('LinkedListVisualizer-' + current_data.id);
                $('html, body').off('LinkedListVisualizer-' + current_data.id)
            }
            
            var data = {};
            $linkedListVisualizer.data('LinkedListVisualizer', data);
            data.$linkedListVisualizer = $linkedListVisualizer;

            data.id = t_init.parameters.id ? t_init.parameters.id: ++$.fn.LinkedListVisualizer.id_i;

            data.$linkedListVisualizer_map = $linkedListVisualizer.find('.LinkedListVisualizer_map');
            data.$linkedListVisualizer_items = $linkedListVisualizer.find('.LinkedListVisualizer_items');
            data.$linkedListVisualizer_items_item__proto = data.$linkedListVisualizer_items.find('.LinkedListVisualizer_items_item.__proto');
            
            data.$linkedListVisualizer_settings = $linkedListVisualizer.find('.LinkedListVisualizer_settings');

            data.$linkedListVisualizer_settings_setting__nextMember = data.$linkedListVisualizer_settings.find('.LinkedListVisualizer_settings_setting__nextMember');
            data.$linkedListVisualizer_settings_setting__nextMember_input_rI = data.$linkedListVisualizer_settings_setting__nextMember.find('.LinkedListVisualizer_settings_setting_input_rI');
            
            data.$linkedListVisualizer_settings_setting__close_button = data.$linkedListVisualizer_settings.find('.LinkedListVisualizer_settings_setting__close_button');

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
            data.depth = 0;
            data.max_depth = 20;

            data.next_member = "next";

            data.$linkedListVisualizer_settings_setting__close_button.on('click.LinkedListVisualizer-' + data.id, function (event) {
                $linkedListVisualizer.trigger('LinkedListVisualizer_close');
            });
            
            var next_member_uT = 0;
            var next_member_pV = data.next_member;
            
            data.$linkedListVisualizer_settings_setting__nextMember_input_rI.on('keyup.LinkedListVisualizer-' + data.id + ', change.LinkedListVisualizer-' + data.id, function (event) {
                clearTimeout(next_member_uT);

                data.next_member = data.$linkedListVisualizer_settings_setting__nextMember_input_rI.val();

                if (data.next_member == next_member_pV) {
                    return;
                }

                next_member_uT = setTimeout(function () {
                    next_member_pV = data.next_member;
                
                    data.items[0].expand();

                    if (!data.items[0].is_opened) {
                        data.items[0].expand();
                    }
                }, 1000);
            });
            
            data.setLoading = function (is_loading) {
                data.is_loading = is_loading;
            };
            
            data.setFluent = function (is_fluent) {
                data.is_fluent = is_fluent;

                if (data.is_fluent) {
                    $linkedListVisualizer.addClass('LinkedListVisualizer__fluent');
                } else {
                    $linkedListVisualizer.removeClass('LinkedListVisualizer__fluent');
                }
            };
            
            data.setLocation = function (location) {
                data.location = location;
            };

            data.clear = function () {
                data.$linkedListVisualizer_items.find('.LinkedListVisualizer_items_item:not(.__proto)').remove();
                
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
                    
                    if (!window.LinkedListVisualizer_items_item_i) {
                        LinkedListVisualizer_items_item_i = 1;
                    }

                    item.id = LinkedListVisualizer_items_item_i++;
                    
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

                (parameters.item ? parameters.item.$item_next: data.$linkedListVisualizer_items)
                .find('.LinkedListVisualizer_items_item:not(.__proto)').remove();
                
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
                    (parameters.item ? parameters.item.$item_next: data.$linkedListVisualizer_items)
                    .find('.LinkedListVisualizer_items_item_button:not(.__proto)  .LinkedListVisualizer_items_item_button_isNotPointer').hide();
                }


                $linkedListVisualizer.trigger('LinkedListVisualizer_rendered', {
                    item: parameters.item
                });
            };

            data.setMaxHeight = function (parameters) {
                data.$linkedListVisualizer_map.css('max-height', parameters.max_height);
            };

            data.add = function (parameters) {
                var item = parameters.item;

                var $items;

                if (parameters.$items === undefined) {
                    $items = data.$linkedListVisualizer_items;
                } else {
                    $items = parameters.$items;
                }

                var $item = data.$linkedListVisualizer_items_item__proto.clone();
                $item.removeClass('__proto');
                $item.appendTo($items);

                item.is_empty = true;
                item.is_opened = false;
                item.is_loading = false;

                item.$item = $item;

                item.$item_vE = $item.find('.LinkedListVisualizer_items_item_vE');
                item.$item_variablesExplorer = GDBFrontend.components.gdbFrontend.$gdbFrontend_variablesExplorer__proto.clone();
                item.$item_variablesExplorer.appendTo(item.$item_vE);
                item.$item_variablesExplorer.VariablesExplorer();
                item.item_variablesExplorer = item.$item_variablesExplorer.data().VariablesExplorer;
                item.item_variablesExplorer.is_mark_changes = false;
                item.item_variablesExplorer.is_signal_pointings = false;
                item.item_variablesExplorer.is_slot_pointings = false;
                item.item_variablesExplorer.kv_key_identifier = "llVis";

                item.$item_nextLoading = $item.find('.LinkedListVisualizer_items_item_nextLoading');
                item.$item_next = $item.find('> .LinkedListVisualizer_items_item_next');

                item.item_variablesExplorer.load({variables: [item.variable]});
                item.item_variablesExplorer.render();

                item.setLoading = function (is_loading) {
                    item.is_loading = is_loading;

                    if (is_loading) {
                        item.$item_nextLoading.show();
                    } else {
                        item.$item_nextLoading.hide();
                    }
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
                        $items: item.$item_next
                    });
                };

                item.open = function (parameters) {
                    if (item.is_empty) {
                        if (!parameters.is_preload) {
                            GDBFrontend.showMessageBox({text: "Structure or union is not initialized yet."});
                        }
                        return false;
                    }

                    item.is_opened = true;
                    item.$item_next.show();

                    $linkedListVisualizer.trigger('LinkedListVisualizer_item_opened', {item});
                };

                item.close = function (parameters) {
                    item.is_opened = false;
                    item.$item_next.hide();
                    
                    item.$item_next.find('.LinkedListVisualizer_items_item:not(.__proto)').remove();
                    item.items = [];
                };
                
                item.expand = function (parameters) {
                    if (parameters === undefined) {
                        parameters = {};
                    }
    
                    if (!data.next_member.length) {
                        return;
                    }
                    
                    if (
                        (item.variable.type.terminal.code != $.fn.VariablesExplorer.TYPE_CODE_STRUCT)
                        &&
                        (item.variable.type.terminal.code != $.fn.VariablesExplorer.TYPE_CODE_UNION)
                    ) {
                        return;
                    }
    
                    if (item.is_loading) {
                        return;
                    }
                    
                    if (item.is_opened) {
                        item.close();
                        return;
                    }
    
                    item.setLoading(true);

                    var qs = {
                        variable: item.variable.expression
                    };

                    if (
                        item.parent
                        &&
                        (
                            (item.variable.type.code == $.fn.VariablesExplorer.TYPE_CODE_STRUCT)
                            ||
                            (item.variable.type.code == $.fn.VariablesExplorer.TYPE_CODE_UNION))
                    ) {
                        qs.expression = '('+item.variable.type.name+')'+qs.expression;
                    }

                    qs.variable = qs.variable + "." + data.next_member;
                    
                    $.ajax({
                        url: '/api/frame/variable',
                        cache: false,
                        method: 'get',
                        data: qs,
                        success: function (result_json) {
                            if (!result_json.ok) {
                                GDBFrontend.showMessageBox({text: 'An error occured.'});
                                console.trace('An error occured.');
    
                                item.setLoading(false);
    
                                return;
                            }

                            if (!result_json.variable) {
                                item.setLoading(false);
                                return;
                            }
    
                            item.load({
                                members: [result_json.variable]
                            });
    
                            item.setLoading(false);
                            item.open({is_preload: parameters.is_preload});
                            item.render();

                            item.items[0].variable.members &&
                            item.items[0].variable.members.every(function (_member, _member_i) {
                                if (_member.name != data.next_member) {
                                    return true;
                                }
                                
                                if ((_member.type.code == $.fn.VariablesExplorer.TYPE_CODE_PTR) && (parseInt(_member.value) != 0)) {
                                    item.items[0].expand();
                                    return false;
                                }
                                
                                return true;
                            });
                        },
                        error: function () {
                            GDBFrontend.showMessageBox({text: 'An error occured.'});
                            console.trace('An error occured.');
    
                            item.setLoading(false);
                        }
                    });
                };
            };

            $linkedListVisualizer.on('LinkedListVisualizer_initialize.LinkedListVisualizer.'+data.id, function (event) {
                data.init();
            });

            $linkedListVisualizer.on('LinkedListVisualizer_comply.LinkedListVisualizer.'+data.id, function (event) {
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

    $.fn.LinkedListVisualizer = function(method) {
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method '+method+' does not exist on jQuery.LinkedListVisualizer');
        }
    };

    $.fn.LinkedListVisualizer.kvKey = function (parameters) {
        return 'LinkedListVisualizer-'+parameters.data.id+':'+parameters.key;
    };

    $.fn.LinkedListVisualizer.id_i = 0;
})(jQuery);