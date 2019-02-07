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

  var RadioDNSAutoAS_1 = _$$_REQUIRE(_dependencyMap[0], "../native-modules/events-and-signals/RadioDNSAutoAS");

  var utilities_1 = _$$_REQUIRE(_dependencyMap[1], "../utilities");

  var messages_1 = _$$_REQUIRE(_dependencyMap[2], "./messages");

  var root_reducer_1 = _$$_REQUIRE(_dependencyMap[3], "./reducers/root-reducer");

  var stations_1 = _$$_REQUIRE(_dependencyMap[4], "./reducers/stations");

  var spi_1 = _$$_REQUIRE(_dependencyMap[5], "./spi");

  var prevState = root_reducer_1.ROOT_REDUCER_INITIAL_STATE;
  root_reducer_1.store.subscribe(function () {
    var state = root_reducer_1.store.getState();
    LiquidCore.emit(messages_1.OutgoingMessageType.UPDATE_STATE, {
      msg: JSON.stringify(state)
    });

    if (prevState.stations.activeStation !== state.stations.activeStation && !!state.stations.activeStation) {
      var _a = state.stations.activeStation,
          mediumName = _a.mediumName,
          mediaDescription = _a.mediaDescription,
          bearer = _a.bearer;
      LiquidCore.emit(messages_1.OutgoingMessageType.PREPARE_NOTIFICATION, {
        title: mediumName || "",
        subtitle: "",
        imgUrl: utilities_1.getMedia(mediaDescription)
      });
      console.log("DEBUG: SET PLAYER URL:", utilities_1.getBearer(bearer).id);
      LiquidCore.emit(messages_1.OutgoingMessageType.SET_EXO_PLAYER_URL, {
        url: utilities_1.getBearer(bearer).id
      });
    }

    if (state.stations.activeStation !== null) {
      var playing = !state.stations.loading && !state.stations.paused && !state.stations.error;
      LiquidCore.emit(messages_1.OutgoingMessageType.DISPLAY_NOTIFICATION, {
        playing: playing
      });
      LiquidCore.emit(messages_1.OutgoingMessageType.SET_EXO_PLAYER_IS_PLAYING, {
        playing: playing
      });
    }

    console.log("THAT IS HOT ------>", prevState.stations.loading, state.stations.loading);

    if (prevState.stations.loading !== state.stations.loading) {
      LiquidCore.emit(messages_1.OutgoingMessageType.SEND_AUTO_SIGNAL, {
        signal: state.stations.loading ? RadioDNSAutoAS_1.Signal.UPDATE_MEDIA_STATE_TO_BUFFERING : RadioDNSAutoAS_1.Signal.UPDATE_MEDIA_STATE_TO_PLAYING
      });
    }

    if (!prevState.stations.error && state.stations.error) {
      LiquidCore.emit(messages_1.OutgoingMessageType.SEND_AUTO_SIGNAL, {
        signal: RadioDNSAutoAS_1.Signal.UPDATE_MEDIA_STATE_TO_ERROR
      });
    }

    prevState = __assign({}, state);
  });
  LiquidCore.on(messages_1.IncomingMessageType.EMIT_MESSAGE, function (rawMsg) {
    var msg = JSON.parse(rawMsg);

    switch (msg.type) {
      case messages_1.IncomingMessageType.DISPATCH_ACTION:
        root_reducer_1.store.dispatch(msg.payload);
        break;

      default:
        console.warn("Unknown message type:", msg.type);
    }
  });
  LiquidCore.on(messages_1.IncomingMessageType.UPDATE_STATE, function (e) {
    console.log("DEBUG: New playbacks tate form auto", e.STATE);

    switch (e.STATE) {
      case "PLAYING":
        if (e.CHANNEL_ID) {
          playFromId(e.CHANNEL_ID);
        } else {
          root_reducer_1.store.dispatch(stations_1.setPausedState(false));
        }

        break;

      case "STOPPED":
        LiquidCore.emit(messages_1.OutgoingMessageType.EXIT_APP);
        break;

      case "PAUSED":
        root_reducer_1.store.dispatch(stations_1.setPausedState(true));
        break;

      case "PREVIOUS":
        root_reducer_1.store.dispatch(stations_1.setNextStation());
        break;

      case "NEXT":
        root_reducer_1.store.dispatch(stations_1.setPreviousStation());
        break;

      default:
        console.warn("UNSUPPORTED COMMAND FROM ANDROID AUTO:", e.STATE);
    }
  });
  LiquidCore.on(messages_1.IncomingMessageType.PLAY_FROM_SEARCH_STRING, function (e) {
    var state = root_reducer_1.store.getState();

    if (!state.serviceProviders.serviceProviders || state.serviceProviders.serviceProviders.length === 0) {
      return;
    }

    var result = state.serviceProviders.serviceProviders.reduce(function (acc, spiCache) {
      return acc.concat(spiCache.stations);
    }, []).map(function (station) {
      return {
        id: utilities_1.getBearer(station.bearer).id,
        score: utilities_1.commonWords(station.shortName || "", e.search_string) + utilities_1.commonWords(station.mediumName || "", e.search_string) + utilities_1.commonWords(station.longName || "", e.search_string)
      };
    }).sort(function (a, b) {
      return b.score - a.score;
    })[0];
    playFromId(result.id);
    LiquidCore.emit(messages_1.OutgoingMessageType.UPDATE_CHANNEL_ID, {
      id: result.id
    });
  });
  LiquidCore.on(messages_1.IncomingMessageType.PLAY_RANDOM, function () {
    var state = root_reducer_1.store.getState();
    var scrambledArray = utilities_1.shuffleArray(state.serviceProviders.serviceProviders.filter(function (cacheContainer) {
      return cacheContainer.stations !== undefined;
    }).reduce(function (acc, cacheContainer) {
      return acc.concat(cacheContainer.stations);
    }, []).map(function (stations) {
      return utilities_1.getBearer(stations.bearer).id;
    }));
    playFromId(scrambledArray[0]);
  });
  LiquidCore.on(messages_1.IncomingMessageType.EXO_PLAYER_LOADING_UPDATE, function (e) {
    console.log("DEBUG: LOADING?", e.loading);
    root_reducer_1.store.dispatch(stations_1.setLoadingState(e.loading));
  });
  LiquidCore.on(messages_1.IncomingMessageType.EXO_PLAYER_ERROR, function (error) {
    console.log("ERROR:", error);
    root_reducer_1.store.dispatch(stations_1.setError(true));
  });
  LiquidCore.on(messages_1.IncomingMessageType.EXO_PLAYER_FINISHED, function () {
    console.log("FINISHED!");
    root_reducer_1.store.dispatch(stations_1.setPausedState(true));
  });

  var playFromId = function playFromId(channelId) {
    var state = root_reducer_1.store.getState();
    var stationGroup = state.serviceProviders.serviceProviders.map(function (spiCache) {
      return spiCache.stations;
    }).filter(function (stations) {
      return stations !== undefined;
    }).reduce(function (prev, current) {
      return current.filter(function (station) {
        return utilities_1.getBearer(station.bearer).id === channelId;
      }).length > 0 ? current : prev;
    }, []);
    root_reducer_1.store.dispatch(stations_1.setStationPlaylist(stationGroup));
    root_reducer_1.store.dispatch(stations_1.setActiveStation(stationGroup.reduce(function (prev, current) {
      return utilities_1.getBearer(current.bearer).id === channelId ? current : prev;
    })));
  };

  spi_1.parseAndCacheSPI(root_reducer_1.store).then(function () {
    return LiquidCore.emit(messages_1.OutgoingMessageType.READY);
  });

  var theShowNeverEnds = function theShowNeverEnds() {
    return setTimeout(theShowNeverEnds, 1000);
  };

  theShowNeverEnds();
},0,[1,2,3,4,9,10],"artifactsKokoro/kokoro/CentralStateService.js");
__d(function (global, _$$_REQUIRE, _$$_IMPORT_DEFAULT, _$$_IMPORT_ALL, module, exports, _dependencyMap) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  var Signal;

  (function (Signal) {
    Signal[Signal["UPDATE_MEDIA_STATE_TO_PLAYING"] = 100] = "UPDATE_MEDIA_STATE_TO_PLAYING";
    Signal[Signal["UPDATE_MEDIA_STATE_TO_BUFFERING"] = 101] = "UPDATE_MEDIA_STATE_TO_BUFFERING";
    Signal[Signal["UPDATE_MEDIA_STATE_TO_ERROR"] = 102] = "UPDATE_MEDIA_STATE_TO_ERROR";
  })(Signal = exports.Signal || (exports.Signal = {}));
},1,[],"artifactsKokoro/native-modules/events-and-signals/RadioDNSAutoAS.js");
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
},2,[],"artifactsKokoro/utilities.js");
__d(function (global, _$$_REQUIRE, _$$_IMPORT_DEFAULT, _$$_IMPORT_ALL, module, exports, _dependencyMap) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  var IncomingMessageType;

  (function (IncomingMessageType) {
    IncomingMessageType["DISPATCH_ACTION"] = "DISPATCH_ACTION";
    IncomingMessageType["EMIT_STORAGE_ITEM_GET_COMPLETED"] = "EMIT_STORAGE_ITEM_GET_COMPLETED";
    IncomingMessageType["EMIT_STORAGE_ITEM_SET_COMPLETED"] = "EMIT_STORAGE_ITEM_SET_COMPLETED";
    IncomingMessageType["HTTP_CALL_RESPONSE"] = "HTTP_CALL_RESPONSE";
    IncomingMessageType["HTTP_CALL_ERROR"] = "HTTP_CALL_ERROR";
    IncomingMessageType["EXO_PLAYER_LOADING_UPDATE"] = "EXO_PLAYER_LOADING_UPDATE";
    IncomingMessageType["EXO_PLAYER_ERROR"] = "EXO_PLAYER_ERROR";
    IncomingMessageType["EXO_PLAYER_FINISHED"] = "EXO_PLAYER_FINISHED";
    IncomingMessageType["EMIT_MESSAGE"] = "EMIT_MESSAGE";
    IncomingMessageType["PLAY_RANDOM"] = "PLAY_RANDOM";
    IncomingMessageType["PLAY_FROM_SEARCH_STRING"] = "PLAY_FROM_SEARCH_STRING";
    IncomingMessageType["UPDATE_STATE"] = "UPDATE_STATE";
  })(IncomingMessageType = exports.IncomingMessageType || (exports.IncomingMessageType = {}));

  var OutgoingMessageType;

  (function (OutgoingMessageType) {
    OutgoingMessageType["SET_EXO_PLAYER_IS_PLAYING"] = "SET_EXO_PLAYER_IS_PLAYING";
    OutgoingMessageType["SET_ITEM_STORAGE_INTENT"] = "SET_ITEM_STORAGE_INTENT";
    OutgoingMessageType["REMOVE_ITEM_STORAGE"] = "REMOVE_ITEM_STORAGE";
    OutgoingMessageType["GET_ITEM_STORAGE_INTENT"] = "GET_ITEM_STORAGE_INTENT";
    OutgoingMessageType["UPDATE_CHANNEL_ID"] = "UPDATE_CHANNEL_ID";
    OutgoingMessageType["SEND_AUTO_NODE"] = "SEND_AUTO_NODE";
    OutgoingMessageType["EXIT_APP"] = "EXIT_APP";
    OutgoingMessageType["PREPARE_NOTIFICATION"] = "PREPARE_NOTIFICATION";
    OutgoingMessageType["DISPLAY_NOTIFICATION"] = "DISPLAY_NOTIFICATION";
    OutgoingMessageType["SET_EXO_PLAYER_URL"] = "SET_EXO_PLAYER_URL";
    OutgoingMessageType["SEND_AUTO_SIGNAL"] = "SEND_AUTO_SIGNAL";
    OutgoingMessageType["UPDATE_STATE"] = "UPDATE_STATE";
    OutgoingMessageType["READY"] = "READY";
    OutgoingMessageType["MAKE_HTTP_CALL_INTENT"] = "MAKE_HTTP_CALL_INTENT";
  })(OutgoingMessageType = exports.OutgoingMessageType || (exports.OutgoingMessageType = {}));
},3,[],"artifactsKokoro/kokoro/messages.js");
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
},4,[5,8,9],"artifactsKokoro/kokoro/reducers/root-reducer.js");
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
},5,[6],"node_modules/redux/lib/redux.js");
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
},6,[7],"node_modules/symbol-observable/lib/index.js");
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
},7,[],"node_modules/symbol-observable/lib/ponyfill.js");
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
},8,[],"artifactsKokoro/kokoro/reducers/service-providers.js");
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
},9,[2],"artifactsKokoro/kokoro/reducers/stations.js");
__d(function (global, _$$_REQUIRE, _$$_IMPORT_DEFAULT, _$$_IMPORT_ALL, module, exports, _dependencyMap) {
  "use strict";

  var __awaiter = this && this.__awaiter || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }

      function rejected(value) {
        try {
          step(generator["throw"](value));
        } catch (e) {
          reject(e);
        }
      }

      function step(result) {
        result.done ? resolve(result.value) : new P(function (resolve) {
          resolve(result.value);
        }).then(fulfilled, rejected);
      }

      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  };

  var __generator = this && this.__generator || function (thisArg, body) {
    var _ = {
      label: 0,
      sent: function sent() {
        if (t[0] & 1) throw t[1];
        return t[1];
      },
      trys: [],
      ops: []
    },
        f,
        y,
        t,
        g;
    return g = {
      next: verb(0),
      "throw": verb(1),
      "return": verb(2)
    }, typeof Symbol === "function" && (g[typeof Symbol === "function" ? Symbol.iterator : "@@iterator"] = function () {
      return this;
    }), g;

    function verb(n) {
      return function (v) {
        return step([n, v]);
      };
    }

    function step(op) {
      if (f) throw new TypeError("Generator is already executing.");

      while (_) {
        try {
          if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
          if (y = 0, t) op = [op[0] & 2, t.value];

          switch (op[0]) {
            case 0:
            case 1:
              t = op;
              break;

            case 4:
              _.label++;
              return {
                value: op[1],
                done: false
              };

            case 5:
              _.label++;
              y = op[1];
              op = [0];
              continue;

            case 7:
              op = _.ops.pop();

              _.trys.pop();

              continue;

            default:
              if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) {
                _ = 0;
                continue;
              }

              if (op[0] === 3 && (!t || op[1] > t[0] && op[1] < t[3])) {
                _.label = op[1];
                break;
              }

              if (op[0] === 6 && _.label < t[1]) {
                _.label = t[1];
                t = op;
                break;
              }

              if (t && _.label < t[2]) {
                _.label = t[2];

                _.ops.push(op);

                break;
              }

              if (t[2]) _.ops.pop();

              _.trys.pop();

              continue;
          }

          op = body.call(thisArg, _);
        } catch (e) {
          op = [6, e];
          y = 0;
        } finally {
          f = t = 0;
        }
      }

      if (op[0] & 5) throw op[1];
      return {
        value: op[0] ? op[1] : void 0,
        done: true
      };
    }
  };

  var _this = this;

  Object.defineProperty(exports, "__esModule", {
    value: true
  });

  var constants_1 = _$$_REQUIRE(_dependencyMap[0], "../constants");

  var utilities_1 = _$$_REQUIRE(_dependencyMap[1], "../utilities");

  var messages_1 = _$$_REQUIRE(_dependencyMap[2], "./messages");

  var service_providers_1 = _$$_REQUIRE(_dependencyMap[3], "./reducers/service-providers");

  var SPICache_1 = _$$_REQUIRE(_dependencyMap[4], "./services/SPICache");

  exports.parseAndCacheSPI = function (store) {
    return __awaiter(_this, void 0, void 0, function () {
      var spiCacheResponses;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            return [4, SPICache_1.getAllSPIs(constants_1.SERVICE_PROVIDERS)];

          case 1:
            spiCacheResponses = _a.sent();
            addAutoNode("root", "byServiceProviderRoot", "By service provider", "", null);
            addAutoNode("root", "byGenreRoot", "By genre", "", null);
            spiCacheResponses.forEach(cacheForAndroidAuto);
            parseAndCacheGenresForAndroidAuto(spiCacheResponses);
            store.dispatch(service_providers_1.setServiceProviders(spiCacheResponses));
            return [2];
        }
      });
    });
  };

  var parseAndCacheGenresForAndroidAuto = function parseAndCacheGenresForAndroidAuto(spiCacheResponses) {
    var genres = {};
    spiCacheResponses.reduce(function (acc, spiCache) {
      return acc.concat(spiCache.stations || []);
    }, []).reduce(function (acc, station) {
      return acc.concat(station.genre.map(function (genre) {
        return {
          genre: genre.text.replace("\"", "").trim(),
          station: station
        };
      }));
    }, []).sort(function (a, b) {
      if (a.genre < b.genre) {
        return -1;
      }

      if (a.genre > b.genre) {
        return 1;
      }

      return 0;
    }).filter(function (a) {
      return utilities_1.getBearer(a.station.bearer).id;
    }).forEach(function (a) {
      return genres[a.genre] ? genres[a.genre].push(a.station) : genres[a.genre] = [a.station];
    });
    Object.keys(genres).forEach(function (genre) {
      addAutoNode("byGenreRoot", genre, genre, "", null);
      genres[genre].forEach(function (station) {
        var mediaUri = utilities_1.getMedia(station.mediaDescription);
        addAutoNode(genre, genre + utilities_1.getBearer(station.bearer).id, station.shortName || "", mediaUri, utilities_1.getBearer(station.bearer).id);
      });
    });
  };

  var cacheForAndroidAuto = function cacheForAndroidAuto(cacheResponse) {
    if (!cacheResponse.serviceProvider || !cacheResponse.stations) {
      return;
    }

    addAutoNode("byServiceProviderRoot", cacheResponse.spUrl, cacheResponse.serviceProvider.shortName ? cacheResponse.serviceProvider.shortName.text : "", utilities_1.getMedia(cacheResponse.serviceProvider.mediaDescription), null);
    cacheResponse.stations.forEach(function (station) {
      var mediaUri = utilities_1.getMedia(station.mediaDescription);
      addAutoNode(cacheResponse.spUrl, utilities_1.getBearer(station.bearer).id, station.shortName || "", mediaUri, utilities_1.getBearer(station.bearer).id);
    });
  };

  var addAutoNode = function addAutoNode(childOf, key, value, imageURI, streamURI) {
    LiquidCore.emit(messages_1.OutgoingMessageType.SEND_AUTO_NODE, {
      childOf: childOf,
      key: key,
      value: value,
      imageURI: imageURI,
      streamURI: streamURI
    });
  };
},10,[11,2,3,8,12],"artifactsKokoro/kokoro/spi.js");
__d(function (global, _$$_REQUIRE, _$$_IMPORT_DEFAULT, _$$_IMPORT_ALL, module, exports, _dependencyMap) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.SPI_3_1 = "/radiodns/spi/3.1/SI.xml";
  exports.CACHE_SPI_MAX_AGE = 21600000;
  exports.SERVICE_PROVIDERS = ["https://atorf.spi.radio.ebu.io", "https://bertbf.spi.radio.ebu.io", "https://bevrt.spi.radio.ebu.io", "https://charga.spi.radio.ebu.io", "https://chbeo.spi.radio.ebu.io", "https://chbnj.spi.radio.ebu.io", "https://chmaxx.spi.radio.ebu.io", "https://chplts.spi.radio.ebu.io", "https://chrd24.spi.radio.ebu.io", "https://chrro.spi.radio.ebu.io", "https://chrsi.spi.radio.ebu.io", "https://chrts.spi.radio.ebu.io", "https://chsmda.spi.radio.ebu.io", "https://chspoo.spi.radio.ebu.io", "https://chsrf.spi.radio.ebu.io", "https://czcr.spi.radio.ebu.io", "https://deaudi.spi.radio.ebu.io", "https://deirt.spi.radio.ebu.io", "https://esaber.spi.radio.ebu.io", "https://escope.spi.radio.ebu.io", "https://esrtve.spi.radio.ebu.io", "https://frdica.spi.radio.ebu.io", "https://frfg.spi.radio.ebu.io", "https://frnova.spi.radio.ebu.io", "https://FROUIFM.spi.radio.ebu.io", "https://frsrf.spi.radio.ebu.io", "https://humtva.spi.radio.ebu.io", "https://ierte.spi.radio.ebu.io", "https://ITRAI.spi.radio.ebu.io", "https://mcrmc.spi.radio.ebu.io", "https://NLNPO.spi.radio.ebu.io", "https://nonrk.spi.radio.ebu.io", "https://plpr.spi.radio.ebu.io", "https://plprw.spi.radio.ebu.io", "https://roror.spi.radio.ebu.io", "https://rurtr.spi.radio.ebu.io", "https://sesr.spi.radio.ebu.io", "https://sirtvs.spi.radio.ebu.io", "https://trtrt.spi.radio.ebu.io", "https://visitor.spi.radio.ebu.io", "https://zzebu.spi.radio.ebu.io"];
},11,[],"artifactsKokoro/constants.js");
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

  var __awaiter = this && this.__awaiter || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }

      function rejected(value) {
        try {
          step(generator["throw"](value));
        } catch (e) {
          reject(e);
        }
      }

      function step(result) {
        result.done ? resolve(result.value) : new P(function (resolve) {
          resolve(result.value);
        }).then(fulfilled, rejected);
      }

      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  };

  var __generator = this && this.__generator || function (thisArg, body) {
    var _ = {
      label: 0,
      sent: function sent() {
        if (t[0] & 1) throw t[1];
        return t[1];
      },
      trys: [],
      ops: []
    },
        f,
        y,
        t,
        g;
    return g = {
      next: verb(0),
      "throw": verb(1),
      "return": verb(2)
    }, typeof Symbol === "function" && (g[typeof Symbol === "function" ? Symbol.iterator : "@@iterator"] = function () {
      return this;
    }), g;

    function verb(n) {
      return function (v) {
        return step([n, v]);
      };
    }

    function step(op) {
      if (f) throw new TypeError("Generator is already executing.");

      while (_) {
        try {
          if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
          if (y = 0, t) op = [op[0] & 2, t.value];

          switch (op[0]) {
            case 0:
            case 1:
              t = op;
              break;

            case 4:
              _.label++;
              return {
                value: op[1],
                done: false
              };

            case 5:
              _.label++;
              y = op[1];
              op = [0];
              continue;

            case 7:
              op = _.ops.pop();

              _.trys.pop();

              continue;

            default:
              if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) {
                _ = 0;
                continue;
              }

              if (op[0] === 3 && (!t || op[1] > t[0] && op[1] < t[3])) {
                _.label = op[1];
                break;
              }

              if (op[0] === 6 && _.label < t[1]) {
                _.label = t[1];
                t = op;
                break;
              }

              if (t && _.label < t[2]) {
                _.label = t[2];

                _.ops.push(op);

                break;
              }

              if (t[2]) _.ops.pop();

              _.trys.pop();

              continue;
          }

          op = body.call(thisArg, _);
        } catch (e) {
          op = [6, e];
          y = 0;
        } finally {
          f = t = 0;
        }
      }

      if (op[0] & 5) throw op[1];
      return {
        value: op[0] ? op[1] : void 0,
        done: true
      };
    }
  };

  var _this = this;

  Object.defineProperty(exports, "__esModule", {
    value: true
  });

  var parser_1 = _$$_REQUIRE(_dependencyMap[0], "spi_xml_file_parser/artifacts/src/parser");

  var constants_1 = _$$_REQUIRE(_dependencyMap[1], "../../constants");

  var utilities_1 = _$$_REQUIRE(_dependencyMap[2], "../../utilities");

  var messages_1 = _$$_REQUIRE(_dependencyMap[3], "../messages");

  var http_1 = _$$_REQUIRE(_dependencyMap[4], "./http");

  var fetchAndPutInCache = function fetchAndPutInCache(serviceProviderUrl) {
    return __awaiter(_this, void 0, void 0, function () {
      var _this = this;

      return __generator(this, function (_a) {
        return [2, new Promise(function (resolve) {
          return __awaiter(_this, void 0, void 0, function () {
            var res, cacheContainer, parsedSPI;
            return __generator(this, function (_a) {
              switch (_a.label) {
                case 0:
                  return [4, http_1.httpRequest("GET", serviceProviderUrl + constants_1.SPI_3_1)];

                case 1:
                  res = _a.sent();

                  if (!res || res.status !== 200 || !res.data) {
                    cacheContainer = {
                      expires: -1,
                      error: true,
                      spUrl: serviceProviderUrl
                    };
                  } else {
                    try {
                      parsedSPI = parser_1.parse(res.data);
                      cacheContainer = {
                        expires: Date.now() + constants_1.CACHE_SPI_MAX_AGE,
                        stations: parsedSPI.services || undefined,
                        serviceProvider: parsedSPI.serviceProvider || undefined,
                        error: false,
                        spUrl: serviceProviderUrl
                      };
                    } catch (e) {
                      cacheContainer = {
                        error: true,
                        expires: Date.now() + constants_1.CACHE_SPI_MAX_AGE,
                        spUrl: serviceProviderUrl
                      };
                    }
                  }

                  LiquidCore.on(messages_1.IncomingMessageType.EMIT_STORAGE_ITEM_SET_COMPLETED, function (msg) {
                    if (msg.key === serviceProviderUrl) {
                      console.log("DEBUG: SPI PUT IN CACHE FULLY COMPLETED!", msg.key);
                      resolve(cacheContainer);
                    }
                  });
                  console.log("DEBUG: SET_ITEM_STORAGE_INTENT");
                  LiquidCore.emit(messages_1.OutgoingMessageType.SET_ITEM_STORAGE_INTENT, {
                    key: serviceProviderUrl,
                    data: JSON.stringify(cacheContainer)
                  });
                  return [2];
              }
            });
          });
        })];
      });
    });
  };

  exports.clearCache = function () {
    return Promise.all(constants_1.SERVICE_PROVIDERS.map(function (key) {
      return LiquidCore.emit(messages_1.OutgoingMessageType.REMOVE_ITEM_STORAGE, {
        key: key
      });
    }));
  };

  var getSPI = function getSPI(serviceProviderUrl) {
    return __awaiter(_this, void 0, void 0, function () {
      var cacheContainer;

      var _this = this;

      return __generator(this, function (_a) {
        cacheContainer = {
          expires: -1,
          error: true,
          spUrl: serviceProviderUrl
        };
        return [2, new Promise(function (resolve) {
          LiquidCore.on(messages_1.IncomingMessageType.EMIT_STORAGE_ITEM_GET_COMPLETED, function (res) {
            return __awaiter(_this, void 0, void 0, function () {
              var error_1;
              return __generator(this, function (_a) {
                switch (_a.label) {
                  case 0:
                    if (res.key !== serviceProviderUrl) {
                      return [2];
                    }

                    console.log("DEBUG: GOT SPI CACHE RESPONSE!", res.key, res.value);
                    _a.label = 1;

                  case 1:
                    _a.trys.push([1, 7,, 8]);

                    if (!res.value) return [3, 4];
                    cacheContainer = JSON.parse(res.value);
                    if (!(cacheContainer.error || Date.now() > cacheContainer.expires)) return [3, 3];
                    return [4, fetchAndPutInCache(serviceProviderUrl)];

                  case 2:
                    cacheContainer = _a.sent();
                    _a.label = 3;

                  case 3:
                    return [3, 6];

                  case 4:
                    return [4, fetchAndPutInCache(serviceProviderUrl)];

                  case 5:
                    cacheContainer = _a.sent();
                    _a.label = 6;

                  case 6:
                    return [3, 8];

                  case 7:
                    error_1 = _a.sent();
                    console.error("DEBUG: ERROR", error_1);
                    return [3, 8];

                  case 8:
                    resolve(cacheContainer);
                    return [2];
                }
              });
            });
          });
          console.log("DEBUG: GET_ITEM_STORAGE_INTENT");
          LiquidCore.emit(messages_1.OutgoingMessageType.GET_ITEM_STORAGE_INTENT, {
            key: serviceProviderUrl
          });
        })];
      });
    });
  };

  exports.getAllSPIs = function (serviceProviders) {
    return __awaiter(_this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            return [4, Promise.all(serviceProviders.map(function (sp) {
              return getSPI(sp);
            }))];

          case 1:
            return [2, _a.sent().filter(function (cacheResponse) {
              return !cacheResponse.error && cacheResponse.serviceProvider && cacheResponse.stations && cacheResponse.stations.length > 0;
            }).map(function (cacheResponse) {
              return __assign({}, cacheResponse, {
                stations: cacheResponse.stations.map(function (station) {
                  return station;
                }).map(function (station) {
                  return __assign({}, station, {
                    bearer: station.bearer.filter(function (b) {
                      return utilities_1.isWebScheme(b.id) && b.cost;
                    })
                  });
                }).filter(function (station) {
                  return station.bearer.length > 0;
                })
              });
            }).filter(function (cacheResponse) {
              return cacheResponse.stations.length > 0;
            })];
        }
      });
    });
  };
},12,[13,11,2,3,30],"artifactsKokoro/kokoro/services/SPICache.js");
__d(function (global, _$$_REQUIRE, _$$_IMPORT_DEFAULT, _$$_IMPORT_ALL, module, exports, _dependencyMap) {
  "use strict";

  var __assign = this && this.__assign || function () {
    __assign = Object.assign || function (t) {
      for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];

        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
      }

      return t;
    };

    return __assign.apply(this, arguments);
  };

  Object.defineProperty(exports, "__esModule", {
    value: true
  });

  var xml_js_1 = _$$_REQUIRE(_dependencyMap[0], "xml-js");

  var utilities_1 = _$$_REQUIRE(_dependencyMap[1], "./utilities");

  exports.parse = function (xml) {
    var parsedSPI = xml_js_1.xml2js(xml, {
      compact: true
    });
    var _a = parsedSPI.serviceInformation.services,
        service = _a.service,
        serviceProvider = _a.serviceProvider;
    return {
      declaration: parsedSPI._declaration._attributes,
      services: exports.parseServices(service),
      serviceProvider: serviceProvider ? exports.parseServiceProvider(serviceProvider) : null
    };
  };

  exports.parseServices = function (services) {
    if (!services) {
      return [];
    } else if (Array.isArray(services)) {
      return services.map(function (service) {
        return exports.parseService(service);
      });
    } else {
      return [exports.parseService(services)];
    }
  };

  exports.parseService = function (service) {
    return {
      shortName: service.shortName ? service.shortName._text : null,
      mediumName: service.mediumName ? service.mediumName._text : null,
      longName: service.longName ? service.longName._text : null,
      shortDescription: service.shortDescription ? {
        lang: service.shortDescription._attributes["xml:lang"],
        text: service.shortDescription._text
      } : null,
      bearer: Array.isArray(service.bearer) ? service.bearer.map(function (bearer) {
        return utilities_1.parseRawBearer(bearer);
      }) : service.bearer ? [utilities_1.parseRawBearer(service.bearer)] : [],
      genre: service.genre ? Array.isArray(service.genre) ? service.genre.map(function (genre) {
        return __assign({
          text: genre._text
        }, genre._attributes);
      }) : [__assign({
        text: service.genre._text
      }, service.genre._attributes)] : [],
      link: utilities_1.parseRawLink(service.link),
      mediaDescription: utilities_1.parseRawMediaDescription(service.mediaDescription),
      radiodns: __assign({}, service.radiodns._attributes),
      keywords: service.keywords ? service.keywords._text : null
    };
  };

  exports.parseServiceProvider = function (rawServiceProvider) {
    return {
      geolocation: rawServiceProvider.geolocation.country ? {
        country: rawServiceProvider.geolocation.country._text
      } : {
        country: "None"
      },
      link: utilities_1.parseRawLink(rawServiceProvider.link),
      shortName: rawServiceProvider.shortName ? {
        lang: rawServiceProvider.shortName._attributes["xml:lang"],
        text: rawServiceProvider.shortName._text
      } : null,
      mediumName: rawServiceProvider.mediumName ? {
        lang: rawServiceProvider.mediumName._attributes["xml:lang"],
        text: rawServiceProvider.mediumName._text
      } : null,
      longName: rawServiceProvider.longName ? {
        lang: rawServiceProvider.longName._attributes["xml:lang"],
        text: rawServiceProvider.longName._text
      } : null,
      shortDescription: rawServiceProvider.shortDescription ? {
        lang: rawServiceProvider.shortDescription._attributes["xml:lang"],
        text: rawServiceProvider.shortDescription._text
      } : null,
      mediaDescription: utilities_1.parseRawMediaDescription(rawServiceProvider.mediaDescription),
      keywords: rawServiceProvider.keywords ? rawServiceProvider.keywords._text : null
    };
  };
},13,[14,29],"node_modules/spi_xml_file_parser/artifacts/src/parser.js");
__d(function (global, _$$_REQUIRE, _$$_IMPORT_DEFAULT, _$$_IMPORT_ALL, module, exports, _dependencyMap) {
  "use strict";

  var xml2js = _$$_REQUIRE(_dependencyMap[0], "./xml2js");

  var xml2json = _$$_REQUIRE(_dependencyMap[1], "./xml2json");

  var js2xml = _$$_REQUIRE(_dependencyMap[2], "./js2xml");

  var json2xml = _$$_REQUIRE(_dependencyMap[3], "./json2xml");

  module.exports = {
    xml2js: xml2js,
    xml2json: xml2json,
    js2xml: js2xml,
    json2xml: json2xml
  };
},14,[15,26,27,28],"node_modules/xml-js/lib/index.js");
__d(function (global, _$$_REQUIRE, _$$_IMPORT_DEFAULT, _$$_IMPORT_ALL, module, exports, _dependencyMap) {
  "use strict";

  var sax = _$$_REQUIRE(_dependencyMap[0], "sax");

  var expat = {
    on: function () {},
    parse: function () {}
  };

  var helper = _$$_REQUIRE(_dependencyMap[1], "./options-helper");

  var isArray = _$$_REQUIRE(_dependencyMap[2], "./array-helper").isArray;

  var options;
  var pureJsParser = true;
  var currentElement;

  function validateOptions(userOptions) {
    options = helper.copyOptions(userOptions);
    helper.ensureFlagExists('ignoreDeclaration', options);
    helper.ensureFlagExists('ignoreInstruction', options);
    helper.ensureFlagExists('ignoreAttributes', options);
    helper.ensureFlagExists('ignoreText', options);
    helper.ensureFlagExists('ignoreComment', options);
    helper.ensureFlagExists('ignoreCdata', options);
    helper.ensureFlagExists('ignoreDoctype', options);
    helper.ensureFlagExists('compact', options);
    helper.ensureFlagExists('alwaysChildren', options);
    helper.ensureFlagExists('addParent', options);
    helper.ensureFlagExists('trim', options);
    helper.ensureFlagExists('nativeType', options);
    helper.ensureFlagExists('nativeTypeAttributes', options);
    helper.ensureFlagExists('sanitize', options);
    helper.ensureFlagExists('instructionHasAttributes', options);
    helper.ensureFlagExists('captureSpacesBetweenElements', options);
    helper.ensureAlwaysArrayExists(options);
    helper.ensureKeyExists('declaration', options);
    helper.ensureKeyExists('instruction', options);
    helper.ensureKeyExists('attributes', options);
    helper.ensureKeyExists('text', options);
    helper.ensureKeyExists('comment', options);
    helper.ensureKeyExists('cdata', options);
    helper.ensureKeyExists('doctype', options);
    helper.ensureKeyExists('type', options);
    helper.ensureKeyExists('name', options);
    helper.ensureKeyExists('elements', options);
    helper.ensureKeyExists('parent', options);
    helper.checkFnExists('doctype', options);
    helper.checkFnExists('instruction', options);
    helper.checkFnExists('cdata', options);
    helper.checkFnExists('comment', options);
    helper.checkFnExists('text', options);
    helper.checkFnExists('instructionName', options);
    helper.checkFnExists('elementName', options);
    helper.checkFnExists('attributeName', options);
    helper.checkFnExists('attributeValue', options);
    helper.checkFnExists('attributes', options);
    return options;
  }

  function nativeType(value) {
    var nValue = Number(value);

    if (!isNaN(nValue)) {
      return nValue;
    }

    var bValue = value.toLowerCase();

    if (bValue === 'true') {
      return true;
    } else if (bValue === 'false') {
      return false;
    }

    return value;
  }

  function addField(type, value) {
    var key;

    if (options.compact) {
      if (!currentElement[options[type + 'Key']] && (isArray(options.alwaysArray) ? options.alwaysArray.indexOf(options[type + 'Key']) !== -1 : options.alwaysArray)) {
        currentElement[options[type + 'Key']] = [];
      }

      if (currentElement[options[type + 'Key']] && !isArray(currentElement[options[type + 'Key']])) {
        currentElement[options[type + 'Key']] = [currentElement[options[type + 'Key']]];
      }

      if (type + 'Fn' in options && typeof value === 'string') {
        value = options[type + 'Fn'](value, currentElement);
      }

      if (type === 'instruction' && ('instructionFn' in options || 'instructionNameFn' in options)) {
        for (key in value) {
          if (value.hasOwnProperty(key)) {
            if ('instructionFn' in options) {
              value[key] = options.instructionFn(value[key], key, currentElement);
            } else {
              var temp = value[key];
              delete value[key];
              value[options.instructionNameFn(key, temp, currentElement)] = temp;
            }
          }
        }
      }

      if (isArray(currentElement[options[type + 'Key']])) {
        currentElement[options[type + 'Key']].push(value);
      } else {
        currentElement[options[type + 'Key']] = value;
      }
    } else {
      if (!currentElement[options.elementsKey]) {
        currentElement[options.elementsKey] = [];
      }

      var element = {};
      element[options.typeKey] = type;

      if (type === 'instruction') {
        for (key in value) {
          if (value.hasOwnProperty(key)) {
            break;
          }
        }

        element[options.nameKey] = 'instructionNameFn' in options ? options.instructionNameFn(key, value, currentElement) : key;

        if (options.instructionHasAttributes) {
          element[options.attributesKey] = value[key][options.attributesKey];

          if ('instructionFn' in options) {
            element[options.attributesKey] = options.instructionFn(element[options.attributesKey], key, currentElement);
          }
        } else {
          if ('instructionFn' in options) {
            value[key] = options.instructionFn(value[key], key, currentElement);
          }

          element[options.instructionKey] = value[key];
        }
      } else {
        if (type + 'Fn' in options) {
          value = options[type + 'Fn'](value, currentElement);
        }

        element[options[type + 'Key']] = value;
      }

      if (options.addParent) {
        element[options.parentKey] = currentElement;
      }

      currentElement[options.elementsKey].push(element);
    }
  }

  function manipulateAttributes(attributes) {
    if ('attributesFn' in options && attributes) {
      attributes = options.attributesFn(attributes, currentElement);
    }

    if ((options.trim || 'attributeValueFn' in options || 'attributeNameFn' in options || options.nativeTypeAttributes) && attributes) {
      var key;

      for (key in attributes) {
        if (attributes.hasOwnProperty(key)) {
          if (options.trim) attributes[key] = attributes[key].trim();

          if (options.nativeTypeAttributes) {
            attributes[key] = nativeType(attributes[key]);
          }

          if ('attributeValueFn' in options) attributes[key] = options.attributeValueFn(attributes[key], key, currentElement);

          if ('attributeNameFn' in options) {
            var temp = attributes[key];
            delete attributes[key];
            attributes[options.attributeNameFn(key, attributes[key], currentElement)] = temp;
          }
        }
      }
    }

    return attributes;
  }

  function onInstruction(instruction) {
    var attributes = {};

    if (instruction.body && (instruction.name.toLowerCase() === 'xml' || options.instructionHasAttributes)) {
      var attrsRegExp = /([\w:-]+)\s*=\s*(?:"([^"]*)"|'([^']*)'|(\w+))\s*/g;
      var match;

      while ((match = attrsRegExp.exec(instruction.body)) !== null) {
        attributes[match[1]] = match[2] || match[3] || match[4];
      }

      attributes = manipulateAttributes(attributes);
    }

    if (instruction.name.toLowerCase() === 'xml') {
      if (options.ignoreDeclaration) {
        return;
      }

      currentElement[options.declarationKey] = {};

      if (Object.keys(attributes).length) {
        currentElement[options.declarationKey][options.attributesKey] = attributes;
      }

      if (options.addParent) {
        currentElement[options.declarationKey][options.parentKey] = currentElement;
      }
    } else {
      if (options.ignoreInstruction) {
        return;
      }

      if (options.trim) {
        instruction.body = instruction.body.trim();
      }

      var value = {};

      if (options.instructionHasAttributes && Object.keys(attributes).length) {
        value[instruction.name] = {};
        value[instruction.name][options.attributesKey] = attributes;
      } else {
        value[instruction.name] = instruction.body;
      }

      addField('instruction', value);
    }
  }

  function onStartElement(name, attributes) {
    var element;

    if (typeof name === 'object') {
      attributes = name.attributes;
      name = name.name;
    }

    attributes = manipulateAttributes(attributes);

    if ('elementNameFn' in options) {
      name = options.elementNameFn(name, currentElement);
    }

    if (options.compact) {
      element = {};

      if (!options.ignoreAttributes && attributes && Object.keys(attributes).length) {
        element[options.attributesKey] = {};
        var key;

        for (key in attributes) {
          if (attributes.hasOwnProperty(key)) {
            element[options.attributesKey][key] = attributes[key];
          }
        }
      }

      if (!(name in currentElement) && (isArray(options.alwaysArray) ? options.alwaysArray.indexOf(name) !== -1 : options.alwaysArray)) {
        currentElement[name] = [];
      }

      if (currentElement[name] && !isArray(currentElement[name])) {
        currentElement[name] = [currentElement[name]];
      }

      if (isArray(currentElement[name])) {
        currentElement[name].push(element);
      } else {
        currentElement[name] = element;
      }
    } else {
      if (!currentElement[options.elementsKey]) {
        currentElement[options.elementsKey] = [];
      }

      element = {};
      element[options.typeKey] = 'element';
      element[options.nameKey] = name;

      if (!options.ignoreAttributes && attributes && Object.keys(attributes).length) {
        element[options.attributesKey] = attributes;
      }

      if (options.alwaysChildren) {
        element[options.elementsKey] = [];
      }

      currentElement[options.elementsKey].push(element);
    }

    element[options.parentKey] = currentElement;
    currentElement = element;
  }

  function onText(text) {
    if (options.ignoreText) {
      return;
    }

    if (!text.trim() && !options.captureSpacesBetweenElements) {
      return;
    }

    if (options.trim) {
      text = text.trim();
    }

    if (options.nativeType) {
      text = nativeType(text);
    }

    if (options.sanitize) {
      text = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }

    addField('text', text);
  }

  function onComment(comment) {
    if (options.ignoreComment) {
      return;
    }

    if (options.trim) {
      comment = comment.trim();
    }

    addField('comment', comment);
  }

  function onEndElement(name) {
    var parentElement = currentElement[options.parentKey];

    if (!options.addParent) {
      delete currentElement[options.parentKey];
    }

    currentElement = parentElement;
  }

  function onCdata(cdata) {
    if (options.ignoreCdata) {
      return;
    }

    if (options.trim) {
      cdata = cdata.trim();
    }

    addField('cdata', cdata);
  }

  function onDoctype(doctype) {
    if (options.ignoreDoctype) {
      return;
    }

    doctype = doctype.replace(/^ /, '');

    if (options.trim) {
      doctype = doctype.trim();
    }

    addField('doctype', doctype);
  }

  function onError(error) {
    error.note = error;
  }

  module.exports = function (xml, userOptions) {
    var parser = pureJsParser ? sax.parser(true, {}) : parser = new expat.Parser('UTF-8');
    var result = {};
    currentElement = result;
    options = validateOptions(userOptions);

    if (pureJsParser) {
      parser.opt = {
        strictEntities: true
      };
      parser.onopentag = onStartElement;
      parser.ontext = onText;
      parser.oncomment = onComment;
      parser.onclosetag = onEndElement;
      parser.onerror = onError;
      parser.oncdata = onCdata;
      parser.ondoctype = onDoctype;
      parser.onprocessinginstruction = onInstruction;
    } else {
      parser.on('startElement', onStartElement);
      parser.on('text', onText);
      parser.on('comment', onComment);
      parser.on('endElement', onEndElement);
      parser.on('error', onError);
    }

    if (pureJsParser) {
      parser.write(xml).close();
    } else {
      if (!parser.parse(xml)) {
        throw new Error('XML parsing error: ' + parser.getError());
      }
    }

    if (result[options.elementsKey]) {
      var temp = result[options.elementsKey];
      delete result[options.elementsKey];
      result[options.elementsKey] = temp;
      delete result.text;
    }

    return result;
  };
},15,[16,24,25],"node_modules/xml-js/lib/xml2js.js");
__d(function (global, _$$_REQUIRE, _$$_IMPORT_DEFAULT, _$$_IMPORT_ALL, module, exports, _dependencyMap) {
  "use strict";

  ;

  (function (sax) {
    sax.parser = function (strict, opt) {
      return new SAXParser(strict, opt);
    };

    sax.SAXParser = SAXParser;
    sax.SAXStream = SAXStream;
    sax.createStream = createStream;
    sax.MAX_BUFFER_LENGTH = 64 * 1024;
    var buffers = ['comment', 'sgmlDecl', 'textNode', 'tagName', 'doctype', 'procInstName', 'procInstBody', 'entity', 'attribName', 'attribValue', 'cdata', 'script'];
    sax.EVENTS = ['text', 'processinginstruction', 'sgmldeclaration', 'doctype', 'comment', 'opentagstart', 'attribute', 'opentag', 'closetag', 'opencdata', 'cdata', 'closecdata', 'error', 'end', 'ready', 'script', 'opennamespace', 'closenamespace'];

    function SAXParser(strict, opt) {
      if (!(this instanceof SAXParser)) {
        return new SAXParser(strict, opt);
      }

      var parser = this;
      clearBuffers(parser);
      parser.q = parser.c = '';
      parser.bufferCheckPosition = sax.MAX_BUFFER_LENGTH;
      parser.opt = opt || {};
      parser.opt.lowercase = parser.opt.lowercase || parser.opt.lowercasetags;
      parser.looseCase = parser.opt.lowercase ? 'toLowerCase' : 'toUpperCase';
      parser.tags = [];
      parser.closed = parser.closedRoot = parser.sawRoot = false;
      parser.tag = parser.error = null;
      parser.strict = !!strict;
      parser.noscript = !!(strict || parser.opt.noscript);
      parser.state = S.BEGIN;
      parser.strictEntities = parser.opt.strictEntities;
      parser.ENTITIES = parser.strictEntities ? Object.create(sax.XML_ENTITIES) : Object.create(sax.ENTITIES);
      parser.attribList = [];

      if (parser.opt.xmlns) {
        parser.ns = Object.create(rootNS);
      }

      parser.trackPosition = parser.opt.position !== false;

      if (parser.trackPosition) {
        parser.position = parser.line = parser.column = 0;
      }

      emit(parser, 'onready');
    }

    if (!Object.create) {
      Object.create = function (o) {
        function F() {}

        F.prototype = o;
        var newf = new F();
        return newf;
      };
    }

    if (!Object.keys) {
      Object.keys = function (o) {
        var a = [];

        for (var i in o) if (o.hasOwnProperty(i)) a.push(i);

        return a;
      };
    }

    function checkBufferLength(parser) {
      var maxAllowed = Math.max(sax.MAX_BUFFER_LENGTH, 10);
      var maxActual = 0;

      for (var i = 0, l = buffers.length; i < l; i++) {
        var len = parser[buffers[i]].length;

        if (len > maxAllowed) {
          switch (buffers[i]) {
            case 'textNode':
              closeText(parser);
              break;

            case 'cdata':
              emitNode(parser, 'oncdata', parser.cdata);
              parser.cdata = '';
              break;

            case 'script':
              emitNode(parser, 'onscript', parser.script);
              parser.script = '';
              break;

            default:
              error(parser, 'Max buffer length exceeded: ' + buffers[i]);
          }
        }

        maxActual = Math.max(maxActual, len);
      }

      var m = sax.MAX_BUFFER_LENGTH - maxActual;
      parser.bufferCheckPosition = m + parser.position;
    }

    function clearBuffers(parser) {
      for (var i = 0, l = buffers.length; i < l; i++) {
        parser[buffers[i]] = '';
      }
    }

    function flushBuffers(parser) {
      closeText(parser);

      if (parser.cdata !== '') {
        emitNode(parser, 'oncdata', parser.cdata);
        parser.cdata = '';
      }

      if (parser.script !== '') {
        emitNode(parser, 'onscript', parser.script);
        parser.script = '';
      }
    }

    SAXParser.prototype = {
      end: function () {
        end(this);
      },
      write: write,
      resume: function () {
        this.error = null;
        return this;
      },
      close: function () {
        return this.write(null);
      },
      flush: function () {
        flushBuffers(this);
      }
    };
    var Stream;

    try {
      Stream = _$$_REQUIRE(_dependencyMap[0], "stream").Stream;
    } catch (ex) {
      Stream = function () {};
    }

    var streamWraps = sax.EVENTS.filter(function (ev) {
      return ev !== 'error' && ev !== 'end';
    });

    function createStream(strict, opt) {
      return new SAXStream(strict, opt);
    }

    function SAXStream(strict, opt) {
      if (!(this instanceof SAXStream)) {
        return new SAXStream(strict, opt);
      }

      Stream.apply(this);
      this._parser = new SAXParser(strict, opt);
      this.writable = true;
      this.readable = true;
      var me = this;

      this._parser.onend = function () {
        me.emit('end');
      };

      this._parser.onerror = function (er) {
        me.emit('error', er);
        me._parser.error = null;
      };

      this._decoder = null;
      streamWraps.forEach(function (ev) {
        Object.defineProperty(me, 'on' + ev, {
          get: function () {
            return me._parser['on' + ev];
          },
          set: function (h) {
            if (!h) {
              me.removeAllListeners(ev);
              me._parser['on' + ev] = h;
              return h;
            }

            me.on(ev, h);
          },
          enumerable: true,
          configurable: false
        });
      });
    }

    SAXStream.prototype = Object.create(Stream.prototype, {
      constructor: {
        value: SAXStream
      }
    });

    SAXStream.prototype.write = function (data) {
      if (typeof Buffer === 'function' && typeof Buffer.isBuffer === 'function' && Buffer.isBuffer(data)) {
        if (!this._decoder) {
          var SD = _$$_REQUIRE(_dependencyMap[1], "string_decoder").StringDecoder;

          this._decoder = new SD('utf8');
        }

        data = this._decoder.write(data);
      }

      this._parser.write(data.toString());

      this.emit('data', data);
      return true;
    };

    SAXStream.prototype.end = function (chunk) {
      if (chunk && chunk.length) {
        this.write(chunk);
      }

      this._parser.end();

      return true;
    };

    SAXStream.prototype.on = function (ev, handler) {
      var me = this;

      if (!me._parser['on' + ev] && streamWraps.indexOf(ev) !== -1) {
        me._parser['on' + ev] = function () {
          var args = arguments.length === 1 ? [arguments[0]] : Array.apply(null, arguments);
          args.splice(0, 0, ev);
          me.emit.apply(me, args);
        };
      }

      return Stream.prototype.on.call(me, ev, handler);
    };

    var CDATA = '[CDATA[';
    var DOCTYPE = 'DOCTYPE';
    var XML_NAMESPACE = 'http://www.w3.org/XML/1998/namespace';
    var XMLNS_NAMESPACE = 'http://www.w3.org/2000/xmlns/';
    var rootNS = {
      xml: XML_NAMESPACE,
      xmlns: XMLNS_NAMESPACE
    };
    var nameStart = /[:_A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD]/;
    var nameBody = /[:_A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD\u00B7\u0300-\u036F\u203F-\u2040.\d-]/;
    var entityStart = /[#:_A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD]/;
    var entityBody = /[#:_A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD\u00B7\u0300-\u036F\u203F-\u2040.\d-]/;

    function isWhitespace(c) {
      return c === ' ' || c === '\n' || c === '\r' || c === '\t';
    }

    function isQuote(c) {
      return c === '"' || c === '\'';
    }

    function isAttribEnd(c) {
      return c === '>' || isWhitespace(c);
    }

    function isMatch(regex, c) {
      return regex.test(c);
    }

    function notMatch(regex, c) {
      return !isMatch(regex, c);
    }

    var S = 0;
    sax.STATE = {
      BEGIN: S++,
      BEGIN_WHITESPACE: S++,
      TEXT: S++,
      TEXT_ENTITY: S++,
      OPEN_WAKA: S++,
      SGML_DECL: S++,
      SGML_DECL_QUOTED: S++,
      DOCTYPE: S++,
      DOCTYPE_QUOTED: S++,
      DOCTYPE_DTD: S++,
      DOCTYPE_DTD_QUOTED: S++,
      COMMENT_STARTING: S++,
      COMMENT: S++,
      COMMENT_ENDING: S++,
      COMMENT_ENDED: S++,
      CDATA: S++,
      CDATA_ENDING: S++,
      CDATA_ENDING_2: S++,
      PROC_INST: S++,
      PROC_INST_BODY: S++,
      PROC_INST_ENDING: S++,
      OPEN_TAG: S++,
      OPEN_TAG_SLASH: S++,
      ATTRIB: S++,
      ATTRIB_NAME: S++,
      ATTRIB_NAME_SAW_WHITE: S++,
      ATTRIB_VALUE: S++,
      ATTRIB_VALUE_QUOTED: S++,
      ATTRIB_VALUE_CLOSED: S++,
      ATTRIB_VALUE_UNQUOTED: S++,
      ATTRIB_VALUE_ENTITY_Q: S++,
      ATTRIB_VALUE_ENTITY_U: S++,
      CLOSE_TAG: S++,
      CLOSE_TAG_SAW_WHITE: S++,
      SCRIPT: S++,
      SCRIPT_ENDING: S++
    };
    sax.XML_ENTITIES = {
      'amp': '&',
      'gt': '>',
      'lt': '<',
      'quot': '"',
      'apos': "'"
    };
    sax.ENTITIES = {
      'amp': '&',
      'gt': '>',
      'lt': '<',
      'quot': '"',
      'apos': "'",
      'AElig': 198,
      'Aacute': 193,
      'Acirc': 194,
      'Agrave': 192,
      'Aring': 197,
      'Atilde': 195,
      'Auml': 196,
      'Ccedil': 199,
      'ETH': 208,
      'Eacute': 201,
      'Ecirc': 202,
      'Egrave': 200,
      'Euml': 203,
      'Iacute': 205,
      'Icirc': 206,
      'Igrave': 204,
      'Iuml': 207,
      'Ntilde': 209,
      'Oacute': 211,
      'Ocirc': 212,
      'Ograve': 210,
      'Oslash': 216,
      'Otilde': 213,
      'Ouml': 214,
      'THORN': 222,
      'Uacute': 218,
      'Ucirc': 219,
      'Ugrave': 217,
      'Uuml': 220,
      'Yacute': 221,
      'aacute': 225,
      'acirc': 226,
      'aelig': 230,
      'agrave': 224,
      'aring': 229,
      'atilde': 227,
      'auml': 228,
      'ccedil': 231,
      'eacute': 233,
      'ecirc': 234,
      'egrave': 232,
      'eth': 240,
      'euml': 235,
      'iacute': 237,
      'icirc': 238,
      'igrave': 236,
      'iuml': 239,
      'ntilde': 241,
      'oacute': 243,
      'ocirc': 244,
      'ograve': 242,
      'oslash': 248,
      'otilde': 245,
      'ouml': 246,
      'szlig': 223,
      'thorn': 254,
      'uacute': 250,
      'ucirc': 251,
      'ugrave': 249,
      'uuml': 252,
      'yacute': 253,
      'yuml': 255,
      'copy': 169,
      'reg': 174,
      'nbsp': 160,
      'iexcl': 161,
      'cent': 162,
      'pound': 163,
      'curren': 164,
      'yen': 165,
      'brvbar': 166,
      'sect': 167,
      'uml': 168,
      'ordf': 170,
      'laquo': 171,
      'not': 172,
      'shy': 173,
      'macr': 175,
      'deg': 176,
      'plusmn': 177,
      'sup1': 185,
      'sup2': 178,
      'sup3': 179,
      'acute': 180,
      'micro': 181,
      'para': 182,
      'middot': 183,
      'cedil': 184,
      'ordm': 186,
      'raquo': 187,
      'frac14': 188,
      'frac12': 189,
      'frac34': 190,
      'iquest': 191,
      'times': 215,
      'divide': 247,
      'OElig': 338,
      'oelig': 339,
      'Scaron': 352,
      'scaron': 353,
      'Yuml': 376,
      'fnof': 402,
      'circ': 710,
      'tilde': 732,
      'Alpha': 913,
      'Beta': 914,
      'Gamma': 915,
      'Delta': 916,
      'Epsilon': 917,
      'Zeta': 918,
      'Eta': 919,
      'Theta': 920,
      'Iota': 921,
      'Kappa': 922,
      'Lambda': 923,
      'Mu': 924,
      'Nu': 925,
      'Xi': 926,
      'Omicron': 927,
      'Pi': 928,
      'Rho': 929,
      'Sigma': 931,
      'Tau': 932,
      'Upsilon': 933,
      'Phi': 934,
      'Chi': 935,
      'Psi': 936,
      'Omega': 937,
      'alpha': 945,
      'beta': 946,
      'gamma': 947,
      'delta': 948,
      'epsilon': 949,
      'zeta': 950,
      'eta': 951,
      'theta': 952,
      'iota': 953,
      'kappa': 954,
      'lambda': 955,
      'mu': 956,
      'nu': 957,
      'xi': 958,
      'omicron': 959,
      'pi': 960,
      'rho': 961,
      'sigmaf': 962,
      'sigma': 963,
      'tau': 964,
      'upsilon': 965,
      'phi': 966,
      'chi': 967,
      'psi': 968,
      'omega': 969,
      'thetasym': 977,
      'upsih': 978,
      'piv': 982,
      'ensp': 8194,
      'emsp': 8195,
      'thinsp': 8201,
      'zwnj': 8204,
      'zwj': 8205,
      'lrm': 8206,
      'rlm': 8207,
      'ndash': 8211,
      'mdash': 8212,
      'lsquo': 8216,
      'rsquo': 8217,
      'sbquo': 8218,
      'ldquo': 8220,
      'rdquo': 8221,
      'bdquo': 8222,
      'dagger': 8224,
      'Dagger': 8225,
      'bull': 8226,
      'hellip': 8230,
      'permil': 8240,
      'prime': 8242,
      'Prime': 8243,
      'lsaquo': 8249,
      'rsaquo': 8250,
      'oline': 8254,
      'frasl': 8260,
      'euro': 8364,
      'image': 8465,
      'weierp': 8472,
      'real': 8476,
      'trade': 8482,
      'alefsym': 8501,
      'larr': 8592,
      'uarr': 8593,
      'rarr': 8594,
      'darr': 8595,
      'harr': 8596,
      'crarr': 8629,
      'lArr': 8656,
      'uArr': 8657,
      'rArr': 8658,
      'dArr': 8659,
      'hArr': 8660,
      'forall': 8704,
      'part': 8706,
      'exist': 8707,
      'empty': 8709,
      'nabla': 8711,
      'isin': 8712,
      'notin': 8713,
      'ni': 8715,
      'prod': 8719,
      'sum': 8721,
      'minus': 8722,
      'lowast': 8727,
      'radic': 8730,
      'prop': 8733,
      'infin': 8734,
      'ang': 8736,
      'and': 8743,
      'or': 8744,
      'cap': 8745,
      'cup': 8746,
      'int': 8747,
      'there4': 8756,
      'sim': 8764,
      'cong': 8773,
      'asymp': 8776,
      'ne': 8800,
      'equiv': 8801,
      'le': 8804,
      'ge': 8805,
      'sub': 8834,
      'sup': 8835,
      'nsub': 8836,
      'sube': 8838,
      'supe': 8839,
      'oplus': 8853,
      'otimes': 8855,
      'perp': 8869,
      'sdot': 8901,
      'lceil': 8968,
      'rceil': 8969,
      'lfloor': 8970,
      'rfloor': 8971,
      'lang': 9001,
      'rang': 9002,
      'loz': 9674,
      'spades': 9824,
      'clubs': 9827,
      'hearts': 9829,
      'diams': 9830
    };
    Object.keys(sax.ENTITIES).forEach(function (key) {
      var e = sax.ENTITIES[key];
      var s = typeof e === 'number' ? String.fromCharCode(e) : e;
      sax.ENTITIES[key] = s;
    });

    for (var s in sax.STATE) {
      sax.STATE[sax.STATE[s]] = s;
    }

    S = sax.STATE;

    function emit(parser, event, data) {
      parser[event] && parser[event](data);
    }

    function emitNode(parser, nodeType, data) {
      if (parser.textNode) closeText(parser);
      emit(parser, nodeType, data);
    }

    function closeText(parser) {
      parser.textNode = textopts(parser.opt, parser.textNode);
      if (parser.textNode) emit(parser, 'ontext', parser.textNode);
      parser.textNode = '';
    }

    function textopts(opt, text) {
      if (opt.trim) text = text.trim();
      if (opt.normalize) text = text.replace(/\s+/g, ' ');
      return text;
    }

    function error(parser, er) {
      closeText(parser);

      if (parser.trackPosition) {
        er += '\nLine: ' + parser.line + '\nColumn: ' + parser.column + '\nChar: ' + parser.c;
      }

      er = new Error(er);
      parser.error = er;
      emit(parser, 'onerror', er);
      return parser;
    }

    function end(parser) {
      if (parser.sawRoot && !parser.closedRoot) strictFail(parser, 'Unclosed root tag');

      if (parser.state !== S.BEGIN && parser.state !== S.BEGIN_WHITESPACE && parser.state !== S.TEXT) {
        error(parser, 'Unexpected end');
      }

      closeText(parser);
      parser.c = '';
      parser.closed = true;
      emit(parser, 'onend');
      SAXParser.call(parser, parser.strict, parser.opt);
      return parser;
    }

    function strictFail(parser, message) {
      if (typeof parser !== 'object' || !(parser instanceof SAXParser)) {
        throw new Error('bad call to strictFail');
      }

      if (parser.strict) {
        error(parser, message);
      }
    }

    function newTag(parser) {
      if (!parser.strict) parser.tagName = parser.tagName[parser.looseCase]();
      var parent = parser.tags[parser.tags.length - 1] || parser;
      var tag = parser.tag = {
        name: parser.tagName,
        attributes: {}
      };

      if (parser.opt.xmlns) {
        tag.ns = parent.ns;
      }

      parser.attribList.length = 0;
      emitNode(parser, 'onopentagstart', tag);
    }

    function qname(name, attribute) {
      var i = name.indexOf(':');
      var qualName = i < 0 ? ['', name] : name.split(':');
      var prefix = qualName[0];
      var local = qualName[1];

      if (attribute && name === 'xmlns') {
        prefix = 'xmlns';
        local = '';
      }

      return {
        prefix: prefix,
        local: local
      };
    }

    function attrib(parser) {
      if (!parser.strict) {
        parser.attribName = parser.attribName[parser.looseCase]();
      }

      if (parser.attribList.indexOf(parser.attribName) !== -1 || parser.tag.attributes.hasOwnProperty(parser.attribName)) {
        parser.attribName = parser.attribValue = '';
        return;
      }

      if (parser.opt.xmlns) {
        var qn = qname(parser.attribName, true);
        var prefix = qn.prefix;
        var local = qn.local;

        if (prefix === 'xmlns') {
          if (local === 'xml' && parser.attribValue !== XML_NAMESPACE) {
            strictFail(parser, 'xml: prefix must be bound to ' + XML_NAMESPACE + '\n' + 'Actual: ' + parser.attribValue);
          } else if (local === 'xmlns' && parser.attribValue !== XMLNS_NAMESPACE) {
            strictFail(parser, 'xmlns: prefix must be bound to ' + XMLNS_NAMESPACE + '\n' + 'Actual: ' + parser.attribValue);
          } else {
            var tag = parser.tag;
            var parent = parser.tags[parser.tags.length - 1] || parser;

            if (tag.ns === parent.ns) {
              tag.ns = Object.create(parent.ns);
            }

            tag.ns[local] = parser.attribValue;
          }
        }

        parser.attribList.push([parser.attribName, parser.attribValue]);
      } else {
        parser.tag.attributes[parser.attribName] = parser.attribValue;
        emitNode(parser, 'onattribute', {
          name: parser.attribName,
          value: parser.attribValue
        });
      }

      parser.attribName = parser.attribValue = '';
    }

    function openTag(parser, selfClosing) {
      if (parser.opt.xmlns) {
        var tag = parser.tag;
        var qn = qname(parser.tagName);
        tag.prefix = qn.prefix;
        tag.local = qn.local;
        tag.uri = tag.ns[qn.prefix] || '';

        if (tag.prefix && !tag.uri) {
          strictFail(parser, 'Unbound namespace prefix: ' + JSON.stringify(parser.tagName));
          tag.uri = qn.prefix;
        }

        var parent = parser.tags[parser.tags.length - 1] || parser;

        if (tag.ns && parent.ns !== tag.ns) {
          Object.keys(tag.ns).forEach(function (p) {
            emitNode(parser, 'onopennamespace', {
              prefix: p,
              uri: tag.ns[p]
            });
          });
        }

        for (var i = 0, l = parser.attribList.length; i < l; i++) {
          var nv = parser.attribList[i];
          var name = nv[0];
          var value = nv[1];
          var qualName = qname(name, true);
          var prefix = qualName.prefix;
          var local = qualName.local;
          var uri = prefix === '' ? '' : tag.ns[prefix] || '';
          var a = {
            name: name,
            value: value,
            prefix: prefix,
            local: local,
            uri: uri
          };

          if (prefix && prefix !== 'xmlns' && !uri) {
            strictFail(parser, 'Unbound namespace prefix: ' + JSON.stringify(prefix));
            a.uri = prefix;
          }

          parser.tag.attributes[name] = a;
          emitNode(parser, 'onattribute', a);
        }

        parser.attribList.length = 0;
      }

      parser.tag.isSelfClosing = !!selfClosing;
      parser.sawRoot = true;
      parser.tags.push(parser.tag);
      emitNode(parser, 'onopentag', parser.tag);

      if (!selfClosing) {
        if (!parser.noscript && parser.tagName.toLowerCase() === 'script') {
          parser.state = S.SCRIPT;
        } else {
          parser.state = S.TEXT;
        }

        parser.tag = null;
        parser.tagName = '';
      }

      parser.attribName = parser.attribValue = '';
      parser.attribList.length = 0;
    }

    function closeTag(parser) {
      if (!parser.tagName) {
        strictFail(parser, 'Weird empty close tag.');
        parser.textNode += '</>';
        parser.state = S.TEXT;
        return;
      }

      if (parser.script) {
        if (parser.tagName !== 'script') {
          parser.script += '</' + parser.tagName + '>';
          parser.tagName = '';
          parser.state = S.SCRIPT;
          return;
        }

        emitNode(parser, 'onscript', parser.script);
        parser.script = '';
      }

      var t = parser.tags.length;
      var tagName = parser.tagName;

      if (!parser.strict) {
        tagName = tagName[parser.looseCase]();
      }

      var closeTo = tagName;

      while (t--) {
        var close = parser.tags[t];

        if (close.name !== closeTo) {
          strictFail(parser, 'Unexpected close tag');
        } else {
          break;
        }
      }

      if (t < 0) {
        strictFail(parser, 'Unmatched closing tag: ' + parser.tagName);
        parser.textNode += '</' + parser.tagName + '>';
        parser.state = S.TEXT;
        return;
      }

      parser.tagName = tagName;
      var s = parser.tags.length;

      while (s-- > t) {
        var tag = parser.tag = parser.tags.pop();
        parser.tagName = parser.tag.name;
        emitNode(parser, 'onclosetag', parser.tagName);
        var x = {};

        for (var i in tag.ns) {
          x[i] = tag.ns[i];
        }

        var parent = parser.tags[parser.tags.length - 1] || parser;

        if (parser.opt.xmlns && tag.ns !== parent.ns) {
          Object.keys(tag.ns).forEach(function (p) {
            var n = tag.ns[p];
            emitNode(parser, 'onclosenamespace', {
              prefix: p,
              uri: n
            });
          });
        }
      }

      if (t === 0) parser.closedRoot = true;
      parser.tagName = parser.attribValue = parser.attribName = '';
      parser.attribList.length = 0;
      parser.state = S.TEXT;
    }

    function parseEntity(parser) {
      var entity = parser.entity;
      var entityLC = entity.toLowerCase();
      var num;
      var numStr = '';

      if (parser.ENTITIES[entity]) {
        return parser.ENTITIES[entity];
      }

      if (parser.ENTITIES[entityLC]) {
        return parser.ENTITIES[entityLC];
      }

      entity = entityLC;

      if (entity.charAt(0) === '#') {
        if (entity.charAt(1) === 'x') {
          entity = entity.slice(2);
          num = parseInt(entity, 16);
          numStr = num.toString(16);
        } else {
          entity = entity.slice(1);
          num = parseInt(entity, 10);
          numStr = num.toString(10);
        }
      }

      entity = entity.replace(/^0+/, '');

      if (isNaN(num) || numStr.toLowerCase() !== entity) {
        strictFail(parser, 'Invalid character entity');
        return '&' + parser.entity + ';';
      }

      return String.fromCodePoint(num);
    }

    function beginWhiteSpace(parser, c) {
      if (c === '<') {
        parser.state = S.OPEN_WAKA;
        parser.startTagPosition = parser.position;
      } else if (!isWhitespace(c)) {
        strictFail(parser, 'Non-whitespace before first tag.');
        parser.textNode = c;
        parser.state = S.TEXT;
      }
    }

    function charAt(chunk, i) {
      var result = '';

      if (i < chunk.length) {
        result = chunk.charAt(i);
      }

      return result;
    }

    function write(chunk) {
      var parser = this;

      if (this.error) {
        throw this.error;
      }

      if (parser.closed) {
        return error(parser, 'Cannot write after close. Assign an onready handler.');
      }

      if (chunk === null) {
        return end(parser);
      }

      if (typeof chunk === 'object') {
        chunk = chunk.toString();
      }

      var i = 0;
      var c = '';

      while (true) {
        c = charAt(chunk, i++);
        parser.c = c;

        if (!c) {
          break;
        }

        if (parser.trackPosition) {
          parser.position++;

          if (c === '\n') {
            parser.line++;
            parser.column = 0;
          } else {
            parser.column++;
          }
        }

        switch (parser.state) {
          case S.BEGIN:
            parser.state = S.BEGIN_WHITESPACE;

            if (c === '\uFEFF') {
              continue;
            }

            beginWhiteSpace(parser, c);
            continue;

          case S.BEGIN_WHITESPACE:
            beginWhiteSpace(parser, c);
            continue;

          case S.TEXT:
            if (parser.sawRoot && !parser.closedRoot) {
              var starti = i - 1;

              while (c && c !== '<' && c !== '&') {
                c = charAt(chunk, i++);

                if (c && parser.trackPosition) {
                  parser.position++;

                  if (c === '\n') {
                    parser.line++;
                    parser.column = 0;
                  } else {
                    parser.column++;
                  }
                }
              }

              parser.textNode += chunk.substring(starti, i - 1);
            }

            if (c === '<' && !(parser.sawRoot && parser.closedRoot && !parser.strict)) {
              parser.state = S.OPEN_WAKA;
              parser.startTagPosition = parser.position;
            } else {
              if (!isWhitespace(c) && (!parser.sawRoot || parser.closedRoot)) {
                strictFail(parser, 'Text data outside of root node.');
              }

              if (c === '&') {
                parser.state = S.TEXT_ENTITY;
              } else {
                parser.textNode += c;
              }
            }

            continue;

          case S.SCRIPT:
            if (c === '<') {
              parser.state = S.SCRIPT_ENDING;
            } else {
              parser.script += c;
            }

            continue;

          case S.SCRIPT_ENDING:
            if (c === '/') {
              parser.state = S.CLOSE_TAG;
            } else {
              parser.script += '<' + c;
              parser.state = S.SCRIPT;
            }

            continue;

          case S.OPEN_WAKA:
            if (c === '!') {
              parser.state = S.SGML_DECL;
              parser.sgmlDecl = '';
            } else if (isWhitespace(c)) {} else if (isMatch(nameStart, c)) {
              parser.state = S.OPEN_TAG;
              parser.tagName = c;
            } else if (c === '/') {
              parser.state = S.CLOSE_TAG;
              parser.tagName = '';
            } else if (c === '?') {
              parser.state = S.PROC_INST;
              parser.procInstName = parser.procInstBody = '';
            } else {
              strictFail(parser, 'Unencoded <');

              if (parser.startTagPosition + 1 < parser.position) {
                var pad = parser.position - parser.startTagPosition;
                c = new Array(pad).join(' ') + c;
              }

              parser.textNode += '<' + c;
              parser.state = S.TEXT;
            }

            continue;

          case S.SGML_DECL:
            if ((parser.sgmlDecl + c).toUpperCase() === CDATA) {
              emitNode(parser, 'onopencdata');
              parser.state = S.CDATA;
              parser.sgmlDecl = '';
              parser.cdata = '';
            } else if (parser.sgmlDecl + c === '--') {
              parser.state = S.COMMENT;
              parser.comment = '';
              parser.sgmlDecl = '';
            } else if ((parser.sgmlDecl + c).toUpperCase() === DOCTYPE) {
              parser.state = S.DOCTYPE;

              if (parser.doctype || parser.sawRoot) {
                strictFail(parser, 'Inappropriately located doctype declaration');
              }

              parser.doctype = '';
              parser.sgmlDecl = '';
            } else if (c === '>') {
              emitNode(parser, 'onsgmldeclaration', parser.sgmlDecl);
              parser.sgmlDecl = '';
              parser.state = S.TEXT;
            } else if (isQuote(c)) {
              parser.state = S.SGML_DECL_QUOTED;
              parser.sgmlDecl += c;
            } else {
              parser.sgmlDecl += c;
            }

            continue;

          case S.SGML_DECL_QUOTED:
            if (c === parser.q) {
              parser.state = S.SGML_DECL;
              parser.q = '';
            }

            parser.sgmlDecl += c;
            continue;

          case S.DOCTYPE:
            if (c === '>') {
              parser.state = S.TEXT;
              emitNode(parser, 'ondoctype', parser.doctype);
              parser.doctype = true;
            } else {
              parser.doctype += c;

              if (c === '[') {
                parser.state = S.DOCTYPE_DTD;
              } else if (isQuote(c)) {
                parser.state = S.DOCTYPE_QUOTED;
                parser.q = c;
              }
            }

            continue;

          case S.DOCTYPE_QUOTED:
            parser.doctype += c;

            if (c === parser.q) {
              parser.q = '';
              parser.state = S.DOCTYPE;
            }

            continue;

          case S.DOCTYPE_DTD:
            parser.doctype += c;

            if (c === ']') {
              parser.state = S.DOCTYPE;
            } else if (isQuote(c)) {
              parser.state = S.DOCTYPE_DTD_QUOTED;
              parser.q = c;
            }

            continue;

          case S.DOCTYPE_DTD_QUOTED:
            parser.doctype += c;

            if (c === parser.q) {
              parser.state = S.DOCTYPE_DTD;
              parser.q = '';
            }

            continue;

          case S.COMMENT:
            if (c === '-') {
              parser.state = S.COMMENT_ENDING;
            } else {
              parser.comment += c;
            }

            continue;

          case S.COMMENT_ENDING:
            if (c === '-') {
              parser.state = S.COMMENT_ENDED;
              parser.comment = textopts(parser.opt, parser.comment);

              if (parser.comment) {
                emitNode(parser, 'oncomment', parser.comment);
              }

              parser.comment = '';
            } else {
              parser.comment += '-' + c;
              parser.state = S.COMMENT;
            }

            continue;

          case S.COMMENT_ENDED:
            if (c !== '>') {
              strictFail(parser, 'Malformed comment');
              parser.comment += '--' + c;
              parser.state = S.COMMENT;
            } else {
              parser.state = S.TEXT;
            }

            continue;

          case S.CDATA:
            if (c === ']') {
              parser.state = S.CDATA_ENDING;
            } else {
              parser.cdata += c;
            }

            continue;

          case S.CDATA_ENDING:
            if (c === ']') {
              parser.state = S.CDATA_ENDING_2;
            } else {
              parser.cdata += ']' + c;
              parser.state = S.CDATA;
            }

            continue;

          case S.CDATA_ENDING_2:
            if (c === '>') {
              if (parser.cdata) {
                emitNode(parser, 'oncdata', parser.cdata);
              }

              emitNode(parser, 'onclosecdata');
              parser.cdata = '';
              parser.state = S.TEXT;
            } else if (c === ']') {
              parser.cdata += ']';
            } else {
              parser.cdata += ']]' + c;
              parser.state = S.CDATA;
            }

            continue;

          case S.PROC_INST:
            if (c === '?') {
              parser.state = S.PROC_INST_ENDING;
            } else if (isWhitespace(c)) {
              parser.state = S.PROC_INST_BODY;
            } else {
              parser.procInstName += c;
            }

            continue;

          case S.PROC_INST_BODY:
            if (!parser.procInstBody && isWhitespace(c)) {
              continue;
            } else if (c === '?') {
              parser.state = S.PROC_INST_ENDING;
            } else {
              parser.procInstBody += c;
            }

            continue;

          case S.PROC_INST_ENDING:
            if (c === '>') {
              emitNode(parser, 'onprocessinginstruction', {
                name: parser.procInstName,
                body: parser.procInstBody
              });
              parser.procInstName = parser.procInstBody = '';
              parser.state = S.TEXT;
            } else {
              parser.procInstBody += '?' + c;
              parser.state = S.PROC_INST_BODY;
            }

            continue;

          case S.OPEN_TAG:
            if (isMatch(nameBody, c)) {
              parser.tagName += c;
            } else {
              newTag(parser);

              if (c === '>') {
                openTag(parser);
              } else if (c === '/') {
                parser.state = S.OPEN_TAG_SLASH;
              } else {
                if (!isWhitespace(c)) {
                  strictFail(parser, 'Invalid character in tag name');
                }

                parser.state = S.ATTRIB;
              }
            }

            continue;

          case S.OPEN_TAG_SLASH:
            if (c === '>') {
              openTag(parser, true);
              closeTag(parser);
            } else {
              strictFail(parser, 'Forward-slash in opening tag not followed by >');
              parser.state = S.ATTRIB;
            }

            continue;

          case S.ATTRIB:
            if (isWhitespace(c)) {
              continue;
            } else if (c === '>') {
              openTag(parser);
            } else if (c === '/') {
              parser.state = S.OPEN_TAG_SLASH;
            } else if (isMatch(nameStart, c)) {
              parser.attribName = c;
              parser.attribValue = '';
              parser.state = S.ATTRIB_NAME;
            } else {
              strictFail(parser, 'Invalid attribute name');
            }

            continue;

          case S.ATTRIB_NAME:
            if (c === '=') {
              parser.state = S.ATTRIB_VALUE;
            } else if (c === '>') {
              strictFail(parser, 'Attribute without value');
              parser.attribValue = parser.attribName;
              attrib(parser);
              openTag(parser);
            } else if (isWhitespace(c)) {
              parser.state = S.ATTRIB_NAME_SAW_WHITE;
            } else if (isMatch(nameBody, c)) {
              parser.attribName += c;
            } else {
              strictFail(parser, 'Invalid attribute name');
            }

            continue;

          case S.ATTRIB_NAME_SAW_WHITE:
            if (c === '=') {
              parser.state = S.ATTRIB_VALUE;
            } else if (isWhitespace(c)) {
              continue;
            } else {
              strictFail(parser, 'Attribute without value');
              parser.tag.attributes[parser.attribName] = '';
              parser.attribValue = '';
              emitNode(parser, 'onattribute', {
                name: parser.attribName,
                value: ''
              });
              parser.attribName = '';

              if (c === '>') {
                openTag(parser);
              } else if (isMatch(nameStart, c)) {
                parser.attribName = c;
                parser.state = S.ATTRIB_NAME;
              } else {
                strictFail(parser, 'Invalid attribute name');
                parser.state = S.ATTRIB;
              }
            }

            continue;

          case S.ATTRIB_VALUE:
            if (isWhitespace(c)) {
              continue;
            } else if (isQuote(c)) {
              parser.q = c;
              parser.state = S.ATTRIB_VALUE_QUOTED;
            } else {
              strictFail(parser, 'Unquoted attribute value');
              parser.state = S.ATTRIB_VALUE_UNQUOTED;
              parser.attribValue = c;
            }

            continue;

          case S.ATTRIB_VALUE_QUOTED:
            if (c !== parser.q) {
              if (c === '&') {
                parser.state = S.ATTRIB_VALUE_ENTITY_Q;
              } else {
                parser.attribValue += c;
              }

              continue;
            }

            attrib(parser);
            parser.q = '';
            parser.state = S.ATTRIB_VALUE_CLOSED;
            continue;

          case S.ATTRIB_VALUE_CLOSED:
            if (isWhitespace(c)) {
              parser.state = S.ATTRIB;
            } else if (c === '>') {
              openTag(parser);
            } else if (c === '/') {
              parser.state = S.OPEN_TAG_SLASH;
            } else if (isMatch(nameStart, c)) {
              strictFail(parser, 'No whitespace between attributes');
              parser.attribName = c;
              parser.attribValue = '';
              parser.state = S.ATTRIB_NAME;
            } else {
              strictFail(parser, 'Invalid attribute name');
            }

            continue;

          case S.ATTRIB_VALUE_UNQUOTED:
            if (!isAttribEnd(c)) {
              if (c === '&') {
                parser.state = S.ATTRIB_VALUE_ENTITY_U;
              } else {
                parser.attribValue += c;
              }

              continue;
            }

            attrib(parser);

            if (c === '>') {
              openTag(parser);
            } else {
              parser.state = S.ATTRIB;
            }

            continue;

          case S.CLOSE_TAG:
            if (!parser.tagName) {
              if (isWhitespace(c)) {
                continue;
              } else if (notMatch(nameStart, c)) {
                if (parser.script) {
                  parser.script += '</' + c;
                  parser.state = S.SCRIPT;
                } else {
                  strictFail(parser, 'Invalid tagname in closing tag.');
                }
              } else {
                parser.tagName = c;
              }
            } else if (c === '>') {
              closeTag(parser);
            } else if (isMatch(nameBody, c)) {
              parser.tagName += c;
            } else if (parser.script) {
              parser.script += '</' + parser.tagName;
              parser.tagName = '';
              parser.state = S.SCRIPT;
            } else {
              if (!isWhitespace(c)) {
                strictFail(parser, 'Invalid tagname in closing tag');
              }

              parser.state = S.CLOSE_TAG_SAW_WHITE;
            }

            continue;

          case S.CLOSE_TAG_SAW_WHITE:
            if (isWhitespace(c)) {
              continue;
            }

            if (c === '>') {
              closeTag(parser);
            } else {
              strictFail(parser, 'Invalid characters in closing tag');
            }

            continue;

          case S.TEXT_ENTITY:
          case S.ATTRIB_VALUE_ENTITY_Q:
          case S.ATTRIB_VALUE_ENTITY_U:
            var returnState;
            var buffer;

            switch (parser.state) {
              case S.TEXT_ENTITY:
                returnState = S.TEXT;
                buffer = 'textNode';
                break;

              case S.ATTRIB_VALUE_ENTITY_Q:
                returnState = S.ATTRIB_VALUE_QUOTED;
                buffer = 'attribValue';
                break;

              case S.ATTRIB_VALUE_ENTITY_U:
                returnState = S.ATTRIB_VALUE_UNQUOTED;
                buffer = 'attribValue';
                break;
            }

            if (c === ';') {
              parser[buffer] += parseEntity(parser);
              parser.entity = '';
              parser.state = returnState;
            } else if (isMatch(parser.entity.length ? entityBody : entityStart, c)) {
              parser.entity += c;
            } else {
              strictFail(parser, 'Invalid character in entity name');
              parser[buffer] += '&' + parser.entity + c;
              parser.entity = '';
              parser.state = returnState;
            }

            continue;

          default:
            throw new Error(parser, 'Unknown state: ' + parser.state);
        }
      }

      if (parser.position >= parser.bufferCheckPosition) {
        checkBufferLength(parser);
      }

      return parser;
    }

    if (!String.fromCodePoint) {
      (function () {
        var stringFromCharCode = String.fromCharCode;
        var floor = Math.floor;

        var fromCodePoint = function () {
          var MAX_SIZE = 0x4000;
          var codeUnits = [];
          var highSurrogate;
          var lowSurrogate;
          var index = -1;
          var length = arguments.length;

          if (!length) {
            return '';
          }

          var result = '';

          while (++index < length) {
            var codePoint = Number(arguments[index]);

            if (!isFinite(codePoint) || codePoint < 0 || codePoint > 0x10FFFF || floor(codePoint) !== codePoint) {
                throw RangeError('Invalid code point: ' + codePoint);
              }

            if (codePoint <= 0xFFFF) {
              codeUnits.push(codePoint);
            } else {
              codePoint -= 0x10000;
              highSurrogate = (codePoint >> 10) + 0xD800;
              lowSurrogate = codePoint % 0x400 + 0xDC00;
              codeUnits.push(highSurrogate, lowSurrogate);
            }

            if (index + 1 === length || codeUnits.length > MAX_SIZE) {
              result += stringFromCharCode.apply(null, codeUnits);
              codeUnits.length = 0;
            }
          }

          return result;
        };

        if (Object.defineProperty) {
          Object.defineProperty(String, 'fromCodePoint', {
            value: fromCodePoint,
            configurable: true,
            writable: true
          });
        } else {
          String.fromCodePoint = fromCodePoint;
        }
      })();
    }
  })(typeof exports === 'undefined' ? this.sax = {} : exports);
},16,[17,19],"node_modules/xml-js/node_modules/sax/lib/sax.js");
__d(function (global, _$$_REQUIRE, _$$_IMPORT_DEFAULT, _$$_IMPORT_ALL, module, exports, _dependencyMap) {
  "use strict";

  var Emitter = _$$_REQUIRE(_dependencyMap[0], "emitter");

  function Stream() {
    Emitter.call(this);
  }

  Stream.prototype = new Emitter();
  module.exports = Stream;
  Stream.Stream = Stream;

  Stream.prototype.pipe = function (dest, options) {
    var source = this;

    function ondata(chunk) {
      if (dest.writable) {
        if (false === dest.write(chunk) && source.pause) {
          source.pause();
        }
      }
    }

    source.on('data', ondata);

    function ondrain() {
      if (source.readable && source.resume) {
        source.resume();
      }
    }

    dest.on('drain', ondrain);

    if (!dest._isStdio && (!options || options.end !== false)) {
      source.on('end', onend);
      source.on('close', onclose);
    }

    var didOnEnd = false;

    function onend() {
      if (didOnEnd) return;
      didOnEnd = true;
      dest.end();
    }

    function onclose() {
      if (didOnEnd) return;
      didOnEnd = true;
      if (typeof dest.destroy === 'function') dest.destroy();
    }

    function onerror(er) {
      cleanup();

      if (!this.hasListeners('error')) {
        throw er;
      }
    }

    source.on('error', onerror);
    dest.on('error', onerror);

    function cleanup() {
      source.off('data', ondata);
      dest.off('drain', ondrain);
      source.off('end', onend);
      source.off('close', onclose);
      source.off('error', onerror);
      dest.off('error', onerror);
      source.off('end', cleanup);
      source.off('close', cleanup);
      dest.off('end', cleanup);
      dest.off('close', cleanup);
    }

    source.on('end', cleanup);
    source.on('close', cleanup);
    dest.on('end', cleanup);
    dest.on('close', cleanup);
    dest.emit('pipe', source);
    return dest;
  };
},17,[18],"node_modules/stream/index.js");
__d(function (global, _$$_REQUIRE, _$$_IMPORT_DEFAULT, _$$_IMPORT_ALL, module, exports, _dependencyMap) {
  "use strict";

  module.exports = Emitter;

  function Emitter(obj) {
    if (obj) return mixin(obj);
  }

  ;

  function mixin(obj) {
    for (var key in Emitter.prototype) {
      obj[key] = Emitter.prototype[key];
    }

    return obj;
  }

  Emitter.prototype.on = Emitter.prototype.addEventListener = function (event, fn) {
    this._callbacks = this._callbacks || {};
    (this._callbacks[event] = this._callbacks[event] || []).push(fn);
    return this;
  };

  Emitter.prototype.once = function (event, fn) {
    var self = this;
    this._callbacks = this._callbacks || {};

    function on() {
      self.off(event, on);
      fn.apply(this, arguments);
    }

    on.fn = fn;
    this.on(event, on);
    return this;
  };

  Emitter.prototype.off = Emitter.prototype.removeListener = Emitter.prototype.removeAllListeners = Emitter.prototype.removeEventListener = function (event, fn) {
    this._callbacks = this._callbacks || {};

    if (0 == arguments.length) {
      this._callbacks = {};
      return this;
    }

    var callbacks = this._callbacks[event];
    if (!callbacks) return this;

    if (1 == arguments.length) {
      delete this._callbacks[event];
      return this;
    }

    var cb;

    for (var i = 0; i < callbacks.length; i++) {
      cb = callbacks[i];

      if (cb === fn || cb.fn === fn) {
        callbacks.splice(i, 1);
        break;
      }
    }

    return this;
  };

  Emitter.prototype.emit = function (event) {
    this._callbacks = this._callbacks || {};
    var args = [].slice.call(arguments, 1),
        callbacks = this._callbacks[event];

    if (callbacks) {
      callbacks = callbacks.slice(0);

      for (var i = 0, len = callbacks.length; i < len; ++i) {
        callbacks[i].apply(this, args);
      }
    }

    return this;
  };

  Emitter.prototype.listeners = function (event) {
    this._callbacks = this._callbacks || {};
    return this._callbacks[event] || [];
  };

  Emitter.prototype.hasListeners = function (event) {
    return !!this.listeners(event).length;
  };
},18,[],"node_modules/emitter-component/index.js");
__d(function (global, _$$_REQUIRE, _$$_IMPORT_DEFAULT, _$$_IMPORT_ALL, module, exports, _dependencyMap) {
  'use strict';

  var Buffer = _$$_REQUIRE(_dependencyMap[0], "safe-buffer").Buffer;

  var isEncoding = Buffer.isEncoding || function (encoding) {
    encoding = '' + encoding;

    switch (encoding && encoding.toLowerCase()) {
      case 'hex':
      case 'utf8':
      case 'utf-8':
      case 'ascii':
      case 'binary':
      case 'base64':
      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
      case 'raw':
        return true;

      default:
        return false;
    }
  };

  function _normalizeEncoding(enc) {
    if (!enc) return 'utf8';
    var retried;

    while (true) {
      switch (enc) {
        case 'utf8':
        case 'utf-8':
          return 'utf8';

        case 'ucs2':
        case 'ucs-2':
        case 'utf16le':
        case 'utf-16le':
          return 'utf16le';

        case 'latin1':
        case 'binary':
          return 'latin1';

        case 'base64':
        case 'ascii':
        case 'hex':
          return enc;

        default:
          if (retried) return;
          enc = ('' + enc).toLowerCase();
          retried = true;
      }
    }
  }

  ;

  function normalizeEncoding(enc) {
    var nenc = _normalizeEncoding(enc);

    if (typeof nenc !== 'string' && (Buffer.isEncoding === isEncoding || !isEncoding(enc))) throw new Error('Unknown encoding: ' + enc);
    return nenc || enc;
  }

  exports.StringDecoder = StringDecoder;

  function StringDecoder(encoding) {
    this.encoding = normalizeEncoding(encoding);
    var nb;

    switch (this.encoding) {
      case 'utf16le':
        this.text = utf16Text;
        this.end = utf16End;
        nb = 4;
        break;

      case 'utf8':
        this.fillLast = utf8FillLast;
        nb = 4;
        break;

      case 'base64':
        this.text = base64Text;
        this.end = base64End;
        nb = 3;
        break;

      default:
        this.write = simpleWrite;
        this.end = simpleEnd;
        return;
    }

    this.lastNeed = 0;
    this.lastTotal = 0;
    this.lastChar = Buffer.allocUnsafe(nb);
  }

  StringDecoder.prototype.write = function (buf) {
    if (buf.length === 0) return '';
    var r;
    var i;

    if (this.lastNeed) {
      r = this.fillLast(buf);
      if (r === undefined) return '';
      i = this.lastNeed;
      this.lastNeed = 0;
    } else {
      i = 0;
    }

    if (i < buf.length) return r ? r + this.text(buf, i) : this.text(buf, i);
    return r || '';
  };

  StringDecoder.prototype.end = utf8End;
  StringDecoder.prototype.text = utf8Text;

  StringDecoder.prototype.fillLast = function (buf) {
    if (this.lastNeed <= buf.length) {
      buf.copy(this.lastChar, this.lastTotal - this.lastNeed, 0, this.lastNeed);
      return this.lastChar.toString(this.encoding, 0, this.lastTotal);
    }

    buf.copy(this.lastChar, this.lastTotal - this.lastNeed, 0, buf.length);
    this.lastNeed -= buf.length;
  };

  function utf8CheckByte(byte) {
    if (byte <= 0x7F) return 0;else if (byte >> 5 === 0x06) return 2;else if (byte >> 4 === 0x0E) return 3;else if (byte >> 3 === 0x1E) return 4;
    return byte >> 6 === 0x02 ? -1 : -2;
  }

  function utf8CheckIncomplete(self, buf, i) {
    var j = buf.length - 1;
    if (j < i) return 0;
    var nb = utf8CheckByte(buf[j]);

    if (nb >= 0) {
      if (nb > 0) self.lastNeed = nb - 1;
      return nb;
    }

    if (--j < i || nb === -2) return 0;
    nb = utf8CheckByte(buf[j]);

    if (nb >= 0) {
      if (nb > 0) self.lastNeed = nb - 2;
      return nb;
    }

    if (--j < i || nb === -2) return 0;
    nb = utf8CheckByte(buf[j]);

    if (nb >= 0) {
      if (nb > 0) {
        if (nb === 2) nb = 0;else self.lastNeed = nb - 3;
      }

      return nb;
    }

    return 0;
  }

  function utf8CheckExtraBytes(self, buf, p) {
    if ((buf[0] & 0xC0) !== 0x80) {
      self.lastNeed = 0;
      return '\ufffd';
    }

    if (self.lastNeed > 1 && buf.length > 1) {
      if ((buf[1] & 0xC0) !== 0x80) {
        self.lastNeed = 1;
        return '\ufffd';
      }

      if (self.lastNeed > 2 && buf.length > 2) {
        if ((buf[2] & 0xC0) !== 0x80) {
          self.lastNeed = 2;
          return '\ufffd';
        }
      }
    }
  }

  function utf8FillLast(buf) {
    var p = this.lastTotal - this.lastNeed;
    var r = utf8CheckExtraBytes(this, buf, p);
    if (r !== undefined) return r;

    if (this.lastNeed <= buf.length) {
      buf.copy(this.lastChar, p, 0, this.lastNeed);
      return this.lastChar.toString(this.encoding, 0, this.lastTotal);
    }

    buf.copy(this.lastChar, p, 0, buf.length);
    this.lastNeed -= buf.length;
  }

  function utf8Text(buf, i) {
    var total = utf8CheckIncomplete(this, buf, i);
    if (!this.lastNeed) return buf.toString('utf8', i);
    this.lastTotal = total;
    var end = buf.length - (total - this.lastNeed);
    buf.copy(this.lastChar, 0, end);
    return buf.toString('utf8', i, end);
  }

  function utf8End(buf) {
    var r = buf && buf.length ? this.write(buf) : '';
    if (this.lastNeed) return r + '\ufffd';
    return r;
  }

  function utf16Text(buf, i) {
    if ((buf.length - i) % 2 === 0) {
      var r = buf.toString('utf16le', i);

      if (r) {
        var c = r.charCodeAt(r.length - 1);

        if (c >= 0xD800 && c <= 0xDBFF) {
          this.lastNeed = 2;
          this.lastTotal = 4;
          this.lastChar[0] = buf[buf.length - 2];
          this.lastChar[1] = buf[buf.length - 1];
          return r.slice(0, -1);
        }
      }

      return r;
    }

    this.lastNeed = 1;
    this.lastTotal = 2;
    this.lastChar[0] = buf[buf.length - 1];
    return buf.toString('utf16le', i, buf.length - 1);
  }

  function utf16End(buf) {
    var r = buf && buf.length ? this.write(buf) : '';

    if (this.lastNeed) {
      var end = this.lastTotal - this.lastNeed;
      return r + this.lastChar.toString('utf16le', 0, end);
    }

    return r;
  }

  function base64Text(buf, i) {
    var n = (buf.length - i) % 3;
    if (n === 0) return buf.toString('base64', i);
    this.lastNeed = 3 - n;
    this.lastTotal = 3;

    if (n === 1) {
      this.lastChar[0] = buf[buf.length - 1];
    } else {
      this.lastChar[0] = buf[buf.length - 2];
      this.lastChar[1] = buf[buf.length - 1];
    }

    return buf.toString('base64', i, buf.length - n);
  }

  function base64End(buf) {
    var r = buf && buf.length ? this.write(buf) : '';
    if (this.lastNeed) return r + this.lastChar.toString('base64', 0, 3 - this.lastNeed);
    return r;
  }

  function simpleWrite(buf) {
    return buf.toString(this.encoding);
  }

  function simpleEnd(buf) {
    return buf && buf.length ? this.write(buf) : '';
  }
},19,[20],"node_modules/string_decoder/lib/string_decoder.js");
__d(function (global, _$$_REQUIRE, _$$_IMPORT_DEFAULT, _$$_IMPORT_ALL, module, exports, _dependencyMap) {
  "use strict";

  var buffer = _$$_REQUIRE(_dependencyMap[0], "buffer");

  var Buffer = buffer.Buffer;

  function copyProps(src, dst) {
    for (var key in src) {
      dst[key] = src[key];
    }
  }

  if (Buffer.from && Buffer.alloc && Buffer.allocUnsafe && Buffer.allocUnsafeSlow) {
    module.exports = buffer;
  } else {
    copyProps(buffer, exports);
    exports.Buffer = SafeBuffer;
  }

  function SafeBuffer(arg, encodingOrOffset, length) {
    return Buffer(arg, encodingOrOffset, length);
  }

  copyProps(Buffer, SafeBuffer);

  SafeBuffer.from = function (arg, encodingOrOffset, length) {
    if (typeof arg === 'number') {
      throw new TypeError('Argument must not be a number');
    }

    return Buffer(arg, encodingOrOffset, length);
  };

  SafeBuffer.alloc = function (size, fill, encoding) {
    if (typeof size !== 'number') {
      throw new TypeError('Argument must be a number');
    }

    var buf = Buffer(size);

    if (fill !== undefined) {
      if (typeof encoding === 'string') {
        buf.fill(fill, encoding);
      } else {
        buf.fill(fill);
      }
    } else {
      buf.fill(0);
    }

    return buf;
  };

  SafeBuffer.allocUnsafe = function (size) {
    if (typeof size !== 'number') {
      throw new TypeError('Argument must be a number');
    }

    return Buffer(size);
  };

  SafeBuffer.allocUnsafeSlow = function (size) {
    if (typeof size !== 'number') {
      throw new TypeError('Argument must be a number');
    }

    return buffer.SlowBuffer(size);
  };
},20,[21],"node_modules/safe-buffer/index.js");
__d(function (global, _$$_REQUIRE, _$$_IMPORT_DEFAULT, _$$_IMPORT_ALL, module, exports, _dependencyMap) {
  /*!
   * The buffer module from node.js, for the browser.
   *
   * @author   Feross Aboukhadijeh <https://feross.org>
   * @license  MIT
   */
  'use strict';

  var base64 = _$$_REQUIRE(_dependencyMap[0], "base64-js");

  var ieee754 = _$$_REQUIRE(_dependencyMap[1], "ieee754");

  exports.Buffer = Buffer;
  exports.SlowBuffer = SlowBuffer;
  exports.INSPECT_MAX_BYTES = 50;
  var K_MAX_LENGTH = 0x7fffffff;
  exports.kMaxLength = K_MAX_LENGTH;
  Buffer.TYPED_ARRAY_SUPPORT = typedArraySupport();

  if (!Buffer.TYPED_ARRAY_SUPPORT && typeof console !== 'undefined' && typeof console.error === 'function') {
    console.error('This browser lacks typed array (Uint8Array) support which is required by ' + '`buffer` v5.x. Use `buffer` v4.x if you require old browser support.');
  }

  function typedArraySupport() {
    try {
      var arr = new Uint8Array(1);
      arr.__proto__ = {
        __proto__: Uint8Array.prototype,
        foo: function () {
          return 42;
        }
      };
      return arr.foo() === 42;
    } catch (e) {
      return false;
    }
  }

  Object.defineProperty(Buffer.prototype, 'parent', {
    enumerable: true,
    get: function () {
      if (!Buffer.isBuffer(this)) return undefined;
      return this.buffer;
    }
  });
  Object.defineProperty(Buffer.prototype, 'offset', {
    enumerable: true,
    get: function () {
      if (!Buffer.isBuffer(this)) return undefined;
      return this.byteOffset;
    }
  });

  function createBuffer(length) {
    if (length > K_MAX_LENGTH) {
      throw new RangeError('The value "' + length + '" is invalid for option "size"');
    }

    var buf = new Uint8Array(length);
    buf.__proto__ = Buffer.prototype;
    return buf;
  }

  function Buffer(arg, encodingOrOffset, length) {
    if (typeof arg === 'number') {
      if (typeof encodingOrOffset === 'string') {
        throw new TypeError('The "string" argument must be of type string. Received type number');
      }

      return allocUnsafe(arg);
    }

    return from(arg, encodingOrOffset, length);
  }

  if (typeof Symbol !== 'undefined' && Symbol.species != null && Buffer[Symbol.species] === Buffer) {
    Object.defineProperty(Buffer, Symbol.species, {
      value: null,
      configurable: true,
      enumerable: false,
      writable: false
    });
  }

  Buffer.poolSize = 8192;

  function from(value, encodingOrOffset, length) {
    if (typeof value === 'string') {
      return fromString(value, encodingOrOffset);
    }

    if (ArrayBuffer.isView(value)) {
      return fromArrayLike(value);
    }

    if (value == null) {
      throw TypeError('The first argument must be one of type string, Buffer, ArrayBuffer, Array, ' + 'or Array-like Object. Received type ' + typeof value);
    }

    if (isInstance(value, ArrayBuffer) || value && isInstance(value.buffer, ArrayBuffer)) {
      return fromArrayBuffer(value, encodingOrOffset, length);
    }

    if (typeof value === 'number') {
      throw new TypeError('The "value" argument must not be of type number. Received type number');
    }

    var valueOf = value.valueOf && value.valueOf();

    if (valueOf != null && valueOf !== value) {
      return Buffer.from(valueOf, encodingOrOffset, length);
    }

    var b = fromObject(value);
    if (b) return b;

    if (typeof Symbol !== 'undefined' && Symbol.toPrimitive != null && typeof value[Symbol.toPrimitive] === 'function') {
      return Buffer.from(value[Symbol.toPrimitive]('string'), encodingOrOffset, length);
    }

    throw new TypeError('The first argument must be one of type string, Buffer, ArrayBuffer, Array, ' + 'or Array-like Object. Received type ' + typeof value);
  }

  Buffer.from = function (value, encodingOrOffset, length) {
    return from(value, encodingOrOffset, length);
  };

  Buffer.prototype.__proto__ = Uint8Array.prototype;
  Buffer.__proto__ = Uint8Array;

  function assertSize(size) {
    if (typeof size !== 'number') {
      throw new TypeError('"size" argument must be of type number');
    } else if (size < 0) {
      throw new RangeError('The value "' + size + '" is invalid for option "size"');
    }
  }

  function alloc(size, fill, encoding) {
    assertSize(size);

    if (size <= 0) {
      return createBuffer(size);
    }

    if (fill !== undefined) {
      return typeof encoding === 'string' ? createBuffer(size).fill(fill, encoding) : createBuffer(size).fill(fill);
    }

    return createBuffer(size);
  }

  Buffer.alloc = function (size, fill, encoding) {
    return alloc(size, fill, encoding);
  };

  function allocUnsafe(size) {
    assertSize(size);
    return createBuffer(size < 0 ? 0 : checked(size) | 0);
  }

  Buffer.allocUnsafe = function (size) {
    return allocUnsafe(size);
  };

  Buffer.allocUnsafeSlow = function (size) {
    return allocUnsafe(size);
  };

  function fromString(string, encoding) {
    if (typeof encoding !== 'string' || encoding === '') {
      encoding = 'utf8';
    }

    if (!Buffer.isEncoding(encoding)) {
      throw new TypeError('Unknown encoding: ' + encoding);
    }

    var length = byteLength(string, encoding) | 0;
    var buf = createBuffer(length);
    var actual = buf.write(string, encoding);

    if (actual !== length) {
      buf = buf.slice(0, actual);
    }

    return buf;
  }

  function fromArrayLike(array) {
    var length = array.length < 0 ? 0 : checked(array.length) | 0;
    var buf = createBuffer(length);

    for (var i = 0; i < length; i += 1) {
      buf[i] = array[i] & 255;
    }

    return buf;
  }

  function fromArrayBuffer(array, byteOffset, length) {
    if (byteOffset < 0 || array.byteLength < byteOffset) {
      throw new RangeError('"offset" is outside of buffer bounds');
    }

    if (array.byteLength < byteOffset + (length || 0)) {
      throw new RangeError('"length" is outside of buffer bounds');
    }

    var buf;

    if (byteOffset === undefined && length === undefined) {
      buf = new Uint8Array(array);
    } else if (length === undefined) {
      buf = new Uint8Array(array, byteOffset);
    } else {
      buf = new Uint8Array(array, byteOffset, length);
    }

    buf.__proto__ = Buffer.prototype;
    return buf;
  }

  function fromObject(obj) {
    if (Buffer.isBuffer(obj)) {
      var len = checked(obj.length) | 0;
      var buf = createBuffer(len);

      if (buf.length === 0) {
        return buf;
      }

      obj.copy(buf, 0, 0, len);
      return buf;
    }

    if (obj.length !== undefined) {
      if (typeof obj.length !== 'number' || numberIsNaN(obj.length)) {
        return createBuffer(0);
      }

      return fromArrayLike(obj);
    }

    if (obj.type === 'Buffer' && Array.isArray(obj.data)) {
      return fromArrayLike(obj.data);
    }
  }

  function checked(length) {
    if (length >= K_MAX_LENGTH) {
      throw new RangeError('Attempt to allocate Buffer larger than maximum ' + 'size: 0x' + K_MAX_LENGTH.toString(16) + ' bytes');
    }

    return length | 0;
  }

  function SlowBuffer(length) {
    if (+length != length) {
      length = 0;
    }

    return Buffer.alloc(+length);
  }

  Buffer.isBuffer = function isBuffer(b) {
    return b != null && b._isBuffer === true && b !== Buffer.prototype;
  };

  Buffer.compare = function compare(a, b) {
    if (isInstance(a, Uint8Array)) a = Buffer.from(a, a.offset, a.byteLength);
    if (isInstance(b, Uint8Array)) b = Buffer.from(b, b.offset, b.byteLength);

    if (!Buffer.isBuffer(a) || !Buffer.isBuffer(b)) {
      throw new TypeError('The "buf1", "buf2" arguments must be one of type Buffer or Uint8Array');
    }

    if (a === b) return 0;
    var x = a.length;
    var y = b.length;

    for (var i = 0, len = Math.min(x, y); i < len; ++i) {
      if (a[i] !== b[i]) {
        x = a[i];
        y = b[i];
        break;
      }
    }

    if (x < y) return -1;
    if (y < x) return 1;
    return 0;
  };

  Buffer.isEncoding = function isEncoding(encoding) {
    switch (String(encoding).toLowerCase()) {
      case 'hex':
      case 'utf8':
      case 'utf-8':
      case 'ascii':
      case 'latin1':
      case 'binary':
      case 'base64':
      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return true;

      default:
        return false;
    }
  };

  Buffer.concat = function concat(list, length) {
    if (!Array.isArray(list)) {
      throw new TypeError('"list" argument must be an Array of Buffers');
    }

    if (list.length === 0) {
      return Buffer.alloc(0);
    }

    var i;

    if (length === undefined) {
      length = 0;

      for (i = 0; i < list.length; ++i) {
        length += list[i].length;
      }
    }

    var buffer = Buffer.allocUnsafe(length);
    var pos = 0;

    for (i = 0; i < list.length; ++i) {
      var buf = list[i];

      if (isInstance(buf, Uint8Array)) {
        buf = Buffer.from(buf);
      }

      if (!Buffer.isBuffer(buf)) {
        throw new TypeError('"list" argument must be an Array of Buffers');
      }

      buf.copy(buffer, pos);
      pos += buf.length;
    }

    return buffer;
  };

  function byteLength(string, encoding) {
    if (Buffer.isBuffer(string)) {
      return string.length;
    }

    if (ArrayBuffer.isView(string) || isInstance(string, ArrayBuffer)) {
      return string.byteLength;
    }

    if (typeof string !== 'string') {
      throw new TypeError('The "string" argument must be one of type string, Buffer, or ArrayBuffer. ' + 'Received type ' + typeof string);
    }

    var len = string.length;
    var mustMatch = arguments.length > 2 && arguments[2] === true;
    if (!mustMatch && len === 0) return 0;
    var loweredCase = false;

    for (;;) {
      switch (encoding) {
        case 'ascii':
        case 'latin1':
        case 'binary':
          return len;

        case 'utf8':
        case 'utf-8':
          return utf8ToBytes(string).length;

        case 'ucs2':
        case 'ucs-2':
        case 'utf16le':
        case 'utf-16le':
          return len * 2;

        case 'hex':
          return len >>> 1;

        case 'base64':
          return base64ToBytes(string).length;

        default:
          if (loweredCase) {
            return mustMatch ? -1 : utf8ToBytes(string).length;
          }

          encoding = ('' + encoding).toLowerCase();
          loweredCase = true;
      }
    }
  }

  Buffer.byteLength = byteLength;

  function slowToString(encoding, start, end) {
    var loweredCase = false;

    if (start === undefined || start < 0) {
      start = 0;
    }

    if (start > this.length) {
      return '';
    }

    if (end === undefined || end > this.length) {
      end = this.length;
    }

    if (end <= 0) {
      return '';
    }

    end >>>= 0;
    start >>>= 0;

    if (end <= start) {
      return '';
    }

    if (!encoding) encoding = 'utf8';

    while (true) {
      switch (encoding) {
        case 'hex':
          return hexSlice(this, start, end);

        case 'utf8':
        case 'utf-8':
          return utf8Slice(this, start, end);

        case 'ascii':
          return asciiSlice(this, start, end);

        case 'latin1':
        case 'binary':
          return latin1Slice(this, start, end);

        case 'base64':
          return base64Slice(this, start, end);

        case 'ucs2':
        case 'ucs-2':
        case 'utf16le':
        case 'utf-16le':
          return utf16leSlice(this, start, end);

        default:
          if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding);
          encoding = (encoding + '').toLowerCase();
          loweredCase = true;
      }
    }
  }

  Buffer.prototype._isBuffer = true;

  function swap(b, n, m) {
    var i = b[n];
    b[n] = b[m];
    b[m] = i;
  }

  Buffer.prototype.swap16 = function swap16() {
    var len = this.length;

    if (len % 2 !== 0) {
      throw new RangeError('Buffer size must be a multiple of 16-bits');
    }

    for (var i = 0; i < len; i += 2) {
      swap(this, i, i + 1);
    }

    return this;
  };

  Buffer.prototype.swap32 = function swap32() {
    var len = this.length;

    if (len % 4 !== 0) {
      throw new RangeError('Buffer size must be a multiple of 32-bits');
    }

    for (var i = 0; i < len; i += 4) {
      swap(this, i, i + 3);
      swap(this, i + 1, i + 2);
    }

    return this;
  };

  Buffer.prototype.swap64 = function swap64() {
    var len = this.length;

    if (len % 8 !== 0) {
      throw new RangeError('Buffer size must be a multiple of 64-bits');
    }

    for (var i = 0; i < len; i += 8) {
      swap(this, i, i + 7);
      swap(this, i + 1, i + 6);
      swap(this, i + 2, i + 5);
      swap(this, i + 3, i + 4);
    }

    return this;
  };

  Buffer.prototype.toString = function toString() {
    var length = this.length;
    if (length === 0) return '';
    if (arguments.length === 0) return utf8Slice(this, 0, length);
    return slowToString.apply(this, arguments);
  };

  Buffer.prototype.toLocaleString = Buffer.prototype.toString;

  Buffer.prototype.equals = function equals(b) {
    if (!Buffer.isBuffer(b)) throw new TypeError('Argument must be a Buffer');
    if (this === b) return true;
    return Buffer.compare(this, b) === 0;
  };

  Buffer.prototype.inspect = function inspect() {
    var str = '';
    var max = exports.INSPECT_MAX_BYTES;
    str = this.toString('hex', 0, max).replace(/(.{2})/g, '$1 ').trim();
    if (this.length > max) str += ' ... ';
    return '<Buffer ' + str + '>';
  };

  Buffer.prototype.compare = function compare(target, start, end, thisStart, thisEnd) {
    if (isInstance(target, Uint8Array)) {
      target = Buffer.from(target, target.offset, target.byteLength);
    }

    if (!Buffer.isBuffer(target)) {
      throw new TypeError('The "target" argument must be one of type Buffer or Uint8Array. ' + 'Received type ' + typeof target);
    }

    if (start === undefined) {
      start = 0;
    }

    if (end === undefined) {
      end = target ? target.length : 0;
    }

    if (thisStart === undefined) {
      thisStart = 0;
    }

    if (thisEnd === undefined) {
      thisEnd = this.length;
    }

    if (start < 0 || end > target.length || thisStart < 0 || thisEnd > this.length) {
      throw new RangeError('out of range index');
    }

    if (thisStart >= thisEnd && start >= end) {
      return 0;
    }

    if (thisStart >= thisEnd) {
      return -1;
    }

    if (start >= end) {
      return 1;
    }

    start >>>= 0;
    end >>>= 0;
    thisStart >>>= 0;
    thisEnd >>>= 0;
    if (this === target) return 0;
    var x = thisEnd - thisStart;
    var y = end - start;
    var len = Math.min(x, y);
    var thisCopy = this.slice(thisStart, thisEnd);
    var targetCopy = target.slice(start, end);

    for (var i = 0; i < len; ++i) {
      if (thisCopy[i] !== targetCopy[i]) {
        x = thisCopy[i];
        y = targetCopy[i];
        break;
      }
    }

    if (x < y) return -1;
    if (y < x) return 1;
    return 0;
  };

  function bidirectionalIndexOf(buffer, val, byteOffset, encoding, dir) {
    if (buffer.length === 0) return -1;

    if (typeof byteOffset === 'string') {
      encoding = byteOffset;
      byteOffset = 0;
    } else if (byteOffset > 0x7fffffff) {
      byteOffset = 0x7fffffff;
    } else if (byteOffset < -0x80000000) {
      byteOffset = -0x80000000;
    }

    byteOffset = +byteOffset;

    if (numberIsNaN(byteOffset)) {
      byteOffset = dir ? 0 : buffer.length - 1;
    }

    if (byteOffset < 0) byteOffset = buffer.length + byteOffset;

    if (byteOffset >= buffer.length) {
      if (dir) return -1;else byteOffset = buffer.length - 1;
    } else if (byteOffset < 0) {
      if (dir) byteOffset = 0;else return -1;
    }

    if (typeof val === 'string') {
      val = Buffer.from(val, encoding);
    }

    if (Buffer.isBuffer(val)) {
      if (val.length === 0) {
        return -1;
      }

      return arrayIndexOf(buffer, val, byteOffset, encoding, dir);
    } else if (typeof val === 'number') {
      val = val & 0xFF;

      if (typeof Uint8Array.prototype.indexOf === 'function') {
        if (dir) {
          return Uint8Array.prototype.indexOf.call(buffer, val, byteOffset);
        } else {
          return Uint8Array.prototype.lastIndexOf.call(buffer, val, byteOffset);
        }
      }

      return arrayIndexOf(buffer, [val], byteOffset, encoding, dir);
    }

    throw new TypeError('val must be string, number or Buffer');
  }

  function arrayIndexOf(arr, val, byteOffset, encoding, dir) {
    var indexSize = 1;
    var arrLength = arr.length;
    var valLength = val.length;

    if (encoding !== undefined) {
      encoding = String(encoding).toLowerCase();

      if (encoding === 'ucs2' || encoding === 'ucs-2' || encoding === 'utf16le' || encoding === 'utf-16le') {
        if (arr.length < 2 || val.length < 2) {
          return -1;
        }

        indexSize = 2;
        arrLength /= 2;
        valLength /= 2;
        byteOffset /= 2;
      }
    }

    function read(buf, i) {
      if (indexSize === 1) {
        return buf[i];
      } else {
        return buf.readUInt16BE(i * indexSize);
      }
    }

    var i;

    if (dir) {
      var foundIndex = -1;

      for (i = byteOffset; i < arrLength; i++) {
        if (read(arr, i) === read(val, foundIndex === -1 ? 0 : i - foundIndex)) {
          if (foundIndex === -1) foundIndex = i;
          if (i - foundIndex + 1 === valLength) return foundIndex * indexSize;
        } else {
          if (foundIndex !== -1) i -= i - foundIndex;
          foundIndex = -1;
        }
      }
    } else {
      if (byteOffset + valLength > arrLength) byteOffset = arrLength - valLength;

      for (i = byteOffset; i >= 0; i--) {
        var found = true;

        for (var j = 0; j < valLength; j++) {
          if (read(arr, i + j) !== read(val, j)) {
            found = false;
            break;
          }
        }

        if (found) return i;
      }
    }

    return -1;
  }

  Buffer.prototype.includes = function includes(val, byteOffset, encoding) {
    return this.indexOf(val, byteOffset, encoding) !== -1;
  };

  Buffer.prototype.indexOf = function indexOf(val, byteOffset, encoding) {
    return bidirectionalIndexOf(this, val, byteOffset, encoding, true);
  };

  Buffer.prototype.lastIndexOf = function lastIndexOf(val, byteOffset, encoding) {
    return bidirectionalIndexOf(this, val, byteOffset, encoding, false);
  };

  function hexWrite(buf, string, offset, length) {
    offset = Number(offset) || 0;
    var remaining = buf.length - offset;

    if (!length) {
      length = remaining;
    } else {
      length = Number(length);

      if (length > remaining) {
        length = remaining;
      }
    }

    var strLen = string.length;

    if (length > strLen / 2) {
      length = strLen / 2;
    }

    for (var i = 0; i < length; ++i) {
      var parsed = parseInt(string.substr(i * 2, 2), 16);
      if (numberIsNaN(parsed)) return i;
      buf[offset + i] = parsed;
    }

    return i;
  }

  function utf8Write(buf, string, offset, length) {
    return blitBuffer(utf8ToBytes(string, buf.length - offset), buf, offset, length);
  }

  function asciiWrite(buf, string, offset, length) {
    return blitBuffer(asciiToBytes(string), buf, offset, length);
  }

  function latin1Write(buf, string, offset, length) {
    return asciiWrite(buf, string, offset, length);
  }

  function base64Write(buf, string, offset, length) {
    return blitBuffer(base64ToBytes(string), buf, offset, length);
  }

  function ucs2Write(buf, string, offset, length) {
    return blitBuffer(utf16leToBytes(string, buf.length - offset), buf, offset, length);
  }

  Buffer.prototype.write = function write(string, offset, length, encoding) {
    if (offset === undefined) {
      encoding = 'utf8';
      length = this.length;
      offset = 0;
    } else if (length === undefined && typeof offset === 'string') {
      encoding = offset;
      length = this.length;
      offset = 0;
    } else if (isFinite(offset)) {
      offset = offset >>> 0;

      if (isFinite(length)) {
        length = length >>> 0;
        if (encoding === undefined) encoding = 'utf8';
      } else {
        encoding = length;
        length = undefined;
      }
    } else {
      throw new Error('Buffer.write(string, encoding, offset[, length]) is no longer supported');
    }

    var remaining = this.length - offset;
    if (length === undefined || length > remaining) length = remaining;

    if (string.length > 0 && (length < 0 || offset < 0) || offset > this.length) {
      throw new RangeError('Attempt to write outside buffer bounds');
    }

    if (!encoding) encoding = 'utf8';
    var loweredCase = false;

    for (;;) {
      switch (encoding) {
        case 'hex':
          return hexWrite(this, string, offset, length);

        case 'utf8':
        case 'utf-8':
          return utf8Write(this, string, offset, length);

        case 'ascii':
          return asciiWrite(this, string, offset, length);

        case 'latin1':
        case 'binary':
          return latin1Write(this, string, offset, length);

        case 'base64':
          return base64Write(this, string, offset, length);

        case 'ucs2':
        case 'ucs-2':
        case 'utf16le':
        case 'utf-16le':
          return ucs2Write(this, string, offset, length);

        default:
          if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding);
          encoding = ('' + encoding).toLowerCase();
          loweredCase = true;
      }
    }
  };

  Buffer.prototype.toJSON = function toJSON() {
    return {
      type: 'Buffer',
      data: Array.prototype.slice.call(this._arr || this, 0)
    };
  };

  function base64Slice(buf, start, end) {
    if (start === 0 && end === buf.length) {
      return base64.fromByteArray(buf);
    } else {
      return base64.fromByteArray(buf.slice(start, end));
    }
  }

  function utf8Slice(buf, start, end) {
    end = Math.min(buf.length, end);
    var res = [];
    var i = start;

    while (i < end) {
      var firstByte = buf[i];
      var codePoint = null;
      var bytesPerSequence = firstByte > 0xEF ? 4 : firstByte > 0xDF ? 3 : firstByte > 0xBF ? 2 : 1;

      if (i + bytesPerSequence <= end) {
        var secondByte, thirdByte, fourthByte, tempCodePoint;

        switch (bytesPerSequence) {
          case 1:
            if (firstByte < 0x80) {
              codePoint = firstByte;
            }

            break;

          case 2:
            secondByte = buf[i + 1];

            if ((secondByte & 0xC0) === 0x80) {
              tempCodePoint = (firstByte & 0x1F) << 0x6 | secondByte & 0x3F;

              if (tempCodePoint > 0x7F) {
                codePoint = tempCodePoint;
              }
            }

            break;

          case 3:
            secondByte = buf[i + 1];
            thirdByte = buf[i + 2];

            if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80) {
              tempCodePoint = (firstByte & 0xF) << 0xC | (secondByte & 0x3F) << 0x6 | thirdByte & 0x3F;

              if (tempCodePoint > 0x7FF && (tempCodePoint < 0xD800 || tempCodePoint > 0xDFFF)) {
                codePoint = tempCodePoint;
              }
            }

            break;

          case 4:
            secondByte = buf[i + 1];
            thirdByte = buf[i + 2];
            fourthByte = buf[i + 3];

            if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80 && (fourthByte & 0xC0) === 0x80) {
              tempCodePoint = (firstByte & 0xF) << 0x12 | (secondByte & 0x3F) << 0xC | (thirdByte & 0x3F) << 0x6 | fourthByte & 0x3F;

              if (tempCodePoint > 0xFFFF && tempCodePoint < 0x110000) {
                codePoint = tempCodePoint;
              }
            }

        }
      }

      if (codePoint === null) {
        codePoint = 0xFFFD;
        bytesPerSequence = 1;
      } else if (codePoint > 0xFFFF) {
        codePoint -= 0x10000;
        res.push(codePoint >>> 10 & 0x3FF | 0xD800);
        codePoint = 0xDC00 | codePoint & 0x3FF;
      }

      res.push(codePoint);
      i += bytesPerSequence;
    }

    return decodeCodePointsArray(res);
  }

  var MAX_ARGUMENTS_LENGTH = 0x1000;

  function decodeCodePointsArray(codePoints) {
    var len = codePoints.length;

    if (len <= MAX_ARGUMENTS_LENGTH) {
      return String.fromCharCode.apply(String, codePoints);
    }

    var res = '';
    var i = 0;

    while (i < len) {
      res += String.fromCharCode.apply(String, codePoints.slice(i, i += MAX_ARGUMENTS_LENGTH));
    }

    return res;
  }

  function asciiSlice(buf, start, end) {
    var ret = '';
    end = Math.min(buf.length, end);

    for (var i = start; i < end; ++i) {
      ret += String.fromCharCode(buf[i] & 0x7F);
    }

    return ret;
  }

  function latin1Slice(buf, start, end) {
    var ret = '';
    end = Math.min(buf.length, end);

    for (var i = start; i < end; ++i) {
      ret += String.fromCharCode(buf[i]);
    }

    return ret;
  }

  function hexSlice(buf, start, end) {
    var len = buf.length;
    if (!start || start < 0) start = 0;
    if (!end || end < 0 || end > len) end = len;
    var out = '';

    for (var i = start; i < end; ++i) {
      out += toHex(buf[i]);
    }

    return out;
  }

  function utf16leSlice(buf, start, end) {
    var bytes = buf.slice(start, end);
    var res = '';

    for (var i = 0; i < bytes.length; i += 2) {
      res += String.fromCharCode(bytes[i] + bytes[i + 1] * 256);
    }

    return res;
  }

  Buffer.prototype.slice = function slice(start, end) {
    var len = this.length;
    start = ~~start;
    end = end === undefined ? len : ~~end;

    if (start < 0) {
      start += len;
      if (start < 0) start = 0;
    } else if (start > len) {
      start = len;
    }

    if (end < 0) {
      end += len;
      if (end < 0) end = 0;
    } else if (end > len) {
      end = len;
    }

    if (end < start) end = start;
    var newBuf = this.subarray(start, end);
    newBuf.__proto__ = Buffer.prototype;
    return newBuf;
  };

  function checkOffset(offset, ext, length) {
    if (offset % 1 !== 0 || offset < 0) throw new RangeError('offset is not uint');
    if (offset + ext > length) throw new RangeError('Trying to access beyond buffer length');
  }

  Buffer.prototype.readUIntLE = function readUIntLE(offset, byteLength, noAssert) {
    offset = offset >>> 0;
    byteLength = byteLength >>> 0;
    if (!noAssert) checkOffset(offset, byteLength, this.length);
    var val = this[offset];
    var mul = 1;
    var i = 0;

    while (++i < byteLength && (mul *= 0x100)) {
      val += this[offset + i] * mul;
    }

    return val;
  };

  Buffer.prototype.readUIntBE = function readUIntBE(offset, byteLength, noAssert) {
    offset = offset >>> 0;
    byteLength = byteLength >>> 0;

    if (!noAssert) {
      checkOffset(offset, byteLength, this.length);
    }

    var val = this[offset + --byteLength];
    var mul = 1;

    while (byteLength > 0 && (mul *= 0x100)) {
      val += this[offset + --byteLength] * mul;
    }

    return val;
  };

  Buffer.prototype.readUInt8 = function readUInt8(offset, noAssert) {
    offset = offset >>> 0;
    if (!noAssert) checkOffset(offset, 1, this.length);
    return this[offset];
  };

  Buffer.prototype.readUInt16LE = function readUInt16LE(offset, noAssert) {
    offset = offset >>> 0;
    if (!noAssert) checkOffset(offset, 2, this.length);
    return this[offset] | this[offset + 1] << 8;
  };

  Buffer.prototype.readUInt16BE = function readUInt16BE(offset, noAssert) {
    offset = offset >>> 0;
    if (!noAssert) checkOffset(offset, 2, this.length);
    return this[offset] << 8 | this[offset + 1];
  };

  Buffer.prototype.readUInt32LE = function readUInt32LE(offset, noAssert) {
    offset = offset >>> 0;
    if (!noAssert) checkOffset(offset, 4, this.length);
    return (this[offset] | this[offset + 1] << 8 | this[offset + 2] << 16) + this[offset + 3] * 0x1000000;
  };

  Buffer.prototype.readUInt32BE = function readUInt32BE(offset, noAssert) {
    offset = offset >>> 0;
    if (!noAssert) checkOffset(offset, 4, this.length);
    return this[offset] * 0x1000000 + (this[offset + 1] << 16 | this[offset + 2] << 8 | this[offset + 3]);
  };

  Buffer.prototype.readIntLE = function readIntLE(offset, byteLength, noAssert) {
    offset = offset >>> 0;
    byteLength = byteLength >>> 0;
    if (!noAssert) checkOffset(offset, byteLength, this.length);
    var val = this[offset];
    var mul = 1;
    var i = 0;

    while (++i < byteLength && (mul *= 0x100)) {
      val += this[offset + i] * mul;
    }

    mul *= 0x80;
    if (val >= mul) val -= Math.pow(2, 8 * byteLength);
    return val;
  };

  Buffer.prototype.readIntBE = function readIntBE(offset, byteLength, noAssert) {
    offset = offset >>> 0;
    byteLength = byteLength >>> 0;
    if (!noAssert) checkOffset(offset, byteLength, this.length);
    var i = byteLength;
    var mul = 1;
    var val = this[offset + --i];

    while (i > 0 && (mul *= 0x100)) {
      val += this[offset + --i] * mul;
    }

    mul *= 0x80;
    if (val >= mul) val -= Math.pow(2, 8 * byteLength);
    return val;
  };

  Buffer.prototype.readInt8 = function readInt8(offset, noAssert) {
    offset = offset >>> 0;
    if (!noAssert) checkOffset(offset, 1, this.length);
    if (!(this[offset] & 0x80)) return this[offset];
    return (0xff - this[offset] + 1) * -1;
  };

  Buffer.prototype.readInt16LE = function readInt16LE(offset, noAssert) {
    offset = offset >>> 0;
    if (!noAssert) checkOffset(offset, 2, this.length);
    var val = this[offset] | this[offset + 1] << 8;
    return val & 0x8000 ? val | 0xFFFF0000 : val;
  };

  Buffer.prototype.readInt16BE = function readInt16BE(offset, noAssert) {
    offset = offset >>> 0;
    if (!noAssert) checkOffset(offset, 2, this.length);
    var val = this[offset + 1] | this[offset] << 8;
    return val & 0x8000 ? val | 0xFFFF0000 : val;
  };

  Buffer.prototype.readInt32LE = function readInt32LE(offset, noAssert) {
    offset = offset >>> 0;
    if (!noAssert) checkOffset(offset, 4, this.length);
    return this[offset] | this[offset + 1] << 8 | this[offset + 2] << 16 | this[offset + 3] << 24;
  };

  Buffer.prototype.readInt32BE = function readInt32BE(offset, noAssert) {
    offset = offset >>> 0;
    if (!noAssert) checkOffset(offset, 4, this.length);
    return this[offset] << 24 | this[offset + 1] << 16 | this[offset + 2] << 8 | this[offset + 3];
  };

  Buffer.prototype.readFloatLE = function readFloatLE(offset, noAssert) {
    offset = offset >>> 0;
    if (!noAssert) checkOffset(offset, 4, this.length);
    return ieee754.read(this, offset, true, 23, 4);
  };

  Buffer.prototype.readFloatBE = function readFloatBE(offset, noAssert) {
    offset = offset >>> 0;
    if (!noAssert) checkOffset(offset, 4, this.length);
    return ieee754.read(this, offset, false, 23, 4);
  };

  Buffer.prototype.readDoubleLE = function readDoubleLE(offset, noAssert) {
    offset = offset >>> 0;
    if (!noAssert) checkOffset(offset, 8, this.length);
    return ieee754.read(this, offset, true, 52, 8);
  };

  Buffer.prototype.readDoubleBE = function readDoubleBE(offset, noAssert) {
    offset = offset >>> 0;
    if (!noAssert) checkOffset(offset, 8, this.length);
    return ieee754.read(this, offset, false, 52, 8);
  };

  function checkInt(buf, value, offset, ext, max, min) {
    if (!Buffer.isBuffer(buf)) throw new TypeError('"buffer" argument must be a Buffer instance');
    if (value > max || value < min) throw new RangeError('"value" argument is out of bounds');
    if (offset + ext > buf.length) throw new RangeError('Index out of range');
  }

  Buffer.prototype.writeUIntLE = function writeUIntLE(value, offset, byteLength, noAssert) {
    value = +value;
    offset = offset >>> 0;
    byteLength = byteLength >>> 0;

    if (!noAssert) {
      var maxBytes = Math.pow(2, 8 * byteLength) - 1;
      checkInt(this, value, offset, byteLength, maxBytes, 0);
    }

    var mul = 1;
    var i = 0;
    this[offset] = value & 0xFF;

    while (++i < byteLength && (mul *= 0x100)) {
      this[offset + i] = value / mul & 0xFF;
    }

    return offset + byteLength;
  };

  Buffer.prototype.writeUIntBE = function writeUIntBE(value, offset, byteLength, noAssert) {
    value = +value;
    offset = offset >>> 0;
    byteLength = byteLength >>> 0;

    if (!noAssert) {
      var maxBytes = Math.pow(2, 8 * byteLength) - 1;
      checkInt(this, value, offset, byteLength, maxBytes, 0);
    }

    var i = byteLength - 1;
    var mul = 1;
    this[offset + i] = value & 0xFF;

    while (--i >= 0 && (mul *= 0x100)) {
      this[offset + i] = value / mul & 0xFF;
    }

    return offset + byteLength;
  };

  Buffer.prototype.writeUInt8 = function writeUInt8(value, offset, noAssert) {
    value = +value;
    offset = offset >>> 0;
    if (!noAssert) checkInt(this, value, offset, 1, 0xff, 0);
    this[offset] = value & 0xff;
    return offset + 1;
  };

  Buffer.prototype.writeUInt16LE = function writeUInt16LE(value, offset, noAssert) {
    value = +value;
    offset = offset >>> 0;
    if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0);
    this[offset] = value & 0xff;
    this[offset + 1] = value >>> 8;
    return offset + 2;
  };

  Buffer.prototype.writeUInt16BE = function writeUInt16BE(value, offset, noAssert) {
    value = +value;
    offset = offset >>> 0;
    if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0);
    this[offset] = value >>> 8;
    this[offset + 1] = value & 0xff;
    return offset + 2;
  };

  Buffer.prototype.writeUInt32LE = function writeUInt32LE(value, offset, noAssert) {
    value = +value;
    offset = offset >>> 0;
    if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0);
    this[offset + 3] = value >>> 24;
    this[offset + 2] = value >>> 16;
    this[offset + 1] = value >>> 8;
    this[offset] = value & 0xff;
    return offset + 4;
  };

  Buffer.prototype.writeUInt32BE = function writeUInt32BE(value, offset, noAssert) {
    value = +value;
    offset = offset >>> 0;
    if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0);
    this[offset] = value >>> 24;
    this[offset + 1] = value >>> 16;
    this[offset + 2] = value >>> 8;
    this[offset + 3] = value & 0xff;
    return offset + 4;
  };

  Buffer.prototype.writeIntLE = function writeIntLE(value, offset, byteLength, noAssert) {
    value = +value;
    offset = offset >>> 0;

    if (!noAssert) {
      var limit = Math.pow(2, 8 * byteLength - 1);
      checkInt(this, value, offset, byteLength, limit - 1, -limit);
    }

    var i = 0;
    var mul = 1;
    var sub = 0;
    this[offset] = value & 0xFF;

    while (++i < byteLength && (mul *= 0x100)) {
      if (value < 0 && sub === 0 && this[offset + i - 1] !== 0) {
        sub = 1;
      }

      this[offset + i] = (value / mul >> 0) - sub & 0xFF;
    }

    return offset + byteLength;
  };

  Buffer.prototype.writeIntBE = function writeIntBE(value, offset, byteLength, noAssert) {
    value = +value;
    offset = offset >>> 0;

    if (!noAssert) {
      var limit = Math.pow(2, 8 * byteLength - 1);
      checkInt(this, value, offset, byteLength, limit - 1, -limit);
    }

    var i = byteLength - 1;
    var mul = 1;
    var sub = 0;
    this[offset + i] = value & 0xFF;

    while (--i >= 0 && (mul *= 0x100)) {
      if (value < 0 && sub === 0 && this[offset + i + 1] !== 0) {
        sub = 1;
      }

      this[offset + i] = (value / mul >> 0) - sub & 0xFF;
    }

    return offset + byteLength;
  };

  Buffer.prototype.writeInt8 = function writeInt8(value, offset, noAssert) {
    value = +value;
    offset = offset >>> 0;
    if (!noAssert) checkInt(this, value, offset, 1, 0x7f, -0x80);
    if (value < 0) value = 0xff + value + 1;
    this[offset] = value & 0xff;
    return offset + 1;
  };

  Buffer.prototype.writeInt16LE = function writeInt16LE(value, offset, noAssert) {
    value = +value;
    offset = offset >>> 0;
    if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000);
    this[offset] = value & 0xff;
    this[offset + 1] = value >>> 8;
    return offset + 2;
  };

  Buffer.prototype.writeInt16BE = function writeInt16BE(value, offset, noAssert) {
    value = +value;
    offset = offset >>> 0;
    if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000);
    this[offset] = value >>> 8;
    this[offset + 1] = value & 0xff;
    return offset + 2;
  };

  Buffer.prototype.writeInt32LE = function writeInt32LE(value, offset, noAssert) {
    value = +value;
    offset = offset >>> 0;
    if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000);
    this[offset] = value & 0xff;
    this[offset + 1] = value >>> 8;
    this[offset + 2] = value >>> 16;
    this[offset + 3] = value >>> 24;
    return offset + 4;
  };

  Buffer.prototype.writeInt32BE = function writeInt32BE(value, offset, noAssert) {
    value = +value;
    offset = offset >>> 0;
    if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000);
    if (value < 0) value = 0xffffffff + value + 1;
    this[offset] = value >>> 24;
    this[offset + 1] = value >>> 16;
    this[offset + 2] = value >>> 8;
    this[offset + 3] = value & 0xff;
    return offset + 4;
  };

  function checkIEEE754(buf, value, offset, ext, max, min) {
    if (offset + ext > buf.length) throw new RangeError('Index out of range');
    if (offset < 0) throw new RangeError('Index out of range');
  }

  function writeFloat(buf, value, offset, littleEndian, noAssert) {
    value = +value;
    offset = offset >>> 0;

    if (!noAssert) {
      checkIEEE754(buf, value, offset, 4, 3.4028234663852886e+38, -3.4028234663852886e+38);
    }

    ieee754.write(buf, value, offset, littleEndian, 23, 4);
    return offset + 4;
  }

  Buffer.prototype.writeFloatLE = function writeFloatLE(value, offset, noAssert) {
    return writeFloat(this, value, offset, true, noAssert);
  };

  Buffer.prototype.writeFloatBE = function writeFloatBE(value, offset, noAssert) {
    return writeFloat(this, value, offset, false, noAssert);
  };

  function writeDouble(buf, value, offset, littleEndian, noAssert) {
    value = +value;
    offset = offset >>> 0;

    if (!noAssert) {
      checkIEEE754(buf, value, offset, 8, 1.7976931348623157E+308, -1.7976931348623157E+308);
    }

    ieee754.write(buf, value, offset, littleEndian, 52, 8);
    return offset + 8;
  }

  Buffer.prototype.writeDoubleLE = function writeDoubleLE(value, offset, noAssert) {
    return writeDouble(this, value, offset, true, noAssert);
  };

  Buffer.prototype.writeDoubleBE = function writeDoubleBE(value, offset, noAssert) {
    return writeDouble(this, value, offset, false, noAssert);
  };

  Buffer.prototype.copy = function copy(target, targetStart, start, end) {
    if (!Buffer.isBuffer(target)) throw new TypeError('argument should be a Buffer');
    if (!start) start = 0;
    if (!end && end !== 0) end = this.length;
    if (targetStart >= target.length) targetStart = target.length;
    if (!targetStart) targetStart = 0;
    if (end > 0 && end < start) end = start;
    if (end === start) return 0;
    if (target.length === 0 || this.length === 0) return 0;

    if (targetStart < 0) {
      throw new RangeError('targetStart out of bounds');
    }

    if (start < 0 || start >= this.length) throw new RangeError('Index out of range');
    if (end < 0) throw new RangeError('sourceEnd out of bounds');
    if (end > this.length) end = this.length;

    if (target.length - targetStart < end - start) {
      end = target.length - targetStart + start;
    }

    var len = end - start;

    if (this === target && typeof Uint8Array.prototype.copyWithin === 'function') {
      this.copyWithin(targetStart, start, end);
    } else if (this === target && start < targetStart && targetStart < end) {
      for (var i = len - 1; i >= 0; --i) {
        target[i + targetStart] = this[i + start];
      }
    } else {
      Uint8Array.prototype.set.call(target, this.subarray(start, end), targetStart);
    }

    return len;
  };

  Buffer.prototype.fill = function fill(val, start, end, encoding) {
    if (typeof val === 'string') {
      if (typeof start === 'string') {
        encoding = start;
        start = 0;
        end = this.length;
      } else if (typeof end === 'string') {
        encoding = end;
        end = this.length;
      }

      if (encoding !== undefined && typeof encoding !== 'string') {
        throw new TypeError('encoding must be a string');
      }

      if (typeof encoding === 'string' && !Buffer.isEncoding(encoding)) {
        throw new TypeError('Unknown encoding: ' + encoding);
      }

      if (val.length === 1) {
        var code = val.charCodeAt(0);

        if (encoding === 'utf8' && code < 128 || encoding === 'latin1') {
          val = code;
        }
      }
    } else if (typeof val === 'number') {
      val = val & 255;
    }

    if (start < 0 || this.length < start || this.length < end) {
      throw new RangeError('Out of range index');
    }

    if (end <= start) {
      return this;
    }

    start = start >>> 0;
    end = end === undefined ? this.length : end >>> 0;
    if (!val) val = 0;
    var i;

    if (typeof val === 'number') {
      for (i = start; i < end; ++i) {
        this[i] = val;
      }
    } else {
      var bytes = Buffer.isBuffer(val) ? val : Buffer.from(val, encoding);
      var len = bytes.length;

      if (len === 0) {
        throw new TypeError('The value "' + val + '" is invalid for argument "value"');
      }

      for (i = 0; i < end - start; ++i) {
        this[i + start] = bytes[i % len];
      }
    }

    return this;
  };

  var INVALID_BASE64_RE = /[^+/0-9A-Za-z-_]/g;

  function base64clean(str) {
    str = str.split('=')[0];
    str = str.trim().replace(INVALID_BASE64_RE, '');
    if (str.length < 2) return '';

    while (str.length % 4 !== 0) {
      str = str + '=';
    }

    return str;
  }

  function toHex(n) {
    if (n < 16) return '0' + n.toString(16);
    return n.toString(16);
  }

  function utf8ToBytes(string, units) {
    units = units || Infinity;
    var codePoint;
    var length = string.length;
    var leadSurrogate = null;
    var bytes = [];

    for (var i = 0; i < length; ++i) {
      codePoint = string.charCodeAt(i);

      if (codePoint > 0xD7FF && codePoint < 0xE000) {
        if (!leadSurrogate) {
          if (codePoint > 0xDBFF) {
            if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD);
            continue;
          } else if (i + 1 === length) {
            if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD);
            continue;
          }

          leadSurrogate = codePoint;
          continue;
        }

        if (codePoint < 0xDC00) {
          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD);
          leadSurrogate = codePoint;
          continue;
        }

        codePoint = (leadSurrogate - 0xD800 << 10 | codePoint - 0xDC00) + 0x10000;
      } else if (leadSurrogate) {
        if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD);
      }

      leadSurrogate = null;

      if (codePoint < 0x80) {
        if ((units -= 1) < 0) break;
        bytes.push(codePoint);
      } else if (codePoint < 0x800) {
        if ((units -= 2) < 0) break;
        bytes.push(codePoint >> 0x6 | 0xC0, codePoint & 0x3F | 0x80);
      } else if (codePoint < 0x10000) {
        if ((units -= 3) < 0) break;
        bytes.push(codePoint >> 0xC | 0xE0, codePoint >> 0x6 & 0x3F | 0x80, codePoint & 0x3F | 0x80);
      } else if (codePoint < 0x110000) {
        if ((units -= 4) < 0) break;
        bytes.push(codePoint >> 0x12 | 0xF0, codePoint >> 0xC & 0x3F | 0x80, codePoint >> 0x6 & 0x3F | 0x80, codePoint & 0x3F | 0x80);
      } else {
        throw new Error('Invalid code point');
      }
    }

    return bytes;
  }

  function asciiToBytes(str) {
    var byteArray = [];

    for (var i = 0; i < str.length; ++i) {
      byteArray.push(str.charCodeAt(i) & 0xFF);
    }

    return byteArray;
  }

  function utf16leToBytes(str, units) {
    var c, hi, lo;
    var byteArray = [];

    for (var i = 0; i < str.length; ++i) {
      if ((units -= 2) < 0) break;
      c = str.charCodeAt(i);
      hi = c >> 8;
      lo = c % 256;
      byteArray.push(lo);
      byteArray.push(hi);
    }

    return byteArray;
  }

  function base64ToBytes(str) {
    return base64.toByteArray(base64clean(str));
  }

  function blitBuffer(src, dst, offset, length) {
    for (var i = 0; i < length; ++i) {
      if (i + offset >= dst.length || i >= src.length) break;
      dst[i + offset] = src[i];
    }

    return i;
  }

  function isInstance(obj, type) {
    return obj instanceof type || obj != null && obj.constructor != null && obj.constructor.name != null && obj.constructor.name === type.name;
  }

  function numberIsNaN(obj) {
    return obj !== obj;
  }
},21,[22,23],"node_modules/buffer/index.js");
__d(function (global, _$$_REQUIRE, _$$_IMPORT_DEFAULT, _$$_IMPORT_ALL, module, exports, _dependencyMap) {
  'use strict';

  exports.byteLength = byteLength;
  exports.toByteArray = toByteArray;
  exports.fromByteArray = fromByteArray;
  var lookup = [];
  var revLookup = [];
  var Arr = typeof Uint8Array !== 'undefined' ? Uint8Array : Array;
  var code = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

  for (var i = 0, len = code.length; i < len; ++i) {
    lookup[i] = code[i];
    revLookup[code.charCodeAt(i)] = i;
  }

  revLookup['-'.charCodeAt(0)] = 62;
  revLookup['_'.charCodeAt(0)] = 63;

  function getLens(b64) {
    var len = b64.length;

    if (len % 4 > 0) {
      throw new Error('Invalid string. Length must be a multiple of 4');
    }

    var validLen = b64.indexOf('=');
    if (validLen === -1) validLen = len;
    var placeHoldersLen = validLen === len ? 0 : 4 - validLen % 4;
    return [validLen, placeHoldersLen];
  }

  function byteLength(b64) {
    var lens = getLens(b64);
    var validLen = lens[0];
    var placeHoldersLen = lens[1];
    return (validLen + placeHoldersLen) * 3 / 4 - placeHoldersLen;
  }

  function _byteLength(b64, validLen, placeHoldersLen) {
    return (validLen + placeHoldersLen) * 3 / 4 - placeHoldersLen;
  }

  function toByteArray(b64) {
    var tmp;
    var lens = getLens(b64);
    var validLen = lens[0];
    var placeHoldersLen = lens[1];
    var arr = new Arr(_byteLength(b64, validLen, placeHoldersLen));
    var curByte = 0;
    var len = placeHoldersLen > 0 ? validLen - 4 : validLen;

    for (var i = 0; i < len; i += 4) {
      tmp = revLookup[b64.charCodeAt(i)] << 18 | revLookup[b64.charCodeAt(i + 1)] << 12 | revLookup[b64.charCodeAt(i + 2)] << 6 | revLookup[b64.charCodeAt(i + 3)];
      arr[curByte++] = tmp >> 16 & 0xFF;
      arr[curByte++] = tmp >> 8 & 0xFF;
      arr[curByte++] = tmp & 0xFF;
    }

    if (placeHoldersLen === 2) {
      tmp = revLookup[b64.charCodeAt(i)] << 2 | revLookup[b64.charCodeAt(i + 1)] >> 4;
      arr[curByte++] = tmp & 0xFF;
    }

    if (placeHoldersLen === 1) {
      tmp = revLookup[b64.charCodeAt(i)] << 10 | revLookup[b64.charCodeAt(i + 1)] << 4 | revLookup[b64.charCodeAt(i + 2)] >> 2;
      arr[curByte++] = tmp >> 8 & 0xFF;
      arr[curByte++] = tmp & 0xFF;
    }

    return arr;
  }

  function tripletToBase64(num) {
    return lookup[num >> 18 & 0x3F] + lookup[num >> 12 & 0x3F] + lookup[num >> 6 & 0x3F] + lookup[num & 0x3F];
  }

  function encodeChunk(uint8, start, end) {
    var tmp;
    var output = [];

    for (var i = start; i < end; i += 3) {
      tmp = (uint8[i] << 16 & 0xFF0000) + (uint8[i + 1] << 8 & 0xFF00) + (uint8[i + 2] & 0xFF);
      output.push(tripletToBase64(tmp));
    }

    return output.join('');
  }

  function fromByteArray(uint8) {
    var tmp;
    var len = uint8.length;
    var extraBytes = len % 3;
    var parts = [];
    var maxChunkLength = 16383;

    for (var i = 0, len2 = len - extraBytes; i < len2; i += maxChunkLength) {
      parts.push(encodeChunk(uint8, i, i + maxChunkLength > len2 ? len2 : i + maxChunkLength));
    }

    if (extraBytes === 1) {
      tmp = uint8[len - 1];
      parts.push(lookup[tmp >> 2] + lookup[tmp << 4 & 0x3F] + '==');
    } else if (extraBytes === 2) {
      tmp = (uint8[len - 2] << 8) + uint8[len - 1];
      parts.push(lookup[tmp >> 10] + lookup[tmp >> 4 & 0x3F] + lookup[tmp << 2 & 0x3F] + '=');
    }

    return parts.join('');
  }
},22,[],"node_modules/base64-js/index.js");
__d(function (global, _$$_REQUIRE, _$$_IMPORT_DEFAULT, _$$_IMPORT_ALL, module, exports, _dependencyMap) {
  "use strict";

  exports.read = function (buffer, offset, isLE, mLen, nBytes) {
    var e, m;
    var eLen = nBytes * 8 - mLen - 1;
    var eMax = (1 << eLen) - 1;
    var eBias = eMax >> 1;
    var nBits = -7;
    var i = isLE ? nBytes - 1 : 0;
    var d = isLE ? -1 : 1;
    var s = buffer[offset + i];
    i += d;
    e = s & (1 << -nBits) - 1;
    s >>= -nBits;
    nBits += eLen;

    for (; nBits > 0; e = e * 256 + buffer[offset + i], i += d, nBits -= 8) {}

    m = e & (1 << -nBits) - 1;
    e >>= -nBits;
    nBits += mLen;

    for (; nBits > 0; m = m * 256 + buffer[offset + i], i += d, nBits -= 8) {}

    if (e === 0) {
      e = 1 - eBias;
    } else if (e === eMax) {
      return m ? NaN : (s ? -1 : 1) * Infinity;
    } else {
      m = m + Math.pow(2, mLen);
      e = e - eBias;
    }

    return (s ? -1 : 1) * m * Math.pow(2, e - mLen);
  };

  exports.write = function (buffer, value, offset, isLE, mLen, nBytes) {
    var e, m, c;
    var eLen = nBytes * 8 - mLen - 1;
    var eMax = (1 << eLen) - 1;
    var eBias = eMax >> 1;
    var rt = mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0;
    var i = isLE ? 0 : nBytes - 1;
    var d = isLE ? 1 : -1;
    var s = value < 0 || value === 0 && 1 / value < 0 ? 1 : 0;
    value = Math.abs(value);

    if (isNaN(value) || value === Infinity) {
      m = isNaN(value) ? 1 : 0;
      e = eMax;
    } else {
      e = Math.floor(Math.log(value) / Math.LN2);

      if (value * (c = Math.pow(2, -e)) < 1) {
        e--;
        c *= 2;
      }

      if (e + eBias >= 1) {
        value += rt / c;
      } else {
        value += rt * Math.pow(2, 1 - eBias);
      }

      if (value * c >= 2) {
        e++;
        c /= 2;
      }

      if (e + eBias >= eMax) {
        m = 0;
        e = eMax;
      } else if (e + eBias >= 1) {
        m = (value * c - 1) * Math.pow(2, mLen);
        e = e + eBias;
      } else {
        m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen);
        e = 0;
      }
    }

    for (; mLen >= 8; buffer[offset + i] = m & 0xff, i += d, m /= 256, mLen -= 8) {}

    e = e << mLen | m;
    eLen += mLen;

    for (; eLen > 0; buffer[offset + i] = e & 0xff, i += d, e /= 256, eLen -= 8) {}

    buffer[offset + i - d] |= s * 128;
  };
},23,[],"node_modules/ieee754/index.js");
__d(function (global, _$$_REQUIRE, _$$_IMPORT_DEFAULT, _$$_IMPORT_ALL, module, exports, _dependencyMap) {
  "use strict";

  var isArray = _$$_REQUIRE(_dependencyMap[0], "./array-helper").isArray;

  module.exports = {
    copyOptions: function (options) {
      var key,
          copy = {};

      for (key in options) {
        if (options.hasOwnProperty(key)) {
          copy[key] = options[key];
        }
      }

      return copy;
    },
    ensureFlagExists: function (item, options) {
      if (!(item in options) || typeof options[item] !== 'boolean') {
        options[item] = false;
      }
    },
    ensureSpacesExists: function (options) {
      if (!('spaces' in options) || typeof options.spaces !== 'number' && typeof options.spaces !== 'string') {
        options.spaces = 0;
      }
    },
    ensureAlwaysArrayExists: function (options) {
      if (!('alwaysArray' in options) || typeof options.alwaysArray !== 'boolean' && !isArray(options.alwaysArray)) {
        options.alwaysArray = false;
      }
    },
    ensureKeyExists: function (key, options) {
      if (!(key + 'Key' in options) || typeof options[key + 'Key'] !== 'string') {
        options[key + 'Key'] = options.compact ? '_' + key : key;
      }
    },
    checkFnExists: function (key, options) {
      return key + 'Fn' in options;
    }
  };
},24,[25],"node_modules/xml-js/lib/options-helper.js");
__d(function (global, _$$_REQUIRE, _$$_IMPORT_DEFAULT, _$$_IMPORT_ALL, module, exports, _dependencyMap) {
  "use strict";

  module.exports = {
    isArray: function (value) {
      if (Array.isArray) {
        return Array.isArray(value);
      }

      return Object.prototype.toString.call(value) === '[object Array]';
    }
  };
},25,[],"node_modules/xml-js/lib/array-helper.js");
__d(function (global, _$$_REQUIRE, _$$_IMPORT_DEFAULT, _$$_IMPORT_ALL, module, exports, _dependencyMap) {
  "use strict";

  var helper = _$$_REQUIRE(_dependencyMap[0], "./options-helper");

  var xml2js = _$$_REQUIRE(_dependencyMap[1], "./xml2js");

  function validateOptions(userOptions) {
    var options = helper.copyOptions(userOptions);
    helper.ensureSpacesExists(options);
    return options;
  }

  module.exports = function (xml, userOptions) {
    var options, js, json, parentKey;
    options = validateOptions(userOptions);
    js = xml2js(xml, options);
    parentKey = 'compact' in options && options.compact ? '_parent' : 'parent';

    if ('addParent' in options && options.addParent) {
      json = JSON.stringify(js, function (k, v) {
        return k === parentKey ? '_' : v;
      }, options.spaces);
    } else {
      json = JSON.stringify(js, null, options.spaces);
    }

    return json.replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029');
  };
},26,[24,15],"node_modules/xml-js/lib/xml2json.js");
__d(function (global, _$$_REQUIRE, _$$_IMPORT_DEFAULT, _$$_IMPORT_ALL, module, exports, _dependencyMap) {
  "use strict";

  var helper = _$$_REQUIRE(_dependencyMap[0], "./options-helper");

  var isArray = _$$_REQUIRE(_dependencyMap[1], "./array-helper").isArray;

  var currentElement, currentElementName;

  function validateOptions(userOptions) {
    var options = helper.copyOptions(userOptions);
    helper.ensureFlagExists('ignoreDeclaration', options);
    helper.ensureFlagExists('ignoreInstruction', options);
    helper.ensureFlagExists('ignoreAttributes', options);
    helper.ensureFlagExists('ignoreText', options);
    helper.ensureFlagExists('ignoreComment', options);
    helper.ensureFlagExists('ignoreCdata', options);
    helper.ensureFlagExists('ignoreDoctype', options);
    helper.ensureFlagExists('compact', options);
    helper.ensureFlagExists('indentText', options);
    helper.ensureFlagExists('indentCdata', options);
    helper.ensureFlagExists('indentAttributes', options);
    helper.ensureFlagExists('indentInstruction', options);
    helper.ensureFlagExists('fullTagEmptyElement', options);
    helper.ensureFlagExists('noQuotesForNativeAttributes', options);
    helper.ensureSpacesExists(options);

    if (typeof options.spaces === 'number') {
      options.spaces = Array(options.spaces + 1).join(' ');
    }

    helper.ensureKeyExists('declaration', options);
    helper.ensureKeyExists('instruction', options);
    helper.ensureKeyExists('attributes', options);
    helper.ensureKeyExists('text', options);
    helper.ensureKeyExists('comment', options);
    helper.ensureKeyExists('cdata', options);
    helper.ensureKeyExists('doctype', options);
    helper.ensureKeyExists('type', options);
    helper.ensureKeyExists('name', options);
    helper.ensureKeyExists('elements', options);
    helper.checkFnExists('doctype', options);
    helper.checkFnExists('instruction', options);
    helper.checkFnExists('cdata', options);
    helper.checkFnExists('comment', options);
    helper.checkFnExists('text', options);
    helper.checkFnExists('instructionName', options);
    helper.checkFnExists('elementName', options);
    helper.checkFnExists('attributeName', options);
    helper.checkFnExists('attributeValue', options);
    helper.checkFnExists('attributes', options);
    helper.checkFnExists('fullTagEmptyElement', options);
    return options;
  }

  function writeIndentation(options, depth, firstLine) {
    return (!firstLine && options.spaces ? '\n' : '') + Array(depth + 1).join(options.spaces);
  }

  function writeAttributes(attributes, options, depth) {
    if (options.ignoreAttributes) {
      return '';
    }

    if ('attributesFn' in options) {
      attributes = options.attributesFn(attributes, currentElementName, currentElement);
    }

    var key,
        attr,
        attrName,
        quote,
        result = [];

    for (key in attributes) {
      if (attributes.hasOwnProperty(key) && attributes[key] !== null && attributes[key] !== undefined) {
        quote = options.noQuotesForNativeAttributes && typeof attributes[key] !== 'string' ? '' : '"';
        attr = '' + attributes[key];
        attr = attr.replace(/"/g, '&quot;');
        attrName = 'attributeNameFn' in options ? options.attributeNameFn(key, attr, currentElementName, currentElement) : key;
        result.push(options.spaces && options.indentAttributes ? writeIndentation(options, depth + 1, false) : ' ');
        result.push(attrName + '=' + quote + ('attributeValueFn' in options ? options.attributeValueFn(attr, key, currentElementName, currentElement) : attr) + quote);
      }
    }

    if (attributes && Object.keys(attributes).length && options.spaces && options.indentAttributes) {
      result.push(writeIndentation(options, depth, false));
    }

    return result.join('');
  }

  function writeDeclaration(declaration, options, depth) {
    currentElement = declaration;
    currentElementName = 'xml';
    return options.ignoreDeclaration ? '' : '<?' + 'xml' + writeAttributes(declaration[options.attributesKey], options, depth) + '?>';
  }

  function writeInstruction(instruction, options, depth) {
    if (options.ignoreInstruction) {
      return '';
    }

    var key;

    for (key in instruction) {
      if (instruction.hasOwnProperty(key)) {
        break;
      }
    }

    var instructionName = 'instructionNameFn' in options ? options.instructionNameFn(key, instruction[key], currentElementName, currentElement) : key;

    if (typeof instruction[key] === 'object') {
      currentElement = instruction;
      currentElementName = instructionName;
      return '<?' + instructionName + writeAttributes(instruction[key][options.attributesKey], options, depth) + '?>';
    } else {
      var instructionValue = instruction[key] ? instruction[key] : '';
      if ('instructionFn' in options) instructionValue = options.instructionFn(instructionValue, key, currentElementName, currentElement);
      return '<?' + instructionName + (instructionValue ? ' ' + instructionValue : '') + '?>';
    }
  }

  function writeComment(comment, options) {
    return options.ignoreComment ? '' : '<!--' + ('commentFn' in options ? options.commentFn(comment, currentElementName, currentElement) : comment) + '-->';
  }

  function writeCdata(cdata, options) {
    return options.ignoreCdata ? '' : '<![CDATA[' + ('cdataFn' in options ? options.cdataFn(cdata, currentElementName, currentElement) : cdata) + ']]>';
  }

  function writeDoctype(doctype, options) {
    return options.ignoreDoctype ? '' : '<!DOCTYPE ' + ('doctypeFn' in options ? options.doctypeFn(doctype, currentElementName, currentElement) : doctype) + '>';
  }

  function writeText(text, options) {
    if (options.ignoreText) return '';
    text = '' + text;
    text = text.replace(/&amp;/g, '&');
    text = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    return 'textFn' in options ? options.textFn(text, currentElementName, currentElement) : text;
  }

  function hasContent(element, options) {
    var i;

    if (element.elements && element.elements.length) {
      for (i = 0; i < element.elements.length; ++i) {
        switch (element.elements[i][options.typeKey]) {
          case 'text':
            if (options.indentText) {
              return true;
            }

            break;

          case 'cdata':
            if (options.indentCdata) {
              return true;
            }

            break;

          case 'instruction':
            if (options.indentInstruction) {
              return true;
            }

            break;

          case 'doctype':
          case 'comment':
          case 'element':
            return true;

          default:
            return true;
        }
      }
    }

    return false;
  }

  function writeElement(element, options, depth) {
    currentElement = element;
    currentElementName = element.name;
    var xml = [],
        elementName = 'elementNameFn' in options ? options.elementNameFn(element.name, element) : element.name;
    xml.push('<' + elementName);

    if (element[options.attributesKey]) {
      xml.push(writeAttributes(element[options.attributesKey], options, depth));
    }

    var withClosingTag = element[options.elementsKey] && element[options.elementsKey].length || element[options.attributesKey] && element[options.attributesKey]['xml:space'] === 'preserve';

    if (!withClosingTag) {
      if ('fullTagEmptyElementFn' in options) {
        withClosingTag = options.fullTagEmptyElementFn(element.name, element);
      } else {
        withClosingTag = options.fullTagEmptyElement;
      }
    }

    if (withClosingTag) {
      xml.push('>');

      if (element[options.elementsKey] && element[options.elementsKey].length) {
        xml.push(writeElements(element[options.elementsKey], options, depth + 1));
        currentElement = element;
        currentElementName = element.name;
      }

      xml.push(options.spaces && hasContent(element, options) ? '\n' + Array(depth + 1).join(options.spaces) : '');
      xml.push('</' + elementName + '>');
    } else {
      xml.push('/>');
    }

    return xml.join('');
  }

  function writeElements(elements, options, depth, firstLine) {
    return elements.reduce(function (xml, element) {
      var indent = writeIndentation(options, depth, firstLine && !xml);

      switch (element.type) {
        case 'element':
          return xml + indent + writeElement(element, options, depth);

        case 'comment':
          return xml + indent + writeComment(element[options.commentKey], options);

        case 'doctype':
          return xml + indent + writeDoctype(element[options.doctypeKey], options);

        case 'cdata':
          return xml + (options.indentCdata ? indent : '') + writeCdata(element[options.cdataKey], options);

        case 'text':
          return xml + (options.indentText ? indent : '') + writeText(element[options.textKey], options);

        case 'instruction':
          var instruction = {};
          instruction[element[options.nameKey]] = element[options.attributesKey] ? element : element[options.instructionKey];
          return xml + (options.indentInstruction ? indent : '') + writeInstruction(instruction, options, depth);
      }
    }, '');
  }

  function hasContentCompact(element, options, anyContent) {
    var key;

    for (key in element) {
      if (element.hasOwnProperty(key)) {
        switch (key) {
          case options.parentKey:
          case options.attributesKey:
            break;

          case options.textKey:
            if (options.indentText || anyContent) {
              return true;
            }

            break;

          case options.cdataKey:
            if (options.indentCdata || anyContent) {
              return true;
            }

            break;

          case options.instructionKey:
            if (options.indentInstruction || anyContent) {
              return true;
            }

            break;

          case options.doctypeKey:
          case options.commentKey:
            return true;

          default:
            return true;
        }
      }
    }

    return false;
  }

  function writeElementCompact(element, name, options, depth, indent) {
    currentElement = element;
    currentElementName = name;
    var elementName = 'elementNameFn' in options ? options.elementNameFn(name, element) : name;

    if (typeof element === 'undefined' || element === null) {
      return 'fullTagEmptyElementFn' in options && options.fullTagEmptyElementFn(name, element) || options.fullTagEmptyElement ? '<' + elementName + '></' + elementName + '>' : '<' + elementName + '/>';
    }

    var xml = [];

    if (name) {
      xml.push('<' + elementName);

      if (typeof element !== 'object') {
        xml.push('>' + writeText(element, options) + '</' + elementName + '>');
        return xml.join('');
      }

      if (element[options.attributesKey]) {
        xml.push(writeAttributes(element[options.attributesKey], options, depth));
      }

      var withClosingTag = hasContentCompact(element, options, true) || element[options.attributesKey] && element[options.attributesKey]['xml:space'] === 'preserve';

      if (!withClosingTag) {
        if ('fullTagEmptyElementFn' in options) {
          withClosingTag = options.fullTagEmptyElementFn(name, element);
        } else {
          withClosingTag = options.fullTagEmptyElement;
        }
      }

      if (withClosingTag) {
        xml.push('>');
      } else {
        xml.push('/>');
        return xml.join('');
      }
    }

    xml.push(writeElementsCompact(element, options, depth + 1, false));
    currentElement = element;
    currentElementName = name;

    if (name) {
      xml.push((indent ? writeIndentation(options, depth, false) : '') + '</' + elementName + '>');
    }

    return xml.join('');
  }

  function writeElementsCompact(element, options, depth, firstLine) {
    var i,
        key,
        nodes,
        xml = [];

    for (key in element) {
      if (element.hasOwnProperty(key)) {
        nodes = isArray(element[key]) ? element[key] : [element[key]];

        for (i = 0; i < nodes.length; ++i) {
          switch (key) {
            case options.declarationKey:
              xml.push(writeDeclaration(nodes[i], options, depth));
              break;

            case options.instructionKey:
              xml.push((options.indentInstruction ? writeIndentation(options, depth, firstLine) : '') + writeInstruction(nodes[i], options, depth));
              break;

            case options.attributesKey:
            case options.parentKey:
              break;

            case options.textKey:
              xml.push((options.indentText ? writeIndentation(options, depth, firstLine) : '') + writeText(nodes[i], options));
              break;

            case options.cdataKey:
              xml.push((options.indentCdata ? writeIndentation(options, depth, firstLine) : '') + writeCdata(nodes[i], options));
              break;

            case options.doctypeKey:
              xml.push(writeIndentation(options, depth, firstLine) + writeDoctype(nodes[i], options));
              break;

            case options.commentKey:
              xml.push(writeIndentation(options, depth, firstLine) + writeComment(nodes[i], options));
              break;

            default:
              xml.push(writeIndentation(options, depth, firstLine) + writeElementCompact(nodes[i], key, options, depth, hasContentCompact(nodes[i], options)));
          }

          firstLine = firstLine && !xml.length;
        }
      }
    }

    return xml.join('');
  }

  module.exports = function (js, options) {
    options = validateOptions(options);
    var xml = [];
    currentElement = js;
    currentElementName = '_root_';

    if (options.compact) {
      xml.push(writeElementsCompact(js, options, 0, true));
    } else {
      if (js[options.declarationKey]) {
        xml.push(writeDeclaration(js[options.declarationKey], options, 0));
      }

      if (js[options.elementsKey] && js[options.elementsKey].length) {
        xml.push(writeElements(js[options.elementsKey], options, 0, !xml.length));
      }
    }

    return xml.join('');
  };
},27,[24,25],"node_modules/xml-js/lib/js2xml.js");
__d(function (global, _$$_REQUIRE, _$$_IMPORT_DEFAULT, _$$_IMPORT_ALL, module, exports, _dependencyMap) {
  "use strict";

  var js2xml = _$$_REQUIRE(_dependencyMap[0], "./js2xml.js");

  module.exports = function (json, options) {
    if (json instanceof Buffer) {
      json = json.toString();
    }

    var js = null;

    if (typeof json === 'string') {
      try {
        js = JSON.parse(json);
      } catch (e) {
        throw new Error('The JSON structure is invalid');
      }
    } else {
      js = json;
    }

    return js2xml(js, options);
  };
},28,[27],"node_modules/xml-js/lib/json2xml.js");
__d(function (global, _$$_REQUIRE, _$$_IMPORT_DEFAULT, _$$_IMPORT_ALL, module, exports, _dependencyMap) {
  "use strict";

  var __assign = this && this.__assign || function () {
    __assign = Object.assign || function (t) {
      for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];

        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
      }

      return t;
    };

    return __assign.apply(this, arguments);
  };

  Object.defineProperty(exports, "__esModule", {
    value: true
  });

  exports.parseRawBearer = function (bearer) {
    return __assign({}, bearer._attributes, {
      offset: bearer._attributes.offset ? parseInt(bearer._attributes.offset, 10) : null,
      cost: bearer._attributes.cost ? parseInt(bearer._attributes.cost, 10) : null,
      mimeValue: bearer._attributes.mimeValue ? bearer._attributes.mimeValue : null,
      bitrate: bearer._attributes.bitrate ? bearer._attributes.bitrate : null
    });
  };

  exports.parseRawMediaDescription = function (rawMediaDescription) {
    return rawMediaDescription ? rawMediaDescription.map(function (mediaDescription) {
      return __assign({}, mediaDescription.multimedia._attributes, {
        height: parseInt(mediaDescription.multimedia._attributes.height, 10),
        width: parseInt(mediaDescription.multimedia._attributes.width, 10)
      });
    }) : [];
  };

  exports.parseRawLink = function (rawLinks) {
    return rawLinks ? (Array.isArray(rawLinks) ? rawLinks.map(function (link) {
      return rawLinkToLink(link);
    }) : [rawLinkToLink(rawLinks)]).slice() : [];
  };

  var rawLinkToLink = function (rawLink) {
    return {
      url: rawLink._attributes.url || null,
      mimeValue: rawLink._attributes.mimeValue || null,
      lang: rawLink._attributes["xml:lang"] || null,
      uri: rawLink._attributes.url || null,
      description: rawLink._attributes.description || null
    };
  };
},29,[],"node_modules/spi_xml_file_parser/artifacts/src/utilities.js");
__d(function (global, _$$_REQUIRE, _$$_IMPORT_DEFAULT, _$$_IMPORT_ALL, module, exports, _dependencyMap) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });

  var messages_1 = _$$_REQUIRE(_dependencyMap[0], "../messages");

  exports.httpRequest = function (method, url, body) {
    return new Promise(function (resolve, reject) {
      var transactionId = uuidv4();
      LiquidCore.on(messages_1.IncomingMessageType.HTTP_CALL_RESPONSE + transactionId, function (res) {
        if (200 <= res.status && res.status < 400) {
          try {
            console.log("DEBUG: HTTP RESPONSE!", res.status, url, transactionId);
            resolve({
              status: res.status,
              data: res.body || null
            });
          } catch (e) {
            reject(e);
          }
        } else {
          reject(res.status);
        }
      });
      LiquidCore.emit(messages_1.OutgoingMessageType.MAKE_HTTP_CALL_INTENT, {
        method: method,
        url: url,
        body: body ? JSON.stringify(body) : undefined,
        transactionId: transactionId
      });
    });
  };

  var uuidv4 = function uuidv4() {
    var uuid = "",
        i,
        random;

    for (i = 0; i < 32; i++) {
      random = Math.random() * 16 | 0;

      if (i == 8 || i == 12 || i == 16 || i == 20) {
        uuid += "-";
      }

      uuid += (i == 12 ? 4 : i == 16 ? random & 3 | 8 : random).toString(16);
    }

    return uuid;
  };
},30,[3],"artifactsKokoro/kokoro/services/http.js");
__r(0);