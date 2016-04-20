define([
  "backbone",
  "hbs!app/templates/interactive/almanac",
  "app/mixins/overlay",
  "hbs!app/templates/overlay_interactive_inner"
], function(
  Backbone,
  almanacTemplate,
  overlayMixin,
  interactiveInnerTemplate
) {

    var AlmanacView = Backbone.View.extend({
        template: almanacTemplate,
        
        events: {
          "click #done-button": "done"
        },
        
        serialize: function() {
            var out = {};
            out.instructions = this.instructions[this.stateModel.attributes.mode];
            out.donePath = '#/topic/'+this.item.attributes.slug;
            return out;
        },
        
        initialize: function(params) {
            this.tab = 1;
            this.item = params.item;
            this.instructions = { 
                'sun': "<p>Assuming you are in the nothern hemisphere, the almanac shows that according to your " +
                "measurement of the noon sun you are located "+ this.stateModel.getLatitude().toPrecision(5).toString()
                + "&deg; north of the equator.</p>"
            };
            
            this.stateModel.on('change', this.render, this);
            this.overlayInitialize({ displayOnArrival: false });
            this.overlaySetTemplate(interactiveInnerTemplate, this.model.toJSON());
        },
        
        afterRender: function() {
            this.setLatitudeIndicator($('#value-indicator')[0], "Latitude", this.stateModel.getLatitude());
        },
        
        setup: function() {
      
        },
        
        showLatitudeIndicator: function() {
            $('#value-indicator').show();
        },
        
        hideLatitudeIndicator: function() {
            $('#value-indicator').hide();
        },
        
        setLatitudeIndicator: function($indicator, label, angle) {
            var $parent = $($indicator).parent();
            var parentHeight = $($parent).height();
            console.log("parentHeight", parentHeight);
            var parentTop = $($parent).offset().top;
            // convert from degrees to radians
            var latRad = angle*Math.PI/180;
            
            // get y value
            var mercN = Math.log(Math.tan((Math.PI/4)+(latRad/2)));
            
            //adjustment factor due to the map ending at ~80deg north
            var topProportion = 0.81;
            
            var y  = parentHeight - parentHeight*mercN/(Math.PI * topProportion);
            $($indicator).offset({left: $($indicator).offset().left, top: parentTop + y});
            this.setLatitudeIndicatorText($("#latitude-calculation"), "North:"+angle.toPrecision(5).toString(), this.stateModel.attributes.angle.toPrecision(3).toString()+ "&deg;");
  
        },
        
        setLatitudeIndicatorText: function($indicator, latitude, angle) {
            $indicator.find("#angle-indicator").html(angle);
            $indicator.find("#latitude-indicator").html(latitude);
        },
        
        showReferenceLatitude: function() {
             $('#reference-indicator').show();
        },
        
        hideReferenceLatitude: function() {
             $('#reference-indicator').hide();
        },
        
        done: function() {
            Backbone.history.navigate('#/topic/' + this.item.attributes.topic);
        },
        
        cleanup: function() {
          this.overlayCleanup();
        }
    });
    _.extend(AlmanacView.prototype, overlayMixin);

    return AlmanacView;
});
