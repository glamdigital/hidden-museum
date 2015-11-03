define(["backbone", "hbs!app/templates/interactive/almanac"],
    function(Backbone, almanacTemplate) {

    var AlmanacView = Backbone.View.extend({
        template: almanacTemplate,
        
        events: {
          "click .tab": "tabButtonHandler"
        },
        
        serialize: function() {
            var out = {};
            out.instructions = this.instructions[this.stateModel.attributes.mode];
            return out;
        },
        
        initialize: function(params) {
            this.tab = 1;
            
            this.instructions = { 
                'sun': "<p>Assuming you are in the Northern Hemisphere, your measurement for the noon day Sun today " +
                       "shows that you are " + this.stateModel.getLatitude().toPrecision(5).toString() +
                       "&deg; North of the Equator.</p>",
                       
                'pole star': "<p>In the Northern Hemisphere, the height of the Pole Star above the horizon is " +
                             "coincidentally always the same as your latitude because it is directly above the North Pole.</p>"
            };
            
            this.stateModel.on('change', this.render, this);
        },
        
        afterRender: function() {
            switch (this.stateModel.attributes.mode) {
                case "sun": $('#instructions').removeClass("pole-star");    break;
                case "pole star": $('#instructions').addClass("pole-star"); break;
            }
            
            this.setLatitudeIndicator($('#value-indicator')[0], "Latitude", this.stateModel.getLatitude());
        },
        
        setup: function() {
      
        },
        
        tabButtonHandler: function(ev) {
            var $target = $(ev.target);
            
            switch ($target.attr("id")) {
                case "sun":
                    this.stateModel.set({mode:"sun"});
                    break;
                
                case "pole-star":
                    this.stateModel.set({mode:"pole star"});
                    break;
            }
        },
        
        showLatitudeIndicator: function() {
            $('#value-indicator').show();
        },
        
        hideLatitudeIndicator: function() {
            $('#value-indicator').hide();
        },
        
        setLatitudeIndicator: function($indicator, label, angle) {
            var $parent = $($indicator).parent();
            var parentHeight = 270;//$($parent).height();
            var parentTop = $($parent).offset().top;
            // convert from degrees to radians
            var latRad = angle*Math.PI/180;
            
            // get y value
            var mercN = Math.log(Math.tan((Math.PI/4)+(latRad/2)));
            
            //adjustment factor due to the map ending at ~80deg north
            var topProportion = 0.81;
            
            var y  = parentHeight - parentHeight*mercN/(Math.PI * topProportion);
            $($indicator).offset({left: $($indicator).offset().left, top: parentTop + y});
            this.setLatitudeIndicatorText($indicator, label + ": " + angle.toPrecision(5).toString() + "&deg; North");
        },
        
        setLatitudeIndicatorText: function($indicator, text) {
            $indicator.innerHTML = text;
        },
        
        showReferenceLatitude: function() {
             $('#reference-indicator').show();
        },
        
        hideReferenceLatitude: function() {
             $('#reference-indicator').hide();
        },
        
        displayInstructions: function() {
            var $instructionsDiv = $('#instructions')[0];
            switch (this.stateModel.attributes.mode) {
                case 'sun':
                    $instructionsDiv.innerHTML = "<p>Assuming you are in the Northern Hemisphere, your measurement for " +
                                                 "the noon day Sun today shows that you are " + this.stateModel.getLatitude().toPrecision(5).toString() +
                                                 "&deg; North of the Equator.</p>";
                    break;
                    
                case 'pole star':
                    $instructionsDiv.innerHTML = "<p>In the Northern Hemisphere, the height of the Pole Star above the " +
                                                 "horizon is coincidentally always the same as your latitude because it " +
                                                 "is directly above the North Pole.</p>";
                    break;
            }
        },
        
        showMessage: function() {
            $('#message').show();
            $('#message')[0].innerHTML = "";
            var $messageDiv = $('#message')[0];
            $('#message').hide();
        },
        
        cleanup: function() {
          
        }
    });
    
    return AlmanacView;
});
