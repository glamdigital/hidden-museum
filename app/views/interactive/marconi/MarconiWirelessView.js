define(["backbone", "hbs!app/templates/interactive/marconiWireless", "app/mixins/overlay",
        "hbs!app/templates/overlay_interactive_inner"],
    function(Backbone, marconiWirelessTemplate, overlayMixin,
        interactiveInnerTemplate) {

    var MarconiWirelessView = Backbone.View.extend({
        template: marconiWirelessTemplate,

        events: {
          "click #wireless-button": "wirelessButtonHandler"
        },

        serialize: function() {
            var out = {};
            return out;
        },

        initialize: function(params) {
            this.overlayInitialize({ displayOnArrival: true});
            this.overlaySetTemplate(interactiveInnerTemplate, this.model.toJSON());
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

     _.extend(MarconiWirelessView.prototype, overlayMixin);

    return MarconiWirelessView;

});