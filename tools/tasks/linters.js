'use strict';

var EXCLUDE = [];
var LINTER_PATHS = [
    'tools/**/*.js',
    '*.js'
];

var JscsChecker = require('jscs');
var EslintConfig = require('eslint/lib/config');

var _ = require('lodash-node');
var eslintLinter = require('eslint').linter;
var eslintStylishFormatter = require('eslint/lib/formatters/stylish');
var glob = require('glob');
var gutil = require('gulp-util');
var jscsConfig = require('jscs/lib/cli-config');
var minimatch = require('minimatch');
var linterPaths = extendPatterns(LINTER_PATHS, EXCLUDE);
var vow = require('vow');
var vowFs = require('vow-fs');

function isExcluded(path, patterns, opts) {

    return _.some(patterns, function (pattern) {

        return minimatch(path, pattern, opts);
    });
}

function extendPatterns(include, exclude) {
    var paths = _.reduce(include, function (patterns, pattern) {

        return patterns.concat(glob.sync(pattern));
    }, []);

    paths = _.filter(paths, function (path) {

        return !isExcluded(path, exclude);
    });

    return paths;
}

function readFiles(paths) {
    var sources = _.map(paths, function (path) {

        return vowFs.read(path, 'utf-8').then(function (data) {

            return {
                data: data,
                path: path
            };
        });
    });

    return vow.all(sources);
}

function eslintPromise(paths, configPath) {
    var config = new EslintConfig({
        configFile: configPath
    });

    config = config.useSpecificConfig;

    return readFiles(paths).then(function (sources) {

        return _.map(sources, function (source) {

            return {
                filePath: source.path,
                messages: eslintLinter.verify(source.data, config, source.path)
            };
        });
    });
}

function jscsPromise(paths, config) {
    var checker = new JscsChecker();

    config = jscsConfig.load(config);

    checker.registerDefaultRules();
    checker.configure(config);

    paths = _.map(paths, function (path) {

        return checker.checkFile(path);
    });

    return vow.all(paths).then(function (paths) {

        return _.reduce(paths, function (stdout, errors) {
            var errorList = errors.getErrorList();

            errorList = _.reduce(errorList, function (result, error) {

                return result.concat(errors.explainError(error, true));
            }, []);

            return stdout.concat(errorList);
        }, []);
    });
}

function runEslint(done) {
    /*eslint no-console: 0*/
    eslintPromise(linterPaths, '.eslintrc')
        .done(function (results) {
            var message;

            if (_.isEmpty(results)) {
                return done();
            }

            message = eslintStylishFormatter(results);

            //  среди сообщений есть ОШИБКИ (там могут быть просто ворнинги)
            if (_.find(results, {messages: [{severity: 2}]})) {
                return done(new gutil.PluginError('eslint-linter', message));
            }

            console.log(message);

            done();
        }, done);
}

function runJscs(done) {
    jscsPromise(linterPaths, '.jscsrc')
        .done(function (stdout) {
            if (_.isEmpty(stdout)) {
                return done();
            }

            stdout = stdout.join('\n\n');
            stdout = new gutil.PluginError('jscs-checker', stdout);

            done(stdout);
        }, done);
}

module.exports = function () {
    this.task('jscs', [], runJscs);
    this.task('eslint', [], runEslint);
    this.task('lint', ['jscs'], runEslint);
};
