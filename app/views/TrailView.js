define(["backbone", "underscore", "app/models/Trail", "app/views/AudioControlsView", "hbs!app/templates/trail"],
    function(Backbone, _, Trail, AudioControlsView, trail) {

    var TrailView = Backbone.View.extend({
        template: trail,

        initialize: function(params) {
            this.trails = params.trails
            this.selectedTrail = params.selectedTrail;
            this.listenTo(Backbone, 'changed_floor', this.changedFloor);
        },

        afterRender: function() {

        },

        serialize: function() {
            var out = {}
            out.trails = this.trails.toJSON();
            out.trail_slug = this.selectedTrail.attributes.slug;
            return out;
        },

        events: {

        },

    });

    return TrailView;

});
