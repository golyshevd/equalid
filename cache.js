'use strict';

var Deque = require('double-ended-queue');
var equalid = require('./equalid');

function Cache (size) {
    this.__keys = new Deque();
    this.__size = size;
    this.__vals = Object.create(null);
}

Cache.prototype.get = function (key) {
    return this.__vals[equalid(key)];
};

Cache.prototype.set = function (key, val) {
    var rKey;
    key = equalid(key);

    if (!(key in this.__vals)) {
        this.__keys.push(key);
    }

    while (this.__keys.length > this.__size) {
        rKey = this.__keys.shift();

        delete this.__vals[rKey];
    }

    this.__vals[key] = val;

    return this;
};

module.exports = Cache;
