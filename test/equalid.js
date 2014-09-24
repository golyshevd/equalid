/*global describe, it*/

var _ = require('lodash-node');
var util = require('util');
var assert = require('assert');

Object.prototype.bug = 42;

function getArgs () {
    return arguments;
}

describe('equalid', function () {
    var equalid = require('../');

    var samples = [
        [1, 1],
        [null, null],
        [void 0, void 0],
        ['hi', 'hi'],
        [
            [],
            []
        ],
        [
            [1, 2],
            [1, 2]
        ],
        [
            {a: 42, b: [1, 2, 3]},
            {a: 42, b: [1, 2, 3]}
        ],
        [
            {a: it},
            {a: it}
        ],
        [
            new Date(123),
            new Date(123)
        ],
        [
            /pron/g,
            /pron/g
        ],
        [
            getArgs(1, 2),
            getArgs(1, 2)
        ],
        [
            {x: 1, xxx: 3},
            {x: 1, xxx: 3}
        ],
        [
            {x: 1, xxx: 3, xx: 2},
            {x: 1, xx: 2, xxx: 3}
        ],
        [
            {xxx: 3, x: 1},
            {x: 1, xxx: 3}
        ],
        [
            {xxx: 3, x: 1, xxxx: 4},
            {xxx: 3, xxxx: 4, x: 1}
        ]
    ];

    var header = '%j should be equal to %j';

    _.forEach(samples, function (s) {
        var should = util.format(header, s[0], s[1]);

        it(should, function () {
            assert.strictEqual(equalid(s[0]), equalid(s[1]));
        });
    });

});
