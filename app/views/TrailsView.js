define([
  "backbone",
  "jquery",
  "hbs!app/templates/trails",
  "app/preloadImages",
  "app/mixins/overlay"
], function(
  Backbone,
  $,
  trailsTemplate,
  preloadImages,
  overlayMixin
) {

  var TrailsView = Backbone.View.extend({
      template: trailsTemplate,
      
      serialize: function() {
        return { trails: this.trails.toJSON() };
      },
      
      initialize: function(params) {
          this.trails = params.trails;
          this.ready=false;
          this.trails.on('sync', function() {
              this.render();
          }, this);
          
          this.listenTo(Backbone, 'nav_info', this.toggleInfoPanel);
          
          $(window).resize(this.adjustPosition);
          
          this.overlayInitialize({ displayOnArrival: false });
          
          if (window.firstRun) {
            // Permanently clear the firstRun flag.
            window.firstRun = false;
          }
          
          this.beaconsDict = {};
          this.trails.each(_.bind(function(trail) {
            var eventID = 'beaconRange:' + trail.attributes.entryPointBeaconID1;
            this.listenTo(Backbone, eventID, this.didRangeBeacon);
            this.beaconsDict[trail.attributes.entryPointBeaconID1.toString()] = trail;
          }, this));
      },
      
      didRangeBeacon: function(data) {
        var trail = this.beaconsDict[data.major.toString()];
        if(typeof(trail) !== 'undefined') {
          if(data.proximity == 'ProximityNear' || data.proximity == 'ProximityImmediate') {
              //find relevant elements and add classes
              $('#'+ trail.attributes.slug +'-background').addClass('nearby');
          } else {
              $('#'+ trail.attributes.slug +'-background').removeClass('nearby');
          }
        }
      },
      
      cleanup: function () {
        this.overlayCleanup();
      },
      
      afterRender: function() {
        this.adjustPosition();
        preloadImages.preload("trails");
      },
      
      adjustPosition: function() {
          var contentHeight = $('.content').height();
          $('.trails-list-container>a').height(contentHeight/3);
      },
      
      renderIfReady: function() {
          //Called from the route.
          // On first visiting the trail select page, we only want to render it once the trails have synced
          // On subsequent visits, we should render immediately.
          if (this.trails.length > 0) {
              this.render();
          }
      },
      
      toggleInfoPanel: function () {
        console.log('Info button pressed');
      }
  });
  
  _.extend(TrailsView.prototype, overlayMixin);
  
  return TrailsView;
});
