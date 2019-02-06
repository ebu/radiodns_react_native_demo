'use strict';

const Metro = require('metro');

Metro.loadConfig().then(config => {
    Metro.runBuild(config, {
        dev: true,
        entry: "./artifactsKokoro/kokoro/CentralStateService.js",
        minify: false,
        out: "android/app/src/main/res/raw/kokoro.js",
        sourceMap: false,
    })
});
