define([
        "backbone",
        "jquery",
        "underscore",
        "app/collections/TrailsCollection",
        "app/views/TrailsView",
        "app/views/TrailView",
        "app/views/TopicView",
        "app/views/FinishedView",
        "app/views/ContentView",
        "app/views/HeaderView",
        "app/views/DashboardView",
        "app/views/BeaconListenView",
        "app/views/CodeEntryView",
        "app/views/QRCodeEntryView",
        "app/views/FollowTrailView",
        "app/views/interactive/ImageScanView",
        "app/views/interactive/ImageScannedView",
        "app/floor_tracking",
        "app/views/interactive/SextantView",
        "app/views/interactive/AlmanacView",
        "app/models/interactive/SextantModel",
        "app/views/interactive/clock/ClockView",
        "app/views/interactive/InteractiveSphereView",
        "app/views/interactive/ReckonerView"
    ],
    
    function(Backbone, $, _,
            TrailsCollection,
            TrailsView,
            TrailView,
            TopicView,
            FinishedView,
            ContentView,
            HeaderView,
            DashboardView,
            BeaconListenView,
            CodeEntryView,
            QRCodeEntryView,
            FollowTrailView,
            ImageScanView,
            ImageScannedView,
            FloorTracking,
            SextantView,
            AlmanacView,
            SextantModel,
            ClockView,
            InteractiveSphereView,
            ReckonerView
        ) {
        
        var SEVRouter = Backbone.Router.extend({
            initialize: function() {
                //initialize the collections
                window.allTrails = new TrailsCollection();
                window.allTrails.fetch({
                    error: function(coll, resp, opt) {
                        console.log("error fetching trails: ");
                        console.log(resp);
                    },
                    success: _.bind(function(coll, resp, opt) {
                        //global obj to store some session state
                        window.session = {
                            currentTrail: window.allTrails.first(),   //user chosen trail
                            currentPhysicalTrail: null,               //our guess at user's current floor location
                            currentTopic: window.allTopics.first(),
                        };
                        //start floor tracking
                        this.floorTracker = new FloorTracking();
                        Backbone.history.start();
                    }, this)
                });
                
                this.sextantModel = new SextantModel();
                
                //create the container content-view
                this.contentView = new ContentView({el:$('#content')});
                this.headerView = new HeaderView({el:$('#prheader'), prevLink:null, nextLink:null, logoLink:"#"});
                this.headerView.render();
            },
            
            routes: {
                "": "trails",
                "home": "trails",
                "trails": "trails",
                "trail/:trail": "trail",
                "topic/:topic": "topic",
                "finished/:trail": "finished",
                "restart": "restart",
                "dashboard": "dashboard",
                //custom routes
                "scan/:item": "item_scan",    //scan for the specific item
                "scanned/:item": "item_scanned",    //after the item has been found
                "interact/:item/:type/:index": "interact",   //interactive view for item
                "scan": "scan",
                "spheretest": "spheretest",
            },
            
            trails: function() {
                var view = new TrailsView({
                    trails:window.allTrails
                });
                this.contentView.setView(view);
                view.renderIfReady();
                
                //set links
                this.headerView.setPrevURL(null);
                this.headerView.setNextURL(null);
                this.headerView.setLogoURL('#');
                this.headerView.render();
                
                this.floorTracker.promptToSwitch = false;
            },
            
            trail: function(trailSlug) {
                var trail = window.allTrails.findWhere( {slug: trailSlug} );
                if (trail) {
                    //trail explicitly specified
                    window.session.currentTrail = trail;
                } else {
                    //use the current session trail
                    trail = window.session.currentTrail;
                }
                
                ////create intro view
                var view = new TrailView({
                    trails: window.allTrails,
                    selectedTrail: window.session.currentTrail
                });
                
                this.contentView.setView(view);
                view.render();
                
                //set links
                this.headerView.setPrevURL('#/trails');
                this.headerView.render();
                
                this.floorTracker.promptToSwitch = false;
            },
            
            topic: function(topicSlug) {
                var topic = window.allTopics.findWhere({slug: topicSlug});
                
                window.session.currentTopic = topic;
                var view = new TopicView({
                    topic: topic,
                });
                this.contentView.setView(view);
                view.render();
                
                //links
                //back button only present if more than one topic
                this.headerView.setPrevURL('#/trail/current');
                this.headerView.setNextURL(null);
                this.headerView.render();
                
                this.floorTracker.promptToSwitch = true;
            },
            
            finished: function() {
                console.error('Finished not implemented.');
            },
            
            restart: function() {
                console.error("Restart trail not implemented");
            },
            
            dashboard: function() {
                var dashboardView = new DashboardView([
                    {beaconId: 64823, name: 'ground'},
                    {beaconId: 18829, name: 'floor1'},
                    {beaconId: 5744, name: 'floor2'}
                ]);
                this.contentView.setView(dashboardView);
                dashboardView.render();
                
                this.floorTracker.promptToSwitch = false;
            },
            
            scan: function() {
                var scanView = new ImageScanView();
                this.contentView.setView(scanView);
                setTimeout(scanView.render, 500);
                
                //set links
                this.headerView.setPrevURL('#');
                this.headerView.setNextURL(null);
                this.headerView.render();
            },
            
            item_scan: function(item_slug) {
                var item = window.allItems.findWhere({slug: item_slug});
                
                var scanView = new ImageScanView({ item: item });
                this.contentView.setView(scanView);
                //setTimeout(scanView.render, 1000);
                scanView.render();
                
                //set links
                this.headerView.setPrevURL('#');
                this.headerView.setNextURL(null);
                this.headerView.render();
            },
            
            item_scanned: function(item_slug) {
                var item = this.session.getItem(item_slug);
                
                var scannedView = new ImageScannedView( { item: item } );
                this.contentView.setView(scannedView);
                scannedView.render();
            },
            
            interact: function(item_slug, interact_type, index) {
                var interactView;
                var item = window.allItems.findWhere({slug: item_slug});
                
                //set prev link
                this.headerView.setPrevURL('#/topic/' + window.session.currentTopic.attributes.slug);
                this.headerView.render();
                
                switch (interact_type) {
                    case 'sextant-interact':
                        switch (index) {
                            case '0': interactView = new SextantView({ item: item, model:item, stateModel:this.sextantModel }); break;
                            case '1': interactView = new AlmanacView({ item: item, stateModel:this.sextantModel }); break;
                        }
                        break;
                    
                    case 'clock-interact':
                        switch (index) {
                            case '0': interactView = new ClockView({ item: item, model:item }); break;
                        }
                        break;
                    
                    case 'reckoner-interact':
                        // switching on 'index' unneeded here as this isn't a multiple-stage interactive.
                        interactView = new ReckonerView({ item: item, model: item });
                        break;
                }
                
                this.contentView.setView(interactView);
                interactView.render();
                this.floorTracker.promptToSwitch = true;
            },
            spheretest: function() {
                var sphereView = new InteractiveSphereView({
                    texture: 'img/objects/globe/map_texture_9.jpg',
                });

                this.contentView.setView(sphereView);
                sphereView.render();
            }
        });
        
        return SEVRouter;
    }
);
