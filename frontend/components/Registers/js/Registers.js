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
 * GDBFrontend Registers Component
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
            var $registers = $(this);

            $registers.off('.Registers');
            $registers.find('*').off('.Registers');

            var data = {};
            $registers.data('Registers', data);
            data.$registers = $registers;

            data.$registers_noItems = $registers.find('.Registers_noItems');
            data.$registers_items = $registers.find('.Registers_items');
            data.$registers_items_item__proto = data.$registers_items.find('.Registers_items_item.__proto');

            data.animation_duration = 100;

            data.is_passive = false;
            data.registers = {};

            data.kvKey = function (key) {
                return 'GDBFrontend:Registers:'+key;
            };
            
            data.clear = function (parameters) {
                data.registers = {};

                data.$registers_items.find('.Registers_items_item:not(.__proto)').remove();
            };

            var prev_registers = {};
            
            data.load = function (parameters) {
                var prev_registers = data.registers;

                data.clear();
                
                if (!parameters.registers) {
                    return;
                }
                
                Object.keys(parameters.registers).forEach(function (_register) {
                    var $item = data.$registers_items_item__proto.clone(true);
                    $item.removeClass('__proto');
                    $item.appendTo(data.$registers_items);

                    $item.find('.Registers_items_item_name').html(_register);
                    $item.find('.Registers_items_item_hexVal').html(parameters.registers[_register][0]);
                    $item.find('.Registers_items_item_decVal').html(parameters.registers[_register][1]);
                    
                    if (prev_registers.hasOwnProperty(_register) && (parameters.registers[_register][1] != prev_registers[_register][1])) {
                        $item.addClass('Registers__changed');
                    }

                    data.registers = parameters.registers;
                });
            };

            $registers.on('Registers_initialize.Registers', function (event) {
                data.init();
            });

            $registers.on('Registers_comply.Registers', function (event) {
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

    $.fn.Registers = function(method) {
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method '+method+' does not exist on jQuery.Registers');
        }
    };
})(jQuery);