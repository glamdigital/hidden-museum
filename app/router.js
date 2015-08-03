define(["backbone", "jquery", "underscore",
          "app/collections/TrailsCollection",
          "app/views/TrailsView", "app/views/TrailIntroView", "app/views/TopicView", "app/views/ItemView", "app/views/FinishedView",
          "app/views/ContentView", "app/views/HeaderView", "app/models/Session", "app/views/DashboardView",
		  "app/views/BeaconListenView", "app/views/CodeEntryView", "app/views/QRCodeEntryView", "app/views/FollowTrailView",
          "app/floor_tracking"],
  function(Backbone, $, _,
            TrailsCollection,
            TrailsView, TrailIntroView, TopicView, ItemView, FinishedView,
            ContentView, HeaderView, Session, DashboardView,
            BeaconListenView, CodeEntryView, QRCodeEntryView, FollowTrailView,
            FloorTracking) {

    var SEVRouter = Backbone.Router.extend({
        initialize: function() {
          //initialize the collections
          this.allTrails = new TrailsCollection();
          this.allTrails.fetch({
            error: function(coll, resp, opt) {
              console.log("error fetching trails: ");
              console.log(resp);
            },
            success: function(coll, resp, opt) {
                Backbone.history.start();
            }
          });

            //create the container content-view
            this.contentView = new ContentView({el:$('#content')});
            this.headerView = new HeaderView({el:$('#prheader'), prevLink:null, nextLink:null, logoLink:"#"});
            this.headerView.render();
        },

        routes: {
            "": "home",
            "home": "home",
            "trail/:trail": "trail",
            "topic/:topic": "topic",
            "item/:item": "item",
            "found/:item": "found_item",
            "finished/:trail": "finished",
            "restart": "restart",
            "dashboard": "dashboard"
        },

        home: function() {

          //
          //var view = new TrailsView({
          //  trails:this.allTrails
          //});§
          //this.contentView.setView(view);
          //view.renderIfReady();
          //
          //  //set links
          //  this.headerView.setPrevURL(null);
          //  this.headerView.setNextURL(null);
          //  this.headerView.setLogoURL('#');
          //  this.headerView.render();

	        this.prefsTrail = null;
	        try {
		        plugins.appPreferences.fetch(
			        _.bind(function (result) {
				        //success
				        this.prefsTrail = result;

						this.goToTrail(this.prefsTrail);
			        }, this),
			        _.bind(function (result) {
				        //fail
				        console.log(result);
				        this.prefsTrail = 'p2a';

				        this.goToTrail(this.prefsTrail);

			        }, this),
			        'prototype'
		        );
	        } catch(err) {
		        //desktop browser?
		        this.prefsTrail = 'p4';
		        alert(err);
				this.goToTrail(this.prefsTrail);
	        }

        },
	    goToTrail: function(slug) {
                //create a new session for the chosen trail
	            var trail = this.allTrails.findWhere( {slug: this.prefsTrail} );
	            this.session = new Session(trail);

	            FloorTracking.prompttoSwitch = false;

		        //choose start page
		        // first item for a trail. 'topic' view for anything else.
		        //redirect to the 'component(/topic) view'
		        if(trail.attributes.isTrail) {
			        Backbone.history.navigate(this.session.getNextURL())
		        }
		        else {
			        //go to only topic if only one topic, else go to main
			        topics = trail.getTopics();

			        if(topics.length >= 2 ) {
				        this.multiple_topics = true;
				        Backbone.history.navigate('#/trail/' + trail.attributes.slug);
			        }
			        else if (topics.length == 1) {
			            Backbone.history.navigate('#/topic/component');
			        } else {
				        console.log("No topics for trail: " + trail.attributes.slug);
			        }
		        }

	    },

        trail: function(trailSlug) {


            //get trail from settings
            //console.log("Not expecting to go to '/trail' route.");

	        //we already have a session with the right trail, so trailSlug is redundant in the route.
	        var trail = this.session.getCurrentTrail();

            ////create intro view
            var view = new TrailIntroView({
                trail: trail,
                nextURL: this.session.getNextURL()
            });



            this.contentView.setView(view);
            view.render();

            //set links
            this.headerView.setPrevURL(null);
            this.headerView.setNextURL(null);
            this.headerView.render();

        },

        topic: function(topicSlug) {
            var topic = this.session.getTopic(topicSlug);
            var trail = this.session.getCurrentTrail();

	        require(['app/views/' + trail.attributes.start_view_class], _.bind(function(topicViewClass) {
		        var view = new topicViewClass({
	                topic: topic,
	                trail: trail,
	            });
	            this.contentView.setView(view);
	            view.render();

	            //links
		        //back button only present if more than one topic
	            this.headerView.setPrevURL(this.multiple_topics ? '#/trail/' + trail.attributes.slug : null);
	            this.headerView.setNextURL(null);
	            this.headerView.render();

	            FloorTracking.prompttoSwitch = true;
	        },this));

        },

        found_item: function(itemSlug) {
            this.item(itemSlug, true);

            //links
            //if(!trail.attributes.isTrail) {
            //    this.headerView.setPrevURL('#/topic/component');
            //}
            this.headerView.setNextURL(null);
            this.headerView.render();

            FloorTracking.prompttoSwitch = true;
        },
        item: function(itemSlug, found) {
            //default 'found' to false if not specified
            found = typeof found !== 'undefined' ? found : false;

            var item = this.session.getItem(itemSlug);
            //Inform the session that we've visited this item
            this.session.visitItem(itemSlug);
            var nextURL = this.session.getNextURL();
            var currentTrail = this.session.getCurrentTrail();
            var currentTopic = this.session.getCurrentTopic();
            var view = new ItemView({
                item: item,
                trail: currentTrail,
                topic: currentTopic,
                nextURL: nextURL,
                found: found,
                headerView: this.headerView
            });
            this.contentView.setView(view);
            view.render();

            //links
	        if(!currentTrail.attributes.isTrail) {
		        this.headerView.setPrevURL('#topic/' + currentTopic.attributes.slug);
	        }
            this.headerView.setNextURL(null);
            this.headerView.render();

            FloorTracking.prompttoSwitch = false;
        },
        finished: function() {
            var trail = this.session.getCurrentTrail();
            var view = new FinishedView({trail:trail});
            this.contentView.setView(view);
            view.render();
            //TODO mark with the session that it's finished.
            //TODO re-render the nav menu

            //links
            this.headerView.setPrevURL('#');
            this.headerView.setNextURL(null);
            this.headerView.render();

            FloorTracking.prompttoSwitch = false;
        },
        restart: function() {
            //restart the current trail
            trail = this.session.getCurrentTrail();
            this.session = new Session(trail.attributes.slug);
            Backbone.history.navigate(this.session.getNextURL());

            FloorTracking.prompttoSwitch = false;
        },
        dashboard: function() {
            var dashboardView = new DashboardView( [
                {beaconId: 64823, name: 'ground'},
                {beaconId: 18829, name: 'floor1'},
                {beaconId: 5744, name: 'floor2'}
            ]);
            this.contentView.setView(dashboardView);
            dashboardView.render();

            FloorTracking.prompttoSwitch = false;
        }
    });

    return SEVRouter;

  });
