define(["backbone", "underscore", "app/models/Trail", "hbs!app/templates/trail"],
    function(Backbone, _, Trail, trail) {

    var TrailView = Backbone.View.extend({

        template: trail,

        initialize: function(params) {
            this.trails = params.trails;
            this.selectedTrail = params.selectedTrail;
            this.listenTo(Backbone, 'changed_floor', this.changedFloor);
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

        afterRender: function() {
            this.doAccordianMagic(0);
        },

        events: {
            "click .trail-title" : "onSelectTrail",
        },

        onSelectTrail: function(ev) {
            var $target = $(ev.target).parent();
            var slug = $target.attr('id');
            var selectedTrail = this.trails.findWhere({'id':slug});
            if (selectedTrail != this.selectedTrail) {
                this.selectedTrail = selectedTrail;
                this.doAccordianMagic(200);           
            }
        },

        doAccordianMagic: function(duration) {
            var $selectedTrailDiv = $('#'+this.selectedTrail.attributes.slug);
            var $siblingsToClose = $selectedTrailDiv.siblings()
            if (duration > 0) {
                $siblingsToClose = $selectedTrailDiv.siblings('.open');
            }
            $selectedTrailDiv.addClass('open').children('.trail-content').slideDown(duration);
            $siblingsToClose.removeClass('open').children('.trail-content').slideUp(duration);
        }


    });

    return TrailView;

});
