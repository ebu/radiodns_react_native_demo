var __DEV__=true,__BUNDLE_START_TIME__=this.nativePerformanceNow?nativePerformanceNow():Date.now(),process=this.process||{};process.env=process.env||{};process.env.NODE_ENV="development";
(function (global) {
  "use strict";

  global.__r = metroRequire;
  global.__d = define;
  global.__c = clear;
  global.__registerSegment = registerSegment;
  var modules = clear();
  var EMPTY = {};
  var _ref = {},
      hasOwnProperty = _ref.hasOwnProperty;

  function clear() {
    modules = Object.create(null);
    return modules;
  }

  if (__DEV__) {
    var verboseNamesToModuleIds = Object.create(null);
    var initializingModuleIds = [];
  }

  function define(factory, moduleId, dependencyMap) {
    if (modules[moduleId] != null) {
      if (__DEV__) {
        var inverseDependencies = arguments[4];

        if (inverseDependencies) {
          global.__accept(moduleId, factory, dependencyMap, inverseDependencies);
        }
      }

      return;
    }

    modules[moduleId] = {
      dependencyMap: dependencyMap,
      factory: factory,
      hasError: false,
      importedAll: EMPTY,
      importedDefault: EMPTY,
      isInitialized: false,
      publicModule: {
        exports: {}
      }
    };

    if (__DEV__) {
      modules[moduleId].hot = createHotReloadingObject();
      var verboseName = arguments[3];

      if (verboseName) {
        modules[moduleId].verboseName = verboseName;
        verboseNamesToModuleIds[verboseName] = moduleId;
      }
    }
  }

  function metroRequire(moduleId) {
    if (__DEV__ && typeof moduleId === "string") {
      var verboseName = moduleId;
      moduleId = verboseNamesToModuleIds[verboseName];

      if (moduleId == null) {
        throw new Error('Unknown named module: "'.concat(verboseName, '"'));
      } else {
        console.warn('Requiring module "'.concat(verboseName, '" by name is only supported for ') + "debugging purposes and will BREAK IN PRODUCTION!");
      }
    }

    var moduleIdReallyIsNumber = moduleId;

    if (__DEV__) {
      var initializingIndex = initializingModuleIds.indexOf(moduleIdReallyIsNumber);

      if (initializingIndex !== -1) {
        var cycle = initializingModuleIds.slice(initializingIndex).map(function (id) {
          return modules[id].verboseName;
        });
        cycle.push(cycle[0]);
        console.warn("Require cycle: ".concat(cycle.join(" -> "), "\n\n") + "Require cycles are allowed, but can result in uninitialized values. " + "Consider refactoring to remove the need for a cycle.");
      }
    }

    var module = modules[moduleIdReallyIsNumber];
    return module && module.isInitialized ? module.publicModule.exports : guardedLoadModule(moduleIdReallyIsNumber, module);
  }

  function metroImportDefault(moduleId) {
    if (__DEV__ && typeof moduleId === "string") {
      var verboseName = moduleId;
      moduleId = verboseNamesToModuleIds[verboseName];
    }

    var moduleIdReallyIsNumber = moduleId;

    if (modules[moduleIdReallyIsNumber] && modules[moduleIdReallyIsNumber].importedDefault !== EMPTY) {
      return modules[moduleIdReallyIsNumber].importedDefault;
    }

    var exports = metroRequire(moduleIdReallyIsNumber);
    var importedDefault = exports && exports.__esModule ? exports.default : exports;
    return modules[moduleIdReallyIsNumber].importedDefault = importedDefault;
  }

  metroRequire.importDefault = metroImportDefault;

  function metroImportAll(moduleId) {
    if (__DEV__ && typeof moduleId === "string") {
      var verboseName = moduleId;
      moduleId = verboseNamesToModuleIds[verboseName];
    }

    var moduleIdReallyIsNumber = moduleId;

    if (modules[moduleIdReallyIsNumber] && modules[moduleIdReallyIsNumber].importedAll !== EMPTY) {
      return modules[moduleIdReallyIsNumber].importedAll;
    }

    var exports = metroRequire(moduleIdReallyIsNumber);
    var importedAll;

    if (exports && exports.__esModule) {
      importedAll = exports;
    } else {
      importedAll = {};

      if (exports) {
        for (var _key in exports) {
          if (hasOwnProperty.call(exports, _key)) {
            importedAll[_key] = exports[_key];
          }
        }
      }

      importedAll.default = exports;
    }

    return modules[moduleIdReallyIsNumber].importedAll = importedAll;
  }

  metroRequire.importAll = metroImportAll;
  var inGuard = false;

  function guardedLoadModule(moduleId, module) {
    if (!inGuard && global.ErrorUtils) {
      inGuard = true;
      var returnValue;

      try {
        returnValue = loadModuleImplementation(moduleId, module);
      } catch (e) {
        global.ErrorUtils.reportFatalError(e);
      }

      inGuard = false;
      return returnValue;
    } else {
      return loadModuleImplementation(moduleId, module);
    }
  }

  var ID_MASK_SHIFT = 16;
  var LOCAL_ID_MASK = ~0 >>> ID_MASK_SHIFT;

  function unpackModuleId(moduleId) {
    var segmentId = moduleId >>> ID_MASK_SHIFT;
    var localId = moduleId & LOCAL_ID_MASK;
    return {
      segmentId: segmentId,
      localId: localId
    };
  }

  metroRequire.unpackModuleId = unpackModuleId;

  function packModuleId(value) {
    return (value.segmentId << ID_MASK_SHIFT) + value.localId;
  }

  metroRequire.packModuleId = packModuleId;
  var hooks = [];

  function registerHook(cb) {
    var hook = {
      cb: cb
    };
    hooks.push(hook);
    return {
      release: function release() {
        for (var i = 0; i < hooks.length; ++i) {
          if (hooks[i] === hook) {
            hooks.splice(i, 1);
            break;
          }
        }
      }
    };
  }

  metroRequire.registerHook = registerHook;
  var moduleDefinersBySegmentID = [];

  function registerSegment(segmentID, moduleDefiner) {
    moduleDefinersBySegmentID[segmentID] = moduleDefiner;
  }

  function loadModuleImplementation(moduleId, module) {
    if (!module && moduleDefinersBySegmentID.length > 0) {
      var _unpackModuleId = unpackModuleId(moduleId),
          segmentId = _unpackModuleId.segmentId,
          localId = _unpackModuleId.localId;

      var definer = moduleDefinersBySegmentID[segmentId];

      if (definer != null) {
        definer(localId);
        module = modules[moduleId];
      }
    }

    var nativeRequire = global.nativeRequire;

    if (!module && nativeRequire) {
      var _unpackModuleId2 = unpackModuleId(moduleId),
          _segmentId = _unpackModuleId2.segmentId,
          _localId = _unpackModuleId2.localId;

      nativeRequire(_localId, _segmentId);
      module = modules[moduleId];
    }

    if (!module) {
      throw unknownModuleError(moduleId);
    }

    if (module.hasError) {
      throw moduleThrewError(moduleId, module.error);
    }

    if (__DEV__) {
      var Systrace = metroRequire.Systrace;
    }

    module.isInitialized = true;
    var _module = module,
        factory = _module.factory,
        dependencyMap = _module.dependencyMap;

    if (__DEV__) {
      initializingModuleIds.push(moduleId);
    }

    try {
      if (__DEV__) {
        Systrace.beginEvent("JS_require_" + (module.verboseName || moduleId));
      }

      var _moduleObject = module.publicModule;

      if (__DEV__) {
        if (module.hot) {
          _moduleObject.hot = module.hot;
        }
      }

      _moduleObject.id = moduleId;

      if (hooks.length > 0) {
        for (var i = 0; i < hooks.length; ++i) {
          hooks[i].cb(moduleId, _moduleObject);
        }
      }

      factory(global, metroRequire, metroImportDefault, metroImportAll, _moduleObject, _moduleObject.exports, dependencyMap);

      if (!__DEV__) {
        module.factory = undefined;
        module.dependencyMap = undefined;
      }

      if (__DEV__) {
        Systrace.endEvent();
      }

      return _moduleObject.exports;
    } catch (e) {
      module.hasError = true;
      module.error = e;
      module.isInitialized = false;
      module.publicModule.exports = undefined;
      throw e;
    } finally {
      if (__DEV__) {
        if (initializingModuleIds.pop() !== moduleId) {
          throw new Error("initializingModuleIds is corrupt; something is terribly wrong");
        }
      }
    }
  }

  function unknownModuleError(id) {
    var message = 'Requiring unknown module "' + id + '".';

    if (__DEV__) {
      message += "If you are sure the module is there, try restarting Metro Bundler. " + "You may also want to run `yarn`, or `npm install` (depending on your environment).";
    }

    return Error(message);
  }

  function moduleThrewError(id, error) {
    var displayName = __DEV__ && modules[id] && modules[id].verboseName || id;
    return Error('Requiring module "' + displayName + '", which threw an exception: ' + error);
  }

  if (__DEV__) {
    metroRequire.Systrace = {
      beginEvent: function beginEvent() {},
      endEvent: function endEvent() {}
    };

    metroRequire.getModules = function () {
      return modules;
    };

    var createHotReloadingObject = function createHotReloadingObject() {
      var hot = {
        acceptCallback: null,
        accept: function accept(callback) {
          hot.acceptCallback = callback;
        },
        disposeCallback: null,
        dispose: function dispose(callback) {
          hot.disposeCallback = callback;
        }
      };
      return hot;
    };

    var metroAcceptAll = function metroAcceptAll(dependentModules, inverseDependencies, patchedModules) {
      if (!dependentModules || dependentModules.length === 0) {
        return true;
      }

      var notAccepted = dependentModules.filter(function (module) {
        return !metroAccept(module, undefined, undefined, inverseDependencies, patchedModules);
      });
      var parents = [];

      for (var i = 0; i < notAccepted.length; i++) {
        if (inverseDependencies[notAccepted[i]].length === 0) {
          return false;
        }

        parents.push.apply(parents, inverseDependencies[notAccepted[i]]);
      }

      return parents.length == 0;
    };

    var metroAccept = function metroAccept(id, factory, dependencyMap, inverseDependencies) {
      var patchedModules = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : {};

      if (id in patchedModules) {
        return true;
      }

      patchedModules[id] = true;
      var mod = modules[id];

      if (!mod && factory) {
        return true;
      }

      var hot = mod.hot;

      if (!hot) {
        console.warn("Cannot accept module because Hot Module Replacement " + "API was not installed.");
        return false;
      }

      if (hot.disposeCallback) {
        try {
          hot.disposeCallback();
        } catch (error) {
          console.error("Error while calling dispose handler for module ".concat(id, ": "), error);
        }
      }

      if (factory) {
        mod.factory = factory;
      }

      if (dependencyMap) {
        mod.dependencyMap = dependencyMap;
      }

      mod.hasError = false;
      mod.isInitialized = false;
      metroRequire(id);

      if (hot.acceptCallback) {
        try {
          hot.acceptCallback();
          return true;
        } catch (error) {
          console.error("Error while calling accept handler for module ".concat(id, ": "), error);
        }
      }

      if (!inverseDependencies) {
        throw new Error("Undefined `inverseDependencies`");
      }

      return metroAcceptAll(inverseDependencies[id], inverseDependencies, patchedModules);
    };

    global.__accept = metroAccept;
  }
})(typeof global !== 'undefined' ? global : typeof window !== 'undefined' ? window : this);
__d(function (global, _$$_REQUIRE, _$$_IMPORT_DEFAULT, _$$_IMPORT_ALL, module, exports, _dependencyMap) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });

  var root_reducer_1 = _$$_REQUIRE(_dependencyMap[0], "./reducers/root-reducer");

  var MessageType;

  (function (MessageType) {
    MessageType["DISPATCH_ACTION"] = "DISPATCH_ACTION";
  })(MessageType || (MessageType = {}));

  root_reducer_1.store.subscribe(function () {
    LiquidCore.emit("UPDATE_STATE", {
      msg: JSON.stringify(root_reducer_1.store.getState())
    });
    console.log("OUIIII ON A RECUT LE SUBSCRIBE");
  });
  LiquidCore.on("EMIT_MESSAGE", function (rawMsg) {
    var msg = JSON.parse(rawMsg);
    console.log("YOU GOT MESSAGE!", rawMsg);

    switch (msg.type) {
      case MessageType.DISPATCH_ACTION:
        root_reducer_1.store.dispatch(msg.payload);
        break;

      default:
        console.warn("Unknown message type:", msg.type);
    }
  });
  console.log("READY!!!!!!", LiquidCore);
  LiquidCore.emit("READY");

  var theShowNeverEnds = function theShowNeverEnds() {
    return setTimeout(theShowNeverEnds, 1000);
  };

  theShowNeverEnds();
},0,[1],"artifactsKokoro/kokoro/CentralStateService.js");
__d(function (global, _$$_REQUIRE, _$$_IMPORT_DEFAULT, _$$_IMPORT_ALL, module, exports, _dependencyMap) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });

  var redux_1 = _$$_REQUIRE(_dependencyMap[0], "redux");

  var service_providers_1 = _$$_REQUIRE(_dependencyMap[1], "./service-providers");

  var stations_1 = _$$_REQUIRE(_dependencyMap[2], "./stations");

  exports.ROOT_REDUCER_INITIAL_STATE = {
    stations: stations_1.STATIONS_REDUCER_DEFAULT_STATE,
    serviceProviders: service_providers_1.SERVICE_PROVIDERS_REDUCER_DEFAULT_STATE
  };
  exports.store = redux_1.createStore(redux_1.combineReducers({
    stations: stations_1.reducer,
    serviceProviders: service_providers_1.reducer
  }));
},1,[2,5,6],"artifactsKokoro/kokoro/reducers/root-reducer.js");
__d(function (global, _$$_REQUIRE, _$$_IMPORT_DEFAULT, _$$_IMPORT_ALL, module, exports, _dependencyMap) {
  'use strict';

  Object.defineProperty(exports, '__esModule', {
    value: true
  });

  function _interopDefault(ex) {
    return ex && typeof ex === 'object' && 'default' in ex ? ex['default'] : ex;
  }

  var $$observable = _interopDefault(_$$_REQUIRE(_dependencyMap[0], "symbol-observable"));

  var randomString = function randomString() {
    return Math.random().toString(36).substring(7).split('').join('.');
  };

  var ActionTypes = {
    INIT: "@@redux/INIT" + randomString(),
    REPLACE: "@@redux/REPLACE" + randomString(),
    PROBE_UNKNOWN_ACTION: function PROBE_UNKNOWN_ACTION() {
      return "@@redux/PROBE_UNKNOWN_ACTION" + randomString();
    }
  };

  function isPlainObject(obj) {
    if (typeof obj !== 'object' || obj === null) return false;
    var proto = obj;

    while (Object.getPrototypeOf(proto) !== null) {
      proto = Object.getPrototypeOf(proto);
    }

    return Object.getPrototypeOf(obj) === proto;
  }

  function createStore(reducer, preloadedState, enhancer) {
    var _ref2;

    if (typeof preloadedState === 'function' && typeof enhancer === 'function' || typeof enhancer === 'function' && typeof arguments[3] === 'function') {
      throw new Error('It looks like you are passing several store enhancers to ' + 'createStore(). This is not supported. Instead, compose them ' + 'together to a single function');
    }

    if (typeof preloadedState === 'function' && typeof enhancer === 'undefined') {
      enhancer = preloadedState;
      preloadedState = undefined;
    }

    if (typeof enhancer !== 'undefined') {
      if (typeof enhancer !== 'function') {
        throw new Error('Expected the enhancer to be a function.');
      }

      return enhancer(createStore)(reducer, preloadedState);
    }

    if (typeof reducer !== 'function') {
      throw new Error('Expected the reducer to be a function.');
    }

    var currentReducer = reducer;
    var currentState = preloadedState;
    var currentListeners = [];
    var nextListeners = currentListeners;
    var isDispatching = false;

    function ensureCanMutateNextListeners() {
      if (nextListeners === currentListeners) {
        nextListeners = currentListeners.slice();
      }
    }

    function getState() {
      if (isDispatching) {
        throw new Error('You may not call store.getState() while the reducer is executing. ' + 'The reducer has already received the state as an argument. ' + 'Pass it down from the top reducer instead of reading it from the store.');
      }

      return currentState;
    }

    function subscribe(listener) {
      if (typeof listener !== 'function') {
        throw new Error('Expected the listener to be a function.');
      }

      if (isDispatching) {
        throw new Error('You may not call store.subscribe() while the reducer is executing. ' + 'If you would like to be notified after the store has been updated, subscribe from a ' + 'component and invoke store.getState() in the callback to access the latest state. ' + 'See https://redux.js.org/api-reference/store#subscribe(listener) for more details.');
      }

      var isSubscribed = true;
      ensureCanMutateNextListeners();
      nextListeners.push(listener);
      return function unsubscribe() {
        if (!isSubscribed) {
          return;
        }

        if (isDispatching) {
          throw new Error('You may not unsubscribe from a store listener while the reducer is executing. ' + 'See https://redux.js.org/api-reference/store#subscribe(listener) for more details.');
        }

        isSubscribed = false;
        ensureCanMutateNextListeners();
        var index = nextListeners.indexOf(listener);
        nextListeners.splice(index, 1);
      };
    }

    function dispatch(action) {
      if (!isPlainObject(action)) {
        throw new Error('Actions must be plain objects. ' + 'Use custom middleware for async actions.');
      }

      if (typeof action.type === 'undefined') {
        throw new Error('Actions may not have an undefined "type" property. ' + 'Have you misspelled a constant?');
      }

      if (isDispatching) {
        throw new Error('Reducers may not dispatch actions.');
      }

      try {
        isDispatching = true;
        currentState = currentReducer(currentState, action);
      } finally {
        isDispatching = false;
      }

      var listeners = currentListeners = nextListeners;

      for (var i = 0; i < listeners.length; i++) {
        var listener = listeners[i];
        listener();
      }

      return action;
    }

    function replaceReducer(nextReducer) {
      if (typeof nextReducer !== 'function') {
        throw new Error('Expected the nextReducer to be a function.');
      }

      currentReducer = nextReducer;
      dispatch({
        type: ActionTypes.REPLACE
      });
    }

    function observable() {
      var _ref;

      var outerSubscribe = subscribe;
      return _ref = {
        subscribe: function subscribe(observer) {
          if (typeof observer !== 'object' || observer === null) {
            throw new TypeError('Expected the observer to be an object.');
          }

          function observeState() {
            if (observer.next) {
              observer.next(getState());
            }
          }

          observeState();
          var unsubscribe = outerSubscribe(observeState);
          return {
            unsubscribe: unsubscribe
          };
        }
      }, _ref[$$observable] = function () {
        return this;
      }, _ref;
    }

    dispatch({
      type: ActionTypes.INIT
    });
    return _ref2 = {
      dispatch: dispatch,
      subscribe: subscribe,
      getState: getState,
      replaceReducer: replaceReducer
    }, _ref2[$$observable] = observable, _ref2;
  }

  function warning(message) {
    if (typeof console !== 'undefined' && typeof console.error === 'function') {
      console.error(message);
    }

    try {
      throw new Error(message);
    } catch (e) {}
  }

  function getUndefinedStateErrorMessage(key, action) {
    var actionType = action && action.type;
    var actionDescription = actionType && "action \"" + String(actionType) + "\"" || 'an action';
    return "Given " + actionDescription + ", reducer \"" + key + "\" returned undefined. " + "To ignore an action, you must explicitly return the previous state. " + "If you want this reducer to hold no value, you can return null instead of undefined.";
  }

  function getUnexpectedStateShapeWarningMessage(inputState, reducers, action, unexpectedKeyCache) {
    var reducerKeys = Object.keys(reducers);
    var argumentName = action && action.type === ActionTypes.INIT ? 'preloadedState argument passed to createStore' : 'previous state received by the reducer';

    if (reducerKeys.length === 0) {
      return 'Store does not have a valid reducer. Make sure the argument passed ' + 'to combineReducers is an object whose values are reducers.';
    }

    if (!isPlainObject(inputState)) {
      return "The " + argumentName + " has unexpected type of \"" + {}.toString.call(inputState).match(/\s([a-z|A-Z]+)/)[1] + "\". Expected argument to be an object with the following " + ("keys: \"" + reducerKeys.join('", "') + "\"");
    }

    var unexpectedKeys = Object.keys(inputState).filter(function (key) {
      return !reducers.hasOwnProperty(key) && !unexpectedKeyCache[key];
    });
    unexpectedKeys.forEach(function (key) {
      unexpectedKeyCache[key] = true;
    });
    if (action && action.type === ActionTypes.REPLACE) return;

    if (unexpectedKeys.length > 0) {
      return "Unexpected " + (unexpectedKeys.length > 1 ? 'keys' : 'key') + " " + ("\"" + unexpectedKeys.join('", "') + "\" found in " + argumentName + ". ") + "Expected to find one of the known reducer keys instead: " + ("\"" + reducerKeys.join('", "') + "\". Unexpected keys will be ignored.");
    }
  }

  function assertReducerShape(reducers) {
    Object.keys(reducers).forEach(function (key) {
      var reducer = reducers[key];
      var initialState = reducer(undefined, {
        type: ActionTypes.INIT
      });

      if (typeof initialState === 'undefined') {
        throw new Error("Reducer \"" + key + "\" returned undefined during initialization. " + "If the state passed to the reducer is undefined, you must " + "explicitly return the initial state. The initial state may " + "not be undefined. If you don't want to set a value for this reducer, " + "you can use null instead of undefined.");
      }

      if (typeof reducer(undefined, {
        type: ActionTypes.PROBE_UNKNOWN_ACTION()
      }) === 'undefined') {
        throw new Error("Reducer \"" + key + "\" returned undefined when probed with a random type. " + ("Don't try to handle " + ActionTypes.INIT + " or other actions in \"redux/*\" ") + "namespace. They are considered private. Instead, you must return the " + "current state for any unknown actions, unless it is undefined, " + "in which case you must return the initial state, regardless of the " + "action type. The initial state may not be undefined, but can be null.");
      }
    });
  }

  function combineReducers(reducers) {
    var reducerKeys = Object.keys(reducers);
    var finalReducers = {};

    for (var i = 0; i < reducerKeys.length; i++) {
      var key = reducerKeys[i];

      if (process.env.NODE_ENV !== 'production') {
        if (typeof reducers[key] === 'undefined') {
          warning("No reducer provided for key \"" + key + "\"");
        }
      }

      if (typeof reducers[key] === 'function') {
        finalReducers[key] = reducers[key];
      }
    }

    var finalReducerKeys = Object.keys(finalReducers);
    var unexpectedKeyCache;

    if (process.env.NODE_ENV !== 'production') {
      unexpectedKeyCache = {};
    }

    var shapeAssertionError;

    try {
      assertReducerShape(finalReducers);
    } catch (e) {
      shapeAssertionError = e;
    }

    return function combination(state, action) {
      if (state === void 0) {
        state = {};
      }

      if (shapeAssertionError) {
        throw shapeAssertionError;
      }

      if (process.env.NODE_ENV !== 'production') {
        var warningMessage = getUnexpectedStateShapeWarningMessage(state, finalReducers, action, unexpectedKeyCache);

        if (warningMessage) {
          warning(warningMessage);
        }
      }

      var hasChanged = false;
      var nextState = {};

      for (var _i = 0; _i < finalReducerKeys.length; _i++) {
        var _key = finalReducerKeys[_i];
        var reducer = finalReducers[_key];
        var previousStateForKey = state[_key];
        var nextStateForKey = reducer(previousStateForKey, action);

        if (typeof nextStateForKey === 'undefined') {
          var errorMessage = getUndefinedStateErrorMessage(_key, action);
          throw new Error(errorMessage);
        }

        nextState[_key] = nextStateForKey;
        hasChanged = hasChanged || nextStateForKey !== previousStateForKey;
      }

      return hasChanged ? nextState : state;
    };
  }

  function bindActionCreator(actionCreator, dispatch) {
    return function () {
      return dispatch(actionCreator.apply(this, arguments));
    };
  }

  function bindActionCreators(actionCreators, dispatch) {
    if (typeof actionCreators === 'function') {
      return bindActionCreator(actionCreators, dispatch);
    }

    if (typeof actionCreators !== 'object' || actionCreators === null) {
      throw new Error("bindActionCreators expected an object or a function, instead received " + (actionCreators === null ? 'null' : typeof actionCreators) + ". " + "Did you write \"import ActionCreators from\" instead of \"import * as ActionCreators from\"?");
    }

    var keys = Object.keys(actionCreators);
    var boundActionCreators = {};

    for (var i = 0; i < keys.length; i++) {
      var key = keys[i];
      var actionCreator = actionCreators[key];

      if (typeof actionCreator === 'function') {
        boundActionCreators[key] = bindActionCreator(actionCreator, dispatch);
      }
    }

    return boundActionCreators;
  }

  function _defineProperty(obj, key, value) {
    if (key in obj) {
      Object.defineProperty(obj, key, {
        value: value,
        enumerable: true,
        configurable: true,
        writable: true
      });
    } else {
      obj[key] = value;
    }

    return obj;
  }

  function _objectSpread(target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i] != null ? arguments[i] : {};
      var ownKeys = Object.keys(source);

      if (typeof Object.getOwnPropertySymbols === 'function') {
        ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) {
          return Object.getOwnPropertyDescriptor(source, sym).enumerable;
        }));
      }

      ownKeys.forEach(function (key) {
        _defineProperty(target, key, source[key]);
      });
    }

    return target;
  }

  function compose() {
    for (var _len = arguments.length, funcs = new Array(_len), _key = 0; _key < _len; _key++) {
      funcs[_key] = arguments[_key];
    }

    if (funcs.length === 0) {
      return function (arg) {
        return arg;
      };
    }

    if (funcs.length === 1) {
      return funcs[0];
    }

    return funcs.reduce(function (a, b) {
      return function () {
        return a(b.apply(void 0, arguments));
      };
    });
  }

  function applyMiddleware() {
    for (var _len = arguments.length, middlewares = new Array(_len), _key = 0; _key < _len; _key++) {
      middlewares[_key] = arguments[_key];
    }

    return function (createStore) {
      return function () {
        var store = createStore.apply(void 0, arguments);

        var _dispatch = function dispatch() {
          throw new Error("Dispatching while constructing your middleware is not allowed. " + "Other middleware would not be applied to this dispatch.");
        };

        var middlewareAPI = {
          getState: store.getState,
          dispatch: function dispatch() {
            return _dispatch.apply(void 0, arguments);
          }
        };
        var chain = middlewares.map(function (middleware) {
          return middleware(middlewareAPI);
        });
        _dispatch = compose.apply(void 0, chain)(store.dispatch);
        return _objectSpread({}, store, {
          dispatch: _dispatch
        });
      };
    };
  }

  function isCrushed() {}

  if (process.env.NODE_ENV !== 'production' && typeof isCrushed.name === 'string' && isCrushed.name !== 'isCrushed') {
    warning('You are currently using minified code outside of NODE_ENV === "production". ' + 'This means that you are running a slower development build of Redux. ' + 'You can use loose-envify (https://github.com/zertosh/loose-envify) for browserify ' + 'or setting mode to production in webpack (https://webpack.js.org/concepts/mode/) ' + 'to ensure you have the correct code for your production build.');
  }

  exports.createStore = createStore;
  exports.combineReducers = combineReducers;
  exports.bindActionCreators = bindActionCreators;
  exports.applyMiddleware = applyMiddleware;
  exports.compose = compose;
  exports.__DO_NOT_USE__ActionTypes = ActionTypes;
},2,[3],"node_modules/redux/lib/redux.js");
__d(function (global, _$$_REQUIRE, _$$_IMPORT_DEFAULT, _$$_IMPORT_ALL, module, exports, _dependencyMap) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });

  var _ponyfill = _$$_REQUIRE(_dependencyMap[0], "./ponyfill.js");

  var _ponyfill2 = _interopRequireDefault(_ponyfill);

  function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
      'default': obj
    };
  }

  var root;

  if (typeof self !== 'undefined') {
    root = self;
  } else if (typeof window !== 'undefined') {
    root = window;
  } else if (typeof global !== 'undefined') {
    root = global;
  } else if (typeof module !== 'undefined') {
    root = module;
  } else {
    root = Function('return this')();
  }

  var result = (0, _ponyfill2['default'])(root);
  exports['default'] = result;
},3,[4],"node_modules/symbol-observable/lib/index.js");
__d(function (global, _$$_REQUIRE, _$$_IMPORT_DEFAULT, _$$_IMPORT_ALL, module, exports, _dependencyMap) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports['default'] = symbolObservablePonyfill;

  function symbolObservablePonyfill(root) {
    var result;
    var _Symbol = root.Symbol;

    if (typeof _Symbol === 'function') {
      if (_Symbol.observable) {
        result = _Symbol.observable;
      } else {
        result = _Symbol('observable');
        _Symbol.observable = result;
      }
    } else {
      result = '@@observable';
    }

    return result;
  }

  ;
},4,[],"node_modules/symbol-observable/lib/ponyfill.js");
__d(function (global, _$$_REQUIRE, _$$_IMPORT_DEFAULT, _$$_IMPORT_ALL, module, exports, _dependencyMap) {
  "use strict";

  var __assign = this && this.__assign || function () {
    __assign = Object.assign || function (t) {
      for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];

        for (var p in s) {
          if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
        }
      }

      return t;
    };

    return __assign.apply(this, arguments);
  };

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  var SET_SERVICE_PROVIDERS = "radiodns_react_native_technical_demo/kokoro/service-providers/SET_SERVICE_PROVIDERS";
  exports.SERVICE_PROVIDERS_REDUCER_DEFAULT_STATE = {
    serviceProviders: []
  };

  function reducer(state, action) {
    if (state === void 0) {
      state = exports.SERVICE_PROVIDERS_REDUCER_DEFAULT_STATE;
    }

    switch (action.type) {
      case SET_SERVICE_PROVIDERS:
        return __assign({}, state, {
          serviceProviders: Array.from(action.serviceProviders)
        });

      default:
        return state;
    }
  }

  exports.reducer = reducer;

  exports.setServiceProviders = function (serviceProviders) {
    return {
      type: SET_SERVICE_PROVIDERS,
      serviceProviders: serviceProviders
    };
  };
},5,[],"artifactsKokoro/kokoro/reducers/service-providers.js");
__d(function (global, _$$_REQUIRE, _$$_IMPORT_DEFAULT, _$$_IMPORT_ALL, module, exports, _dependencyMap) {
  "use strict";

  var __assign = this && this.__assign || function () {
    __assign = Object.assign || function (t) {
      for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];

        for (var p in s) {
          if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
        }
      }

      return t;
    };

    return __assign.apply(this, arguments);
  };

  Object.defineProperty(exports, "__esModule", {
    value: true
  });

  var utilities_1 = _$$_REQUIRE(_dependencyMap[0], "../../utilities");

  var SET_STATION_PLAYLIST = "radiodns_react_native_technical_demo/kokoro/stations/SET_STATION_PLAYLIST";
  var SET_STATIONS_CURRENTLY_VISIBLE = "radiodns_react_native_technical_demo/kokoro/stations/SET_STATIONS_CURRENTLY_VISIBLE";
  var SET_ACTIVE = "radiodns_react_native_technical_demo/kokoro/stations/SET_ACTIVE";
  var SET_LOADING = "radiodns_react_native_technical_demo/kokoro/stations/SET_LOADING";
  var SET_PAUSED = "radiodns_react_native_technical_demo/kokoro/stations/SET_PAUSED";
  var SET_ACTIVE_NEXT = "radiodns_react_native_technical_demo/kokoro/stations/SET_ACTIVE_NEXT";
  var SET_ACTIVE_PREVIOUS = "radiodns_react_native_technical_demo/kokoro/stations/SET_ACTIVE_PREVIOUS";
  var SET_VOLUME = "radiodns_react_native_technical_demo/kokoro/stations/SET_VOLUME";
  var SET_ERROR = "radiodns_react_native_technical_demo/kokoro/stations/SET_ERROR";
  var SET_VISIBILITY = "radiodns_react_native_technical_demo/kokoro/stations/SET_VISIBILITY";
  exports.STATIONS_REDUCER_DEFAULT_STATE = {
    station_playlist: [],
    stations_currently_visible: [],
    activeStation: null,
    loading: true,
    paused: false,
    index: 0,
    volume: 1,
    error: false,
    searchedStation: ""
  };

  function reducer(state, action) {
    if (state === void 0) {
      state = exports.STATIONS_REDUCER_DEFAULT_STATE;
    }

    switch (action.type) {
      case SET_STATION_PLAYLIST:
        return __assign({}, state, {
          station_playlist: Array.from(action.stations)
        });

      case SET_STATIONS_CURRENTLY_VISIBLE:
        return __assign({}, state, {
          stations_currently_visible: Array.from(action.stations),
          searchedStation: ""
        });

      case SET_ACTIVE:
        return setActiveStationHelper(__assign({}, state, {
          activeStation: action.activeStation,
          error: false,
          paused: false
        }), getIndexFromActiveStation);

      case SET_LOADING:
        return __assign({}, state, {
          loading: action.loading,
          error: false
        });

      case SET_PAUSED:
        return __assign({}, state, {
          paused: action.paused
        });

      case SET_ACTIVE_NEXT:
        return setActiveStationHelper(__assign({}, state, {
          error: false,
          paused: false
        }), function (s) {
          return s.index - 1 >= 0 ? s.index - 1 : s.station_playlist.length - 1;
        });

      case SET_ACTIVE_PREVIOUS:
        return setActiveStationHelper(__assign({}, state, {
          error: false,
          paused: false
        }), function (s) {
          return s.index + 1 < s.station_playlist.length ? s.index + 1 : 0;
        });

      case SET_VOLUME:
        return __assign({}, state, {
          volume: action.volume
        });

      case SET_ERROR:
        return __assign({}, state, {
          error: action.error
        });

      case SET_VISIBILITY:
        return __assign({}, state, {
          searchedStation: action.searchedStation.toLocaleLowerCase()
        });

      default:
        return state;
    }
  }

  exports.reducer = reducer;

  exports.setStationPlaylist = function (stations) {
    return {
      type: SET_STATION_PLAYLIST,
      stations: stations
    };
  };

  exports.setStationsCurrentlyVisible = function (stations) {
    return {
      type: SET_STATIONS_CURRENTLY_VISIBLE,
      stations: stations
    };
  };

  exports.setActiveStation = function (activeStation) {
    return {
      type: SET_ACTIVE,
      activeStation: activeStation
    };
  };

  exports.setLoadingState = function (loading) {
    return {
      type: SET_LOADING,
      loading: loading
    };
  };

  exports.setPausedState = function (paused) {
    return {
      type: SET_PAUSED,
      paused: paused
    };
  };

  exports.setNextStation = function () {
    return {
      type: SET_ACTIVE_NEXT
    };
  };

  exports.setPreviousStation = function () {
    return {
      type: SET_ACTIVE_PREVIOUS
    };
  };

  exports.setVolume = function (volume) {
    return {
      type: SET_VOLUME,
      volume: volume
    };
  };

  exports.setError = function (error) {
    return {
      type: SET_ERROR,
      error: error
    };
  };

  exports.setStationsVisibility = function (searchedStation) {
    return {
      type: SET_VISIBILITY,
      searchedStation: searchedStation
    };
  };

  var setActiveStationHelper = function setActiveStationHelper(state, updateFn) {
    if (state.station_playlist.length === 0) {
      return state;
    }

    var index = updateFn(state);
    return __assign({}, state, {
      index: index,
      activeStation: state.station_playlist[index]
    });
  };

  var getIndexFromActiveStation = function getIndexFromActiveStation(state) {
    if (state.station_playlist.length === 0 || state.activeStation === null) {
      return -1;
    }

    var currentIndex = state.station_playlist.map(function (station) {
      return utilities_1.getBearer(station.bearer).id;
    }).indexOf(utilities_1.getBearer(state.activeStation.bearer).id);
    return currentIndex === -1 ? 0 : currentIndex;
  };
},6,[7],"artifactsKokoro/kokoro/reducers/stations.js");
__d(function (global, _$$_REQUIRE, _$$_IMPORT_DEFAULT, _$$_IMPORT_ALL, module, exports, _dependencyMap) {
  "use strict";

  var __assign = this && this.__assign || function () {
    __assign = Object.assign || function (t) {
      for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];

        for (var p in s) {
          if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
        }
      }

      return t;
    };

    return __assign.apply(this, arguments);
  };

  Object.defineProperty(exports, "__esModule", {
    value: true
  });

  exports.getMedia = function (medias) {
    if (medias && medias.length > 0) {
      return medias.reduce(function (best, current) {
        return current.width > best.width ? current : best;
      }).url;
    }

    return "";
  };

  exports.getBearer = function (bearers) {
    return __assign({}, Array.isArray(bearers) ? bearers.reduce(function (best, current) {
      return current.cost > best.cost ? current : best;
    }) : bearers);
  };

  exports.isWebScheme = function (url) {
    return /^(http:\/\/www\.|https:\/\/www\.|http:\/\/|https:\/\/)?[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,5}(:[0-9]{1,5})?(\/.*)?$/.test(url);
  };

  exports.noop = function () {};

  exports.commonWords = function (a, b) {
    return a.split(" ").reduce(function (acc, aWord) {
      return acc + b.split(" ").filter(function (bWord) {
        return bWord === aWord;
      }).length;
    }, 0);
  };

  exports.shuffleArray = function (a) {
    var array = Array.from(a);

    for (var i = array.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var x = array[i];
      array[i] = array[j];
      array[j] = x;
    }

    return array;
  };
},7,[],"artifactsKokoro/utilities.js");
__r(0);