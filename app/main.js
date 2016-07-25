/**
 * Created by ahaith on 30/01/15.
 */
require([
        'jquery',
        'backbone',
        'app/models/Trail',
        'app/models/Topic',
        'app/logging',
        'layoutmanager',
        'app/router',
        'app/location',
        'app/test/validateData',
        'app/floor_tracking',
        'fastclick'
    ],
    
    function ($, Backbone, Trail, Topic, Logging, LayoutManager, Router, Location, Tests, FloorTracking, Fastclick) {
    
    //UUIDs to monitor
    //TODO move this to config
    var Location_UUID_beacons = 'D191E31B-4298-41B5-BFE7-3382B57B9D81'; //beacons
    var Location_UUID_ios     = '8492E75F-4FD6-469D-B132-043FE94921D8'; //ios
    var Location_UUID_default = 'B9407F30-F5F8-466E-AFF9-25556B57FE6D'; //ios

    new Fastclick(document.body);

    var onReady = function () {
        // The 'firstRun' flag is intended to trigger anything in the app that must be done
        // the very first time it runs. The flag will be cleared deeper within the app once
        // it has served its purpose.
        window.firstRun = true;
        
        
        //calculate window height once - while we know webview is in portrait. 
        // After watching a landscape video, it is transiently the landscape height
        window.windowHeight = $(window).height();
        
        console.log("Device Ready");
        // Location.init();
        //Location.startRangingRegion(Location_UUID_ios);
        // Location.startRangingRegion(Location_UUID_beacons);

        //lock in portrait
        // if (screen && typeof screen.lockOrientation == 'function') {
        //     screen.lockOrientation('portrait-primary');
        // }

        //load topics and items
        Topic.loadItems(function () {
            Trail.loadTopics(function (coll) {
                //create the router - this starts backbone's history when it's ready.
                var router = new Router();
                
                console.log("Started the app");
            })
        });
    };
    
    //start the location service when the device is ready
    document.addEventListener('deviceready', onReady, false);
    
    Backbone.Layout.configure({ manage: true });
    
    //trigger device ready immediately in browser
    if (typeof cordova == 'undefined')
    {
        //alert("forcing ready");
        onReady();
    }
});
