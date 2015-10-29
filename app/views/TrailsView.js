define(["backbone", "jquery", "hbs!app/templates/trails", "app/mixins/overlay"], function(Backbone, $, trailsTemplate, overlayMixin) {

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
          
          this.overlayInitialize({ displayOnArrival: window.firstRun });
          
          if (window.firstRun) {
            // Permanently clear the firstRun flag.
            window.firstRun = false;
          }
      },
      
      cleanup: function () {
        this.overlayCleanup();
      },
      
      afterRender: function() {
        this.adjustPosition();
      },
      
      adjustPosition: function() {
        
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
