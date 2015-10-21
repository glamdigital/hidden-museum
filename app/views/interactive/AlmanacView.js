define(["backbone", "app/models/interactive/SextantModel", "hbs!app/templates/interactive/almanac"],
    function(Backbone, SextantModel, almanacTemplate) {

    var AlmanacView = Backbone.View.extend({
        template: almanacTemplate,

        events: {
          "click .tab": "tabButtonHandler"
        },

        serialize: function() {
            var out = {};
            out.instructions = this.instructions[this.model.attributes.mode];
            return out;
        },

        initialize: function(params) {
            this.tab = 1;
            this.instructions = { 
                                    'sun':"instructions for the Sun",
                                    'pole star':"instructions for the Pole Star"
                                }
            this.model = new SextantModel();
            this.model.on('change', this.render, this);
        },
        afterRender: function() {
            switch (this.model.attributes.mode) {
                case "sun": $('#instructions').removeClass("pole-star");break;       
                case "pole star": $('#instructions').addClass("pole-star");break;
            }           
            this.setLatitudeIndicator($('#value-indicator')[0], "Latitude", this.model.getLatitude());
        },
        setup: function() {        
      
        },
        tabButtonHandler: function(ev) {
            var $target = $(ev.target);
            switch ($target.attr("id")) {
                case "sun": { 
                    this.model.set({mode:"sun"});                         
                    break;
                }        
                case "pole-star": {
                    this.model.set({mode:"pole star"}); 
                    break;
                }
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
            var parentHeight = 180;//$($parent).height();
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
            $instructionsDiv.innerHTML = this.instructions[this.model.attributes.mode];
        },
        showMessage: function() {
            $('#message').show();
            $('#message')[0].innerHTML = ""
            var $messageDiv = $('#message')[0];
            $('#message').hide();
        },
	    cleanup: function() {
		  
	    },

    });

    return AlmanacView;

});