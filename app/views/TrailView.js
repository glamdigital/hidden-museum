define(["backbone", "underscore", "app/models/Trail", "hbs!app/templates/trail"],
    function(Backbone, _, Trail, trail) {

    var TrailView = Backbone.View.extend({

        template: trail,

        initialize: function(params) {
            this.trails = params.trails;
            this.selectedTrail = params.selectedTrail;
            this.listenTo(Backbone, 'changed_floor', this.changedFloor);

            //store the index for each object within its own gallery
            this.trails.each( function(trail) {
               var topics = trail.topics;
                topics.each( function(topic, index) {
                   topic.set({galleryIndex: ''+index + topic.attributes.slug});
                });
            });
        },

        afterRender: function() {
            //position the map markers
            this.trails.each( function(trail) {
                var $trailMap = $('#floorplan-' + trail.attributes.slug);
                //position markers
                trail.topics.each( function(topic) {
                    var $marker = $('#map-marker-' + topic.attributes.slug);
                    var top = $trailMap.height() * topic.attributes.mapY;
                    $marker.css('top', top + 'px');
                    var left = $trailMap.width() * topic.attributes.mapX;
                    $marker.css('left', left + 'px');
                });
            });
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

        },

    });

    return TrailView;

});
