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
          
          $(window).resize(this.adjustPosition);
          
          //this.overlaySetTemplate('foo');
          
          // var baseRender = this.render;
          // this.render = function () {
          //   this.overlayMixin
          // }
          
          
          this.overlayView = new this.OverlayView({el:$('#content-overlay')});
          
          this.overlayView.render();
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
  
  _.extend(TrailsView.prototype, overlayMixin);
  
  return TrailsView;
});
