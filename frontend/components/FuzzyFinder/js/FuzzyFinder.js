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
            var $fuzzyFinder = $(this);

            $fuzzyFinder.off('.FuzzyFinder');
            $fuzzyFinder.find('*').off('.FuzzyFinder');
            
            var current_data = $fuzzyFinder.data('FuzzyFinder');
            
            if (current_data) {
                $(window).off('FuzzyFinder-' + current_data.id);
                $(document).off('FuzzyFinder-' + current_data.id);
                $('html, body').off('FuzzyFinder-' + current_data.id)
            }
            
            var data = {};
            $fuzzyFinder.data('FuzzyFinder', data);
            data.$fuzzyFinder = $fuzzyFinder;

            if (!window.hasOwnProperty('FuzzyFinder_component_id')) {
                FuzzyFinder_component_id = 0;
            }

            data.id = ++FuzzyFinder_component_id;

            data.$fuzzyFinder_box = $fuzzyFinder.find('.FuzzyFinder_box');
            data.$fuzzyFinder_box_input = $fuzzyFinder.find('.FuzzyFinder_box_input');
            data.$fuzzyFinder_box_input_rI = $fuzzyFinder.find('.FuzzyFinder_box_input_rI');

            data.$fuzzyFinder_box_items = data.$fuzzyFinder_box.find('.FuzzyFinder_box_items');
            data.$fuzzyFinder_box_items_item__proto = data.$fuzzyFinder_box_items.find('.FuzzyFinder_box_items_item.__proto');

            data.fade_duration = 250;
            data.is_opened = false;

            data.sources = [];
            data.items = [];
            data.current = 0;
            data.prev_query = '';

            data.onSelected = function (parameters) {};

            data.open = function (parameters) {
                data.is_opened = true;

                if (parameters.onSelected) {
                    data.onSelected = parameters.onSelected;
                }

                data.clear();
                $fuzzyFinder.show();
                data.$fuzzyFinder_box_input_rI.focus();
            };

            data.$fuzzyFinder.on('keydown.FuzzyFinder-'+data.id, function (event) {
                event.stopPropagation();
                data.$fuzzyFinder.trigger('FuzzyFinder_keydown', {event: event});
            });

            data.$fuzzyFinder_box_input_rI.on('keydown.FuzzyFinder-'+data.id, function (event) {
                event.stopPropagation();

                data.$fuzzyFinder.trigger('FuzzyFinder_keydown', {event: event});

                if (!data.is_opened) {
                    return;
                }

                var keycode = event.keyCode ? event.keyCode: event.which;
                if (keycode == 27) {
                    data.close();
                } else if (keycode == 38) {
                    event.preventDefault();
                    data.up();
                } else if (keycode == 40) {
                    event.preventDefault();
                    data.down();
                } else if (keycode == 13) {
                    data.close();
                    data.onSelected({item: data.items[data.current]});
                    $fuzzyFinder.trigger('FuzzyFinder_selected', {item: data.items[data.current]});
                }
            });

            data.$fuzzyFinder_box_input_rI.on('keyup.FuzzyFinder-'+data.id, function (event) {
                event.stopPropagation();

                if (!data.is_opened) {
                    return;
                }

                var keycode = event.keyCode ? event.keyCode: event.which;
                if (keycode == 27) {
                } else if (keycode == 38) {
                } else if (keycode == 40) {
                } else if (keycode == 13) {
                } else {
                    data.update();
                }
            });

            data.$fuzzyFinder_box_input_rI.on('change.FuzzyFinder-'+data.id+', paste.FuzzyFinder-'+data.id+', cut.FuzzyFinder-'+data.id+', drop.FuzzyFinder-'+data.id, function (event) {
                event.stopPropagation();

                if (!data.is_opened) {
                    return;
                }

                data.update();
            });

            $('body').on('keydown.FuzzyFinder-'+data.id, function (event) {
                event.stopPropagation();

                if (!data.is_opened) {
                    return;
                }

                var keycode = event.keyCode ? event.keyCode: event.which;

                if (event.ctrlKey && keycode == 80) {
                    event.stopImmediatePropagation();
                    event.preventDefault();
                    data.close();
                } else if (keycode == 38) {
                    data.up();
                } else if (keycode == 40) {
                    data.down();
                } else if (keycode == 13) {
                    $fuzzyFinder.trigger('FuzzyFinder_selected', {item: data.items[data.current]});
                }
            });

            data.clear = function () {
                data.$fuzzyFinder_box_input_rI.val('');
                data.$fuzzyFinder_box_items.find('.FuzzyFinder_box_items_item:not(.__proto)').remove();
                data.items = [];
            };

            data.close = function () {
                data.is_opened = false;
                data.$fuzzyFinder_box_input_rI.blur();
                $fuzzyFinder.hide();
            };

            data.up = function () {
                if (data.current <= 0) {
                    return;
                }

                data.select({index: data.current-1});
            };

            data.down = function () {
                if (data.current >= data.items.length-1) {
                    return;
                }

                data.select({index: data.current+1});
            };

            data.select = function (parameters) {
                var item = data.items[parameters.index];
                var prev = data.items[data.current];

                if (prev) {
                    prev.is_selected = false;
                    prev.$item.removeClass('FuzzyFinder_box_items_item__current');
                }

                if (!item) {
                    return;
                }

                data.current = parameters.index;

                item.is_selected = true;
                item.$item.addClass('FuzzyFinder_box_items_item__current');

                var scroll_y = data.$fuzzyFinder_box_items.scrollTop();
                var height = data.$fuzzyFinder_box_items.innerHeight();
                var item_y = scroll_y + item.$item.position().top;
                var item_h = item.$item.outerHeight();
                var limit = scroll_y+height-item_h;

                if (item_y > limit) {
                    data.$fuzzyFinder_box_items.scrollTop(item_y - (height - item_h));
                } else if (item_y < scroll_y) {
                    data.$fuzzyFinder_box_items.scrollTop(item_y);
                }
            };

            data.getSources = function () {
                if (typeof data.sources == typeof Function) {
                    return data.sources();
                }

                return data.sources;
            };

            data.update = function (parameters) {
                var query = data.$fuzzyFinder_box_input_rI.val();

                if (query == data.prev_query) {
                    return;
                }

                data.prev_query = query;

                var results = $.fn.FuzzyFinder.fuzzy({
                    items: data.getSources(),
                    query: query
                });

                data.$fuzzyFinder_box_items.find('.FuzzyFinder_box_items_item:not(.__proto)').remove();
                data.items = [];

                results.every(function (item, item_i) {
                    var path = GDBFrontend.stdPathSep(item[0]);
                    var segments = path.split('/');
                    var file_name = segments[segments.length-1];

                    var $item = data.$fuzzyFinder_box_items_item__proto.clone();
                    $item.removeClass('__proto');
                    $item.appendTo(data.$fuzzyFinder_box_items);

                    var item = {};
                    data.items.push(item);
                    item.num = item_i++;
                    item.$item = $item;
                    item.is_selected = false;

                    item.file = {};
                    item.file.name = file_name;
                    item.file.path = path;

                    $item.find('.FuzzyFinder_box_items_item_fileName').html(file_name);
                    $item.find('.FuzzyFinder_box_items_item_path').html(path);

                    $item.on('click.FuzzyFinder-'+data.id, function (event) {
                        event.stopPropagation();
                        data.close();
                        data.onSelected({item: item});
                        $fuzzyFinder.trigger('FuzzyFinder_selected', {item: item});
                    });

                    item.select = function () {
                        data.items.every(function (_item, _item_i) {
                            if (_item.num == item.num) {
                                return true;
                            }

                            _item.is_selected = false;
                            _item.$item.removeClass('FuzzyFinder_box_items_item__current');

                            return true;
                        });
                    };

                    return true;
                });

                data.select({index: 0});
            };

            data.$fuzzyFinder_box.on('click.FuzzyFinder-'+data.id, function (event) {
                event.stopPropagation();
            });

            $fuzzyFinder.on('click.FuzzyFinder-'+data.id, function (event) {
                event.stopPropagation();
                data.close();
            });

            data.init = function () {
            };

            data.init();
        });
    };

    $.fn.FuzzyFinder = function(method) {
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method '+method+' does not exist on jQuery.FuzzyFinder');
        }
    };

    $.fn.FuzzyFinder.fuzzy = function (parameters) {
        var results = [];

        var items = parameters.items;

        var _item;
        var _item_i;

        for (_item_i=0; _item_i < items.length; _item_i++) {
            _item = items[_item_i];

            var path = GDBFrontend.stdPathSep(_item);
            var segments = path.split('/');
            var terminal = segments[segments.length-1];

            var syncs = [];

            var i, j, k;
            var sc, pc;

            k = 0;

            for (i=0; i < parameters.query.length; i++) {
                pc = parameters.query[i];

                for (j=k; j < path.length; j++) {
                    sc = path[j];

                    if (sc == pc) {
                        syncs.push([sc, j]);
                        k = j;
                        break;
                    }
                }
            }

            if (syncs.length) {
                results.push([_item, syncs]);
            }
        }

        results.sort(function (x, y) {
            if (x[1].length < y[1].length) {
                return 1;
            }

            if (x[1].length > y[1].length) {
                return -1;
            }

            return 0;
        });

        return results;
    };
})(jQuery);