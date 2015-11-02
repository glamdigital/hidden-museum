/**
 * Created by ahaith on 30/10/2015.
 */
define([
        'backbone',
        'underscore',
        'hbs!app/templates/interactive/bbVideo',
        'app/views/VideoControlsView',
        'app/mixins/overlay',
        'hbs!app/templates/overlay_interactive_inner'
    ],
    function(
        Backbone,
        _,
        bbVideoTemplate,
        VideoControlsView,
        overlayMixin,
        interactiveInnerTemplate
    ) {

        var BlackboardVideoView = Backbone.View.extend({
            template: bbVideoTemplate,

            initialize: function(params) {
                this.overlayInitialize({displayOnArrival: false});
                this.overlaySetTemplate(interactiveInnerTemplate, this.model.toJSON());
            },

            afterRender: function() {
                this.videoControlsView = new VideoControlsView({ el: $('.interactive.video')});
                this.videoControlsView.initialize({
                    orientationMode: 'portrait',
                    hidePause: true,
                    imagePath: this.item.attributes.image,
                    videoPath: this.item.attributes.video,

                    onFinalFrame: function() {
                        Backbone.history.navigate('#/topic/' + this.item.attributes.object);
                    }.bind(this)
                });
                this.videoControlsView.render();
            },

            cleanup: function() {
                this.overlayCleanup();
            },
        });

        _.extend(BlackboardVideoView.prototype, overlayMixin);

        return BlackboardVideoView;

    }
);