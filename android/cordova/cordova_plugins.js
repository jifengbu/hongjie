cordova.define('cordova/plugin_list', function(require, exports, module) {
    "use strict";
    module.exports = [
        {
            "file": "plugins/utils.js",
            "id": "plugins.utils",
            "merges": [
                "navigator.utils"
            ]
        },
        {
            "file": "plugins/phonertc.js",
            "id": "com.dooble.phonertc.PhoneRTC",
            "clobbers": [
                "navigator.phonertc"
            ]
        }
    ];
    module.exports.metadata =
    {
        "plugins.utils" :"0.0.1"
    };
});
