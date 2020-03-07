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
 * Shows instructiions.
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
            var $Disassembly = $(this);

            $Disassembly.off('.Disassembly');
            $Disassembly.find('*').off('.Disassembly');

            var data = {};
            $Disassembly.data('Disassembly', data);
            data.$Disassembly = $Disassembly;

            data.$Disassembly_content = $Disassembly.find('.Disassembly_content');
            data.$Disassembly_items = $Disassembly.find('.Disassembly_items');
            data.$Disassembly_items_item__proto = data.$Disassembly_items.find('.Disassembly_items_item.__proto');

            data.animation_duration = 100;

            data.is_passive = false;
            data.instructions = [];
            data.view_length = 5;
            data.pc = 0;
            data.$current = null;

            data.setCurrent = function (num) {
                data.current = parseInt(num);
            };

            data.load = function (parameters) {
                data.instructions = [];

                data.pc = parameters.pc;
                data.instructions = parameters.instructions;
            };

            data.render = function (parameters) {
                if (parameters === undefined) {
                    parameters = {};
                }

                var $item = data.$Disassembly_items_item__proto.clone();
                $item.removeClass('__proto');
                $item.appendTo(data.$Disassembly_items);
                var item_height = $item.height();
                $item.remove();

                var len = data.view_length;
                if (data.instructions && (data.instructions.length < len)) {
                    len = data.instructions.length;
                }
                
                var height = item_height * len;
                
                data.$Disassembly_content.height((height > 0 ) ? height + 10: 0);
                
                data.$Disassembly_items.find('.Disassembly_items_item:not(.__proto)').remove();

                data.instructions &&
                data.instructions.forEach(function (instruction, instruction_i) {
                    var $item = data.$Disassembly_items_item__proto.clone();
                    $item.removeClass('__proto');
                    $item.appendTo(data.$Disassembly_items);

                    instruction.$item = $item;
                    instruction.$item_addr = $item.find('.Disassembly_items_item_addr');
                    instruction.$item_addr_val = $item.find('.Disassembly_items_item_addr_val');
                    instruction.$item_asm = $item.find('.Disassembly_items_item_asm');
                    instruction.$item_location = $item.find('.Disassembly_items_item_location');

                    instruction.$item_addr_val.html('0x'+instruction.addr.toString(16));
                    instruction.$item_asm.html(instruction.asm.replace('<', '&lt').replace('>', '&gt'));

                    if (instruction.addr == data.pc) {
                        instruction.$item.addClass('Disassembly__current');
                        data.$current = instruction.$item;
                    }
                });

                if (data.$current) {
                    data.$Disassembly_content.scrollTop(data.$current[0].offsetTop - (data.$current.outerHeight() * ((data.view_length-1)/2)));
                }
            };

            data.clear = function () {
                data.instructions = [];
            };
            
            data.setViewLength = function (parameters) {
                data.view_length = parameters.view_length;
            };

            $Disassembly.on('Disassembly_initialize.Disassembly', function (event) {
                data.init();
            });

            $Disassembly.on('Disassembly_comply.Disassembly', function (event) {
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

    $.fn.Disassembly = function(method) {
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method '+method+' does not exist on jQuery.Disassembly');
        }
    };
})(jQuery);