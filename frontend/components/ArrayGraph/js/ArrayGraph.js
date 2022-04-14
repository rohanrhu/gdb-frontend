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
            var $ArrayGraph = $(this);

            $ArrayGraph.off('.ArrayGraph');
            $ArrayGraph.find('*').off('.ArrayGraph');

            let current_data = $ArrayGraph.data('ArrayGraph');
            
            if (current_data) {
                $(window).off('ArrayGraph-' + current_data.id);
                $(document).off('ArrayGraph-' + current_data.id);
                $('html, body').off('ArrayGraph-' + current_data.id)
            }
            
            var data = {};
            $ArrayGraph.data('ArrayGraph', data);
            data.$ArrayGraph = $ArrayGraph;

            data.id = t_init.parameters.id ? t_init.parameters.id: ++$.fn.ArrayGraph.id_i;

            data.$ArrayGraph_map = $ArrayGraph.find('.ArrayGraph_map');
            data.$ArrayGraph_canvas = $ArrayGraph.find('.ArrayGraph_canvas');
            data.ArrayGraph_canvas = data.$ArrayGraph_canvas.get(0);

            data.animation_duration = 100;

            data.is_loading = false;
            data.is_passive = false;
            data.items = [];
            data.step_size = 55;
            data.padding = data.step_size;
            
            data.setLoading = function (is_loading) {
                data.is_loading = is_loading;
            };

            data.clear = function () {
                data.$ArrayGraph_items.find('.ArrayGraph_items_item:not(.__proto)').remove();
                data.items = [];
            };

            data.load = function (parameters) {
                if (parameters === undefined) {
                    data.items = [];
                    return;
                }

                if (!parameters.variable || !parameters.variable.members) {
                    data.items = [];
                    return;
                }
                
                data.items = parameters.variable.members;
            };
            
            data.render = function (parameters) {
                if (parameters === undefined) {
                    parameters = {};
                }

                const canvas = data.ArrayGraph_canvas;
                const ctx = data.ArrayGraph_canvas.getContext('2d');

                ctx.clearRect(0, 0, canvas.width, canvas.height);
                
                if (!data.items.length) {
                    return;
                }

                canvas.width = (data.items.length * data.step_size) + data.padding;
                canvas.height = 380;

                var max = 0;
                var min = 0;

                var origin_x = 0;
                var origin_y = canvas.height;

                var graph_min = data.padding;
                var graph_max = canvas.height - data.padding*2;
                var graph_step = graph_max / data.items.length;
                
                data.items.forEach(function (item, item_i) {
                    var value = parseInt(item.value);

                    if (Number.isNaN(value)) {
                        return;
                    }
                    
                    if (value > max) {
                        max = value;
                    }

                    if (value < min) {
                        min = value;
                    }
                });

                for (let i=0; i < data.items.length; i++) {
                    ctx.beginPath();
                    ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
                    ctx.lineWidth = 2;
                    ctx.moveTo(i * data.step_size, canvas.height - 10);
                    ctx.lineTo(i * data.step_size, canvas.height);
                    ctx.stroke();

                    ctx.beginPath();
                    ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
                    ctx.moveTo(i * data.step_size, canvas.height);
                    ctx.lineTo(i * data.step_size + data.step_size, canvas.height);
                    ctx.stroke();

                    ctx.beginPath();
                    ctx.font = '14px Arial';
                    ctx.fillStyle = 'rgba(255, 255, 255, 1)';
                    ctx.fillText(i, (i * data.step_size + data.step_size) - (5 * `${i}`.length), canvas.height - 15);
                }

                ctx.beginPath();
                ctx.strokeStyle = 'white';
                ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';

                var x = graph_min;
                var y = graph_max;
                var px = x;

                if (data.items.length) {
                    y = (parseInt(data.items[0].value) * graph_max) / max;
                    y = data.padding + (graph_max - y);
                }

                data.items.forEach(function (item, item_i) {
                    var value = parseInt(item.value);
                    
                    if (Number.isNaN(value)) {
                        return;
                    }

                    ctx.beginPath();
                    ctx.lineWidth = 2;
                    ctx.moveTo(px, y);
                    
                    y = (item.value * graph_max) / max;
                    y = data.padding + (graph_max - y);
                    
                    var tx = x - 10;
                    var ty = y + 35;

                    ctx.strokeStyle = 'white';
                    ctx.lineTo(x, y);
                    ctx.stroke();

                    ctx.beginPath();
                    ctx.fillStyle = 'white';
                    ctx.strokeStyle = 'rgba(50, 50, 50, 0.25)';
                    ctx.arc(x, y, 5, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.stroke();

                    var dmax = canvas.height - 30;
                    
                    if (dmax > 0) {
                        ctx.beginPath();
                        ctx.lineWidth = 1;
                        ctx.strokeStyle = 'rgba(255, 255, 255, 0.75)';

                        ctx.setLineDash([5, 15]);
                        ctx.moveTo(x, y);
                        ctx.lineTo(x, dmax);
                        ctx.stroke();
                        ctx.setLineDash([]);
                    }

                    ctx.lineWidth = 2;

                    ctx.beginPath();
                    ctx.font = '22px Arial';
                    ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
                    ctx.fillText(item.value, tx, ty);
                    
                    ctx.font = '16px Arial';
                    ctx.fillStyle = 'rgba(255, 255, 255, 1)';
                    ctx.fillText(item.value, tx+4, ty-3);

                    px = x;
                    x += data.step_size;
                });
            };

            $ArrayGraph.on('ArrayGraph_initialize.ArrayGraph.'+data.id, function (event) {
                data.init();
            });

            $ArrayGraph.on('ArrayGraph_comply.ArrayGraph.'+data.id, function (event) {
                data.comply();
            });

            data.init = function () {
                data.comply();
            };

            data.comply = function () {
                data.render();
            };

            data.init();
        });
    }

    $.fn.ArrayGraph = function(method) {
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method '+method+' does not exist on jQuery.ArrayGraph');
        }
    };

    $.fn.ArrayGraph.kvKey = function (parameters) {
        return 'ArrayGraph-'+parameters.data.id+':'+parameters.key;
    };

    $.fn.ArrayGraph.id_i = 0;
})(jQuery);