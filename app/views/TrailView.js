define(["backbone", "underscore", "app/models/Trail", "app/views/AudioControlsView", "hbs!app/templates/trail"],
    function(Backbone, _, Trail, AudioControlsView, trail) {

    var TrailView = Backbone.View.extend({

        template: trail,

        initialize: function(params) {
            this.trails = params.trails;
            this.selectedTrail = params.selectedTrail;
            this.listenTo(Backbone, 'changed_floor', this.changedFloor);
        },

        afterRender: function() {
            $('.trail-content').hide();
            $('#'+this.selectedTrail.attributes.slug +' > .trail-content').show();
        },

        serialize: function() {
            var out = {}
            out.trails = this.trails.toJSON();
            for (var i=0; i< this.trails.length; i++) {
                var topicsJSON = this.trails.models[i].getTopics().toJSON();
                out.trails[i]['topics'] = topicsJSON;
            }  
            out.trail_slug = this.selectedTrail.attributes.slug;
            return out;
        },

        events: {
            "click .trail-title" : "onSelectTrail",
        },

        onSelectTrail: function(ev) {
            var $target = $(ev.target).parent();
            var slug = $target.attr('id');
            this.selectedTrail = this.trails.findWhere({'id':slug});
            this.render();
        }

    });

    return TrailView;

});
