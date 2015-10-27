define(["backbone", "jquery", "hbs!app/templates/trails"], function(Backbone, $, trailsTemplate) {

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
          $(window).resize(this.adjustPosition);
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
      }
  });
  
  return TrailsView;
});
