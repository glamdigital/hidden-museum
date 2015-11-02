define(["backbone", "hbs!app/templates/interactive/marconiWireless"],
    function(Backbone, marconiWirelessTemplate) {

    var MarconiWirelessView = Backbone.View.extend({
        template: marconiWirelessTemplate,

        events: {
          "click #wirelessButton": "wirelessButtonHandler"
        },

        serialize: function() {
            var out = {};
            return out;
        },

        initialize: function(params) {
        },
        afterRender: function() {
        },
        setup: function() {              
        },
        wirelessButtonHandler: function(ev) {
            var $target = $(ev.target);
        },
	    cleanup: function() {
	    },

    });

    return MarconiWirelessView;

});