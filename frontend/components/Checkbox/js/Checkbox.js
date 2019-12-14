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
    var methods = {
        init: function(parameters) {
            var t_init = this;
            var $elements = $(this);

            if (typeof parameters == 'undefined') {
                parameters = {};
            }

            t_init.parameters = parameters;

            if (t_init.parameters.label === undefined) {
                t_init.parameters.label = '';
            }

            $elements.each(function () {
                var $checkbox = $(this);
                var $checkbox_content_side1 = $checkbox.find('.Checkbox_content_side1');
                var $checkbox_content_side2 = $checkbox.find('.Checkbox_content_side2');
                var $checkbox_label = $checkbox.find('.Checkbox_label');
                var $checkbox_checker_s = $checkbox.find('.Checkbox_checker');
                var $checkbox_checker_prevent_s = $checkbox.find('.Checkbox_checker_prevent');
                var $checkbox_realCheckbox = $checkbox.find('.Checkbox_realCheckbox');
                var $checkbox_ri = $checkbox.find('.Checkbox_ri');

                var data = {};
                $checkbox.data('Checkbox', data);
                data.$checkbox = $checkbox;

                var attr_value;

                data.is_checked = false;
                data.is_passive = false;

                data.init = function () {
                    data.setLabel({label: t_init.parameters.label});

                    attr_value = $checkbox.attr('Checkbox_value');

                    if (!attr_value) {
                        attr_value = false;
                    } else {
                        attr_value = parseInt(attr_value) ? true: false;
                    }

                    if (attr_value) {
                        data.set({
                            checked: true,
                            atomic: true,
                            initial: true
                        });
                    } else {
                        data.set({
                            checked: false,
                            atomic: true,
                            initial: true
                        });
                    }
                };

                $checkbox.on('Checkbox_initialize', function (event, parameters) {
                    data.init();
                });

                data.setLabel = function (parameters) {
                    $checkbox_label.html(parameters.label);

                    if (!parameters.label.length) {
                        $checkbox_content_side2.hide();
                    } else {
                        $checkbox_content_side2.show();
                    }
                };

                data.set = function (parameters) {
                    if (typeof parameters.atomic == 'undefined') {
                        parameters.atomic = false;
                    }
                    if (typeof parameters.initial == 'undefined') {
                        parameters.initial = false;
                    }

                    if (parameters.checked) {
                        $checkbox.addClass('Checkbox__checked');
                        data.is_checked = true;
                    } else {
                        $checkbox.removeClass('Checkbox__checked');
                        data.is_checked = false;
                    }

                    $checkbox_realCheckbox.prop('checked', data.is_checked);
                    $checkbox_ri.val(data.is_checked ? 1: 0);

                    if (!parameters.atomic) {
                        $checkbox.trigger('Checkbox_changed', {initial: parameters.initial});
                    }
                };

                data.setPassive = function (parameters) {
                    $checkbox[(data.is_passive = parameters.passive) ? 'addClass': 'removeClass']('Checkbox__passive');
                };

                data.toggle = function (parameters) {
                    if (data.is_checked) {
                        data.set({
                            checked: false
                        });
                    } else {
                        data.set({
                            checked: true
                        });
                    }
                };

                $checkbox.on('Checkbox_is_checked', function (event, parameters) {
                    parameters.return({
                        is_checked: data.is_checked
                    });
                });

                $checkbox_checker_prevent_s.each(function () {
                    var $checkbox_checker_prevent = $(this);
                    $checkbox_checker_prevent.on('click.Checkbox', function (event) {
                        event.stopPropagation();
                    });
                });

                $checkbox_checker_s.each(function () {
                    var $checkbox_checker = $(this);
                    $checkbox_checker.on('click.Checkbox', function (event) {
                        if ($checkbox.hasClass('Checkbox__passive')) {
                            return;
                        }
                        data.toggle();
                    });
                });

                data.init();
            });
        },
        set: function (parameters) {
            var $checkbox_s = $(this);
            $checkbox_s.each(function () {
                var $checkbox = $(this);
                data.set(parameters);
            });
        },
        is_checked: function () {
            var $checkbox = $(this);
            return data.is_checked;
        },
        setPassive: function (parameters) {
            var $checkbox_s = $(this);
            $checkbox_s.each(function () {
                var $checkbox = $(this);
                data.setPassive(parameters);
            });
        }
    };

    $.fn.Checkbox = function(method) {
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method '+method+' does not exist on jQuery.Checkbox');
        }
    };
})(jQuery);