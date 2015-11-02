/**
 * Created by ahaith on 28/10/2015.
 */
define([
        'backbone',
        'underscore',
        'app/views/interactive/InteractiveSphereView',
        'hbs!app/templates/interactive/globe_interactive',
        'app/mixins/overlay',
        'hbs!app/templates/overlay_interactive_inner'
    ],
    function(
        Backbone,
        _,
        InteractiveSphereView,
        globeTemplate,
        overlayMixin,
        interactiveInnerTemplate
    ) {

        var GlobeInteractive = Backbone.View.extend({
            template: globeTemplate,

            initialize: function(params) {
                this.overlayInitialize({ displayOnArrival: false });
                this.overlaySetTemplate( interactiveInnerTemplate, this.model.toJSON());
            },

            afterRender: function() {
                this.globeView = new InteractiveSphereView({
                    el: $('.globe-interactive'),
                    model: this.model,
                    texture: 'img/objects/globe/antiqueMap.jpg',
                    canRotateUpDown: true,
                    //lightFromSun: true,
                    tiltTowardCam: 20,
                    //marker: {lat: 51.7, lng: 1.2},
                    defaultRotY: -50,
                    //panRatio: 1.0
                });
                this.globeView.render();
            },

            cleanup: function() {
                this.globeView.remove();
                this.overlayCleanup();
            }
        });

        _.extend(GlobeInteractive.prototype, overlayMixin);

        return GlobeInteractive;

    }
);