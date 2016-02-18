/**
 * Created by ahaith on 30/10/2015.
 */
define([
        'backbone',
        'underscore',
        'hbs!app/templates/interactive/blackboard',
        'app/views/VideoControlsView',
        'app/mixins/overlay',
        'hbs!app/templates/overlay_interactive_inner'
    ],
    function(
        Backbone,
        _,
        blackboardTemplate,
        VideoControlsView,
        overlayMixin,
        interactiveInnerTemplate
    ) {

        var BlackboardVideoView = Backbone.View.extend({
            template: blackboardTemplate,

            initialize: function(params) {
                this.overlayInitialize({displayOnArrival: false});
                this.overlaySetTemplate(interactiveInnerTemplate, this.model.toJSON());
                this.playImmediately = true;
            },

            afterRender: function() {
                this.videoControlsView = new VideoControlsView({
                    el: $('.interactive.blackboard'),
                    orientationMode: 'landscape-primary',
                    hidePause: true,
                    videoPath: this.item.attributes.video,
                    playImmediately: this.playImmediately,

                    onFinalFrame: function() {
                        Backbone.history.navigate('#/topic/' + this.item.attributes.object);
                    }.bind(this)
                });
                this.videoControlsView.render();
            },
            cleanup: function() {
                this.videoControlsView.remove();
                this.overlayCleanup();
            },
        });

        _.extend(BlackboardVideoView.prototype, overlayMixin);

        return BlackboardVideoView;

    }
);
