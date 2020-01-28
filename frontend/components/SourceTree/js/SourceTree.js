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
 * SourceTree is a front-end component to displaying source files those are taken from GDB.
 *
 * Use sourceTree.load(['/path/to/source1.c', '/path/to/source2.c']) and soureTree.render() for displaying sources.
 * sourceTree.files represents like:
 * [
 *     [
 *         "path",
 *         [
 *             [
 *                 "to",
 *                 [
 *                     ["source1.c", [], 0, "/path/to/source1.c", $.fn.SourceTree.TREE_ITEM_TYPE__FILE],
 *                     ["source2.c", [], 0, "/path/to/source2.c", $.fn.SourceTree.TREE_ITEM_TYPE__FILE]
 *                 ],
 *                 0,
 *                 "/path/to",
 *                 $.fn.SourceTree.TREE_ITEM_TYPE__DIR
 *             ]
 *         ],
 *         0,
 *         "/path",
 *         $.fn.SourceTree.TREE_ITEM_TYPE__DIR
 *     ],
 * ]
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
            var $sourceTree = $(this);

            $sourceTree.off('.SourceTree');
            $sourceTree.find('*').off('.SourceTree');

            var data = {};
            $sourceTree.data('SourceTree', data);
            data.$sourceTree = $sourceTree;

            var $sourceTree_path = $sourceTree.find('.SourceTree_path');

            var $sourceTree_items = $sourceTree.find('.SourceTree_items');
            var $sourceTree_items_item__proto = $sourceTree.find('.SourceTree_items_item.__proto');

            var $sourceTree_total = $sourceTree.find('.SourceTree_total');
            var $sourceTree_total_number = $sourceTree_total.find('.SourceTree_total_number');

            data.animation_duration = 100;

            data.is_passive = false;
            data.files = [];

            data.load = function (parameters) {
                data.files = [];

                var parent_tree_item = data.files;

                parameters.files.forEach(function (_file, _file_i) {
                    if (!_file.length) {
                        return true;
                    }

                    _file = GDBFrontend.stdPathSep(_file);

                    var file_tree = $.fn.SourceTree.pathTree(_file);
                    var level = 0;

                    file_tree.forEach(function (_tree_file, _tree_file_i) {
                        var _add = true;

                        parent_tree_item.forEach(function (_root_file, _root_file_i) {
                            if (
                                (level == _root_file[$.fn.SourceTree.TREE_ITEM_LEVEL])
                                &&
                                (_tree_file == _root_file[$.fn.SourceTree.TREE_ITEM_NAME])
                            ) {
                                parent_tree_item = _root_file[$.fn.SourceTree.TREE_ITEM_ITEMS];
                                _add = false;
                                level++;

                                return false;
                            }
                        });

                        if (!_add) {
                            return true;
                        }

                        tree_item = [];
                        tree_item[$.fn.SourceTree.TREE_ITEM_NAME] = _tree_file;
                        tree_item[$.fn.SourceTree.TREE_ITEM_ITEMS] = [];
                        tree_item[$.fn.SourceTree.TREE_ITEM_LEVEL] = level++;
                        tree_item[$.fn.SourceTree.TREE_ITEM_PATH] = (_file[0] == '/' ? '/': '')+file_tree.slice(0, _tree_file_i+1).join('/');
                        tree_item[$.fn.SourceTree.TREE_ITEM_TYPE] = (level == file_tree.length)
                                                                    ? $.fn.SourceTree.TREE_ITEM_TYPE__FILE
                                                                    : $.fn.SourceTree.TREE_ITEM_TYPE__DIR;
                        tree_item[$.fn.SourceTree.TREE_ITEM_ITEM] = null;

                        parent_tree_item.push(tree_item);
                        parent_tree_item = tree_item[$.fn.SourceTree.TREE_ITEM_ITEMS];
                    });

                    parent_tree_item = data.files;
                });

                $sourceTree.trigger('SourceTree_loaded');
            };

            data.render = function (parameters) {
                if (parameters === undefined) {
                    parameters = {};
                }

                $sourceTree_items.find('.SourceTree_items_item:not(.__proto)').remove();

                var _put = function (files, $items, level) {
                    files.forEach(function (_file, _file_i) {
                        if (_file[$.fn.SourceTree.TREE_ITEM_NAME] == '<built-in>') {
                            return true;
                        }

                        var $item = $sourceTree_items_item__proto.clone();
                        $item.removeClass('__proto');
                        $item.appendTo($items);

                        var $item_button = $item.find('.SourceTree_items_item_button');
                        var $item_button_indent = $item.find('.SourceTree_items_item_button_indent');
                        var $item_items = $item.find('.SourceTree_items_item_items');
                        var $item_line = $item.find('.SourceTree_items_item_line');

                        var item = {};
                        _file[$.fn.SourceTree.TREE_ITEM_ITEM] = item;
                        item.file = _file;
                        item.$item = $item;
                        item.$item_button_indent = $item_button_indent;
                        item.$item_button = $item_button;
                        item.$item_button_indent = $item_button_indent;
                        item.$item_items = $item_items;
                        item.$item_line = $item_line;
                        item.$item_name = $item.find('.SourceTree_items_item_name');
                        item.is_opened = false;

                        item.open = function () {
                            item.is_opened = true;
                            $item_items.show();
                            item.$item.addClass('SourceTree__opened');
                            item.$item.trigger('SourceTree_opened');

                            item.$item_line.css('left', item.$item_button_indent.width());
                            // item.$item_line.height();
                            
                            $.fn.SourceTree.saveItemState({
                                path: item.file[$.fn.SourceTree.TREE_ITEM_PATH],
                                state: {
                                    is_opened: true
                                }
                            });
                        };

                        item.close = function () {
                            item.is_opened = false;
                            $item_items.hide();
                            item.$item.removeClass('SourceTree__opened');
                            item.$item.trigger('SourceTree_closed');

                            $.fn.SourceTree.saveItemState({
                                path: item.file[$.fn.SourceTree.TREE_ITEM_PATH],
                                state: {
                                    is_opened: false
                                }
                            });
                        };

                        item.toggle = function () {
                            item[item.is_opened ? 'close': 'open']();
                        };

                        item.$item_button_indent.width(level*10);
                        
                        $item_items.hide();

                        item.$item_name.html(_file[$.fn.SourceTree.TREE_ITEM_NAME]);

                        if (_file[$.fn.SourceTree.TREE_ITEM_ITEMS].length) {
                            $item.addClass('SourceTree_items_item__dir');
                        } else {
                            $item.addClass('SourceTree_items_item__file');
                        }

                        var state = $.fn.SourceTree.getItemState({path: item.file[$.fn.SourceTree.TREE_ITEM_PATH]});

                        if (state.is_opened) {
                            item.open();
                        }

                        item.$item.on('click.SourceTree', function (event) {
                            event.stopPropagation();

                            if (_file[$.fn.SourceTree.TREE_ITEM_TYPE] == $.fn.SourceTree.TREE_ITEM_TYPE__FILE) {
                                $sourceTree.trigger('SourceTree_item_selected', {
                                    item: item
                                });
                            } else {
                                item.toggle();
                            }
                        });

                        _put(_file[$.fn.SourceTree.TREE_ITEM_ITEMS], $item_items, level+1);
                    });
                };

                _put(data.files, $sourceTree_items, 0);

                $sourceTree.trigger('SourceTree_rendered');
            };

            $sourceTree.on('SourceTree_initialize.SourceTree', function (event) {
                data.init();
            });

            $sourceTree.on('SourceTree_comply.SourceTree', function (event) {
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

    $.fn.SourceTree = function(method) {
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method '+method+' does not exist on jQuery.SourceTree');
        }
    };

    $.fn.SourceTree.pathFileName = function (path) {
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

    $.fn.SourceTree.pathTree = function (path) {
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

    $.fn.SourceTree.kvKey = function (key) {
        return 'SourceTree:'+key;
    };

    $.fn.SourceTree.saveItemState = function (parameters) {
        localStorage.setItem($.fn.SourceTree.kvKey(parameters.path), JSON.stringify(parameters.state));
    };

    $.fn.SourceTree.getItemState = function (parameters) {
        var state = localStorage.getItem($.fn.SourceTree.kvKey(parameters.path));

        if (!state) {
            state = {
                is_opened: false
            };
        } else {
            state = JSON.parse(state);
        }

        return state;
    };

    $.fn.SourceTree.TREE_ITEM_NAME = 0;
    $.fn.SourceTree.TREE_ITEM_ITEMS = 1;
    $.fn.SourceTree.TREE_ITEM_LEVEL = 2;
    $.fn.SourceTree.TREE_ITEM_PATH = 3;
    $.fn.SourceTree.TREE_ITEM_TYPE = 4;
    $.fn.SourceTree.TREE_ITEM_ITEM = 5;

    $.fn.SourceTree.TREE_ITEM_TYPE__DIR = 1;
    $.fn.SourceTree.TREE_ITEM_TYPE__FILE = 2;
})(jQuery);