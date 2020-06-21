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
            var $disassembly = $(this);

            $disassembly.off('.Disassembly');
            $disassembly.find('*').off('.Disassembly');

            var data = {};
            $disassembly.data('Disassembly', data);
            data.$disassembly = $disassembly;

            data.id = ++$.fn.Disassembly.id_i;

            data.$disassembly_content = $disassembly.find('.Disassembly_content');
            data.$disassembly_items = $disassembly.find('.Disassembly_items');
            data.$disassembly_items_item__proto = data.$disassembly_items.find('.Disassembly_items_item.__proto');

            data.animation_duration = 100;

            data.is_passive = false;
            data.instructions = [];
            data.view_length = 5;
            data.pc = 0;
            data.$current = null;
            data.is_resizable = true;
            data.is_need_render = false;
            data.last_rendered_pc = false;

            data.setCurrent = function (num) {
                data.current = parseInt(num);
            };

            data.load = function (parameters) {
                data.pc = parameters.pc;

                if (data.last_rendered_pc != data.pc) {
                    data.last_rendered_pc = false;
                }
                
                if (parameters.instructions.length && data.instructions.length && (parameters.instructions[0].addr == data.instructions[0].addr)) {
                    data.is_need_render = false;
                    return;
                }

                data.is_need_render = true;
                
                data.instructions = parameters.instructions;

                data.instructions.every(function (_instruction, _instruction_i) {
                    if (_instruction.Disassembly === undefined) {
                        _instruction.Disassembly = {};
                    }

                    _instruction.Disassembly[data.id] = {};

                    _instruction.Disassembly[data.id].addBreakpoint = function () {
                        _instruction.Disassembly[data.id].$item.addClass('Disassembly__bp');
                    };
                    
                    _instruction.Disassembly[data.id].delBreakpoint = function () {
                        _instruction.Disassembly[data.id].$item.removeClass('Disassembly__bp');
                    };
                    
                    _instruction.Disassembly[data.id].setStop = function (is_stop) {
                        if (is_stop) {
                            _instruction.Disassembly[data.id].$item.addClass('Disassembly__current');
                        } else {
                            _instruction.Disassembly[data.id].$item.removeClass('Disassembly__current');
                        }
                    };
                    
                    return true;
                });
            };

            data.render = function (parameters) {
                if (parameters === undefined) {
                    parameters = {};
                }

                var $item = data.$disassembly_items_item__proto.clone();
                $item.removeClass('__proto');
                $item.appendTo(data.$disassembly_items);
                var item_height = $item.height();
                $item.remove();

                var len = data.view_length;
                if (data.instructions && (data.instructions.length < len)) {
                    len = data.instructions.length;
                }
                
                var height = item_height * len;
                
                if (data.view_length) {
                    data.$disassembly_content.height((height > 0 ) ? height + 10: 0);
                }
                
                if (data.is_need_render) {
                    data.$disassembly_items.find('.Disassembly_items_item:not(.__proto)').remove();
                }

                data.$current && data.$current.removeClass('Disassembly__current');

                data.instructions &&
                data.instructions.every(function (instruction, instruction_i) {
                    if (data.is_need_render) {
                        var $item = data.$disassembly_items_item__proto.clone();
                        $item.removeClass('__proto');
                        $item.appendTo(data.$disassembly_items);
    
                        instruction.Disassembly[data.id].$item = $item;
                        instruction.Disassembly[data.id].$item_bp = $item.find('.Disassembly_items_item_bp');
                        instruction.Disassembly[data.id].$item_addr = $item.find('.Disassembly_items_item_addr');
                        instruction.Disassembly[data.id].$item_addr_val = $item.find('.Disassembly_items_item_addr_val');
                        instruction.Disassembly[data.id].$item_asm = $item.find('.Disassembly_items_item_asm');
                        instruction.Disassembly[data.id].$item_asm_mnemonic = $item.find('.Disassembly_items_item_asm_mnemonic');
                        instruction.Disassembly[data.id].$item_asm_expression = $item.find('.Disassembly_items_item_asm_expression');
                        instruction.Disassembly[data.id].$item_location = $item.find('.Disassembly_items_item_location');
    
                        instruction.Disassembly[data.id].$item_addr_val.html('0x'+instruction.addr.toString(16));
    
                        var tokens = instruction.asm.split(' ');
                        var mnemonic = tokens[0];
                        var expression = tokens.slice(1).join(' ').replace(',', ', ');
                        
                        instruction.Disassembly[data.id].$item_asm_mnemonic.text(mnemonic);
                        instruction.Disassembly[data.id].$item_asm_expression.text(expression);

                        instruction.Disassembly[data.id].$item_bp.on('click.Disassembly', function (event) {
                            $disassembly.trigger('Disassembly_breakpoints_toggle', {
                                instruction: instruction
                            });
                        });
                    }

                    if (instruction.addr == data.pc) {
                        instruction.Disassembly[data.id].$item.addClass('Disassembly__current');
                        data.$current = instruction.Disassembly[data.id].$item;
                    }

                    return true;
                });

                if (data.last_rendered_pc != data.pc) {
                    data.last_rendered_pc = data.pc;
                    
                    if (data.$current && !parameters.dont_scroll) {
                        if (data.view_length) {
                            data.$disassembly_content.scrollTop(data.$current[0].offsetTop - (data.$current.outerHeight() * ((data.view_length-1)/2)));
                        } else {
                            data.$disassembly_content.scrollTop(data.$current[0].offsetTop - (data.$disassembly.innerHeight() / 2));
                        }
                    }
                }
            };

            data.clear = function () {
                data.instructions = [];
            };
            
            data.setViewLength = function (parameters) {
                data.view_length = parameters.view_length;
            };

            data.setIsResizable = function (is_resizable) {
                if (data.is_resizable = is_resizable) {
                    data.$disassembly_content.css('resize', 'none');
                }
            };

            $disassembly.on('Disassembly_initialize.Disassembly', function (event) {
                data.init();
            });

            $disassembly.on('Disassembly_comply.Disassembly', function (event) {
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

    $.fn.Disassembly.HTML = `
        <div class="Disassembly">
            <div class="Disassembly_content">
                <div class="Disassembly_items">
                    <div class="Disassembly_items_item __proto">
                        <div class="Disassembly_items_item_bp">
                            <div class="Disassembly_items_item_bp_icon">
                            </div>
                        </div>
                        <div class="Disassembly_items_item_addr">
                            <span class="Disassembly_items_item_addr_val"></span>
                        </div>
                        <div class="Disassembly_items_item_asm">
                            <div class="Disassembly_items_item_asm_mnemonic"></div>
                            <div class="Disassembly_items_item_asm_expression"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;

    $.fn.Disassembly.new = function ($append_to) {
        var $disassembly = $($.fn.Disassembly.HTML);
        var disassembly;
        
        if ($append_to) {
            $disassembly.appendTo($append_to);
        }

        $disassembly.Disassembly();
        disassembly = $disassembly.data().Disassembly;
        
        return {
            $disassembly,
            disassembly
        };
    };

    $.fn.Disassembly.id_i = 0;
})(jQuery);