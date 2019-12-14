/*
 * gdb-frontend is a easy, flexible and extensionable gui debugger
 *
 * https://github.com/rohanrhu/gdb-frontend
 * https://oguzhaneroglu.com/projects/gdb-frontend/
 *
 * Licensed under GNU/GPLv3
 * Copyright (C) 2019, Oğuzhan Eroğlu (https://oguzhaneroglu.com/) <rohanrhu2@gmail.com>
*/

var AsynchronousSemaphore = function (callback, this_arg) {
    this.lock_count = 0;

    if (callback) this.callback = callback;

    if (this_arg === undefined) {
        this_arg = null;
    }

    this.this_arg = this_arg;
};

AsynchronousSemaphore.prototype.setCallback = function (callback, this_arg) {
    this.callback = callback;

    if (this_arg === undefined) {
        this_arg = null;
    }

    this.this_arg = this_arg;
};

AsynchronousSemaphore.prototype.lock = function (increment) {
    this.lock_count += increment ? increment : 1
};

AsynchronousSemaphore.prototype.leave = function (decrement, parameters, carrying_parameters) {
    if (decrement === undefined) {
        decrement = 1;
    }

    if (carrying_parameters) {
        Object.keys(carrying_parameters).forEach(function(_k) {
            this[_k] = carrying_parameters[_k]
        }, this);
    }

    if (this.lock_count > 0) {
        this.lock_count = this.lock_count - decrement;
        if (this.lock_count == 0) this.callback.apply(this.this_arg, parameters);
    }
};

AsynchronousSemaphore.prototype.leaveCall = function (decrement, parameters, carrying_parameters) {
    if (decrement === undefined) {
        decrement = 1;
    }

    if (carrying_parameters) {
        Object.keys(carrying_parameters).forEach(function(_k) {
            this.callback[_k] = carrying_parameters[_k]
        }, this)
    }

    if (this.lock_count > 0) {
        this.lock_count = this.lock_count - decrement;
    }

    if (this.lock_count == 0) this.callback.apply(this.this_arg, parameters);
}