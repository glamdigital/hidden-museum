define(["backbone", "jquery", "underscore",
          "app/collections/TrailsCollection",
          "app/views/TrailsView", "app/views/TrailIntroView", "app/views/TopicView", "app/views/ItemView", "app/views/FinishedView",
          "app/views/ContentView", "app/views/HeaderView", "app/models/Session", "app/views/DashboardView",
          "app/floor_tracking"],
  function(Backbone, $, _,
            TrailsCollection,
            TrailsView, TrailIntroView, TopicView, ItemView, FinishedView,
            ContentView, HeaderView, Session, DashboardView,
            FloorTracking) {

    var SEVRouter = Backbone.Router.extend({
        initialize: function() {
          //initialize the collections
          this.allTrails = new TrailsCollection();
          this.allTrails.fetch({
            error: function(coll, resp, opt) {
              console.log("error fetching trails: ");
              console.log(resp);
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
          var view = new TrailsView({
            trails:this.allTrails
          });
          this.contentView.setView(view);
          view.renderIfReady();

            //set links
            this.headerView.setPrevURL(null);
            this.headerView.setNextURL(null);
            this.headerView.setLogoURL('#');
            this.headerView.render();

            FloorTracking.prompttoSwitch = false;
        },

        trail: function(trailSlug) {
            //create a new session for the chosen trail
            var trail = this.allTrails.findWhere( {slug: trailSlug} );
            this.session = new Session(trail);

            //create intro view
            var view = new TrailIntroView({
                trail: trail,
                nextURL: this.session.getNextURL()
            });

            this.contentView.setView(view);
            view.render();

            //set links
            this.headerView.setPrevURL('#');
            this.headerView.setNextURL(null);
            this.headerView.render();

            FloorTracking.prompttoSwitch = true;
        },

        topic: function(topicSlug) {
            var topic = this.session.getTopic(topicSlug);
            var trail = this.session.getCurrentTrail();
            var view = new TopicView({
                topic: topic,
                trail: trail
            });
            this.contentView.setView(view);
            view.render();

            //links
            this.headerView.setPrevURL('#trail/' + trail.attributes.slug);
            this.headerView.setNextURL(null);
            this.headerView.render();

            FloorTracking.prompttoSwitch = true;
        },

        found_item: function(itemSlug) {
            this.item(itemSlug, true);

            //links
            this.headerView.setNextURL(this.session.getNextURL());
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
            this.headerView.setPrevURL('#topic/' + currentTopic.attributes.slug);
            this.headerView.setNextURL('#found/' + item.attributes.slug);
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
