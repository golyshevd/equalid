'use strict';

//  TODO support all the builtin types
//  etc. TypedArrays, Map, Set, DataView
//  if possible

var hasProperty = Object.prototype.hasOwnProperty;

function sortHashes(parts) {
    parts.sort(function (a, b) {
        if (a > b) {
            return 1;
        }

        //  key+value cant be equal
        return -1;
    });

    return parts;
}

//  need to hash properties?
function hashFunction(v) {
    if (!hasProperty.call(v, '__hash__')) {
        v.__hash__ = Math.random();
    }

    return '-0' + hashObject(v);
}

function hashNumber(v) {
    return '-1' + v;
}

function hashString(v) {
    var i;
    var l;
    var parts = '';

    for (i = 0, l = v.length; i < l; i += 1) {
        parts += hashNumber(v.charCodeAt(i));
    }

    return '-2' + parts;
}

function hashNull(v) {
    /*eslint no-unused-vars: 0*/
    return '-3';
}

function hashUndefined(v) {
    /*eslint no-unused-vars: 0*/
    return '-4';
}

function hashRegExp(v) {
    return '-5' + hashString(v.source) +
        hashBoolean(v.global) +
        hashBoolean(v.ignoreCase) +
        hashBoolean(v.multiline);
}

//  need to hash not indexed properties?
function hashArray(v) {
    var i;
    var l;
    var parts = '';

    for (i = 0, l = v.length; i < l; i += 1) {
        parts += hashAny(v[i]);
    }

    return '-6(' + parts + ')';
}

function hashObject(v) {
    var k;
    var parts = [];

    for (k in v) {
        if (hasProperty.call(v, k)) {
            parts[parts.length] = hashOwnProperty(k, v[k]);
        } else {
            parts[parts.length] = hashInheritedProperty(k, v[k]);
        }
    }

    parts = sortHashes(parts);

    return '-7(' + parts.join('') + ')';
}

function hashBoolean(v) {
    return '-8' + Number(v);
}

function hashDate(v) {
    return '-9' + Number(v);
}

function hashArguments(v) {
    return '-a' + hashArray(v);
}

function hashOwnProperty(k, v) {
    return '-b' + hashString(k) + hashAny(v);
}

function hashInheritedProperty(k, v) {
    return '-c' + hashString(k) + hashAny(v);
}

function hashAny(v) {
    /*eslint complexity: 0*/
    var t;

    if (v === null) {
        return hashNull(v);
    }

    t = typeof v;

    if (t === 'object') {
        if (Array.isArray(v)) {
            return hashArray(v);
        }

        if (v instanceof RegExp) {
            return hashRegExp(v);
        }

        if (v instanceof Date) {
            return hashDate(v);
        }

        if (Object.prototype.toString.call(v) === '[object Arguments]') {
            return hashArguments(v);
        }

        return hashObject(v);
    }

    if (t === 'function') {
        return hashFunction(v);
    }

    if (t === 'number') {
        return hashNumber(v);
    }

    if (t === 'string') {
        return hashString(v);
    }

    if (t === 'boolean') {
        return hashBoolean(v);
    }

    return hashUndefined(v);
}

module.exports = function () {
    return hashArguments(arguments);
};
