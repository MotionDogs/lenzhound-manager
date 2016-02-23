'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Module = require('module');
var path = require('path');
var cachedVm = require('cached-run-in-this-context');
var crypto = require('crypto');

function computeHash(contents) {
  return crypto.createHash('sha1').update(contents, 'utf8').digest('hex');
}

var NativeCompileCache = function () {
  function NativeCompileCache() {
    _classCallCheck(this, NativeCompileCache);

    this.cacheStore = null;
    this.previousModuleCompile = null;
  }

  _createClass(NativeCompileCache, [{
    key: 'setCacheStore',
    value: function setCacheStore(store) {
      this.cacheStore = store;
    }
  }, {
    key: 'setV8Version',
    value: function setV8Version(v8Version) {
      this.v8Version = v8Version.toString();
    }
  }, {
    key: 'install',
    value: function install() {
      this.savePreviousModuleCompile();
      this.overrideModuleCompile();
    }
  }, {
    key: 'uninstall',
    value: function uninstall() {
      this.restorePreviousModuleCompile();
    }
  }, {
    key: 'savePreviousModuleCompile',
    value: function savePreviousModuleCompile() {
      this.previousModuleCompile = Module.prototype._compile;
    }
  }, {
    key: 'overrideModuleCompile',
    value: function overrideModuleCompile() {
      var self = this;
      var resolvedArgv = null;
      // Here we override Node's module.js
      // (https://github.com/atom/node/blob/atom/lib/module.js#L378), changing
      // only the bits that affect compilation in order to use the cached one.
      Module.prototype._compile = function (content, filename) {
        var moduleSelf = this;
        // remove shebang
        content = content.replace(/^\#\!.*/, '');
        function require(path) {
          return moduleSelf.require(path);
        }
        require.resolve = function (request) {
          return Module._resolveFilename(request, moduleSelf);
        };
        require.main = process.mainModule;

        // Enable support to add extra extension types
        require.extensions = Module._extensions;
        require.cache = Module._cache;

        var dirname = path.dirname(filename);

        // create wrapper function
        var wrapper = Module.wrap(content);

        var cacheKey = filename;
        var invalidationKey = computeHash(wrapper + self.v8Version);
        var compiledWrapper = null;
        if (self.cacheStore.has(cacheKey, invalidationKey)) {
          var buffer = self.cacheStore.get(cacheKey, invalidationKey);
          var compilationResult = cachedVm.runInThisContextCached(wrapper, filename, buffer);
          compiledWrapper = compilationResult.result;
          if (compilationResult.wasRejected) {
            self.cacheStore.delete(cacheKey);
          }
        } else {
          var compilationResult = cachedVm.runInThisContext(wrapper, filename);
          if (compilationResult.cacheBuffer) {
            self.cacheStore.set(cacheKey, invalidationKey, compilationResult.cacheBuffer);
          }
          compiledWrapper = compilationResult.result;
        }
        if (global.v8debug) {
          if (!resolvedArgv) {
            // we enter the repl if we're not given a filename argument.
            if (process.argv[1]) {
              resolvedArgv = Module._resolveFilename(process.argv[1], null);
            } else {
              resolvedArgv = 'repl';
            }
          }

          // Set breakpoint on module start
          if (filename === resolvedArgv) {
            // Installing this dummy debug event listener tells V8 to start
            // the debugger.  Without it, the setBreakPoint() fails with an
            // 'illegal access' error.
            global.v8debug.Debug.setListener(function () {});
            global.v8debug.Debug.setBreakPoint(compiledWrapper, 0, 0);
          }
        }
        var args = [moduleSelf.exports, require, moduleSelf, filename, dirname, process, global];
        return compiledWrapper.apply(moduleSelf.exports, args);
      };
    }
  }, {
    key: 'restorePreviousModuleCompile',
    value: function restorePreviousModuleCompile() {
      Module.prototype._compile = this.previousModuleCompile;
    }
  }]);

  return NativeCompileCache;
}();

module.exports = new NativeCompileCache();