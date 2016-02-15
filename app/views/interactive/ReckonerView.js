define([
        'backbone',
        'underscore',
        'hbs!app/templates/interactive/reckoner',
        'app/views/VideoControlsView',
        'app/mixins/overlay',
        'hbs!app/templates/overlay_interactive_inner'
    ],
    
    function (Backbone, _, reckonerTemplate, VideoControlsView, overlayMixin, interactiveInnerTemplate) {
        var ReckonerView = Backbone.View.extend({
            template: reckonerTemplate,
            
            events: {
            },
            
            serialize: function () {
                
            },
            
            initialize: function (params) {
                this.item = params.item;
                
                this.overlayInitialize({ displayOnArrival: true });
                this.overlaySetTemplate(interactiveInnerTemplate, this.model.toJSON());
                this.playImmediately = false;
            },
            
            afterRender: function () {
                this.videoControlsView = new VideoControlsView({
                    el: $('.interactive.reckoner'),
                    hidePause:       true,
                    imagePath:       this.item.attributes.image,
                    videoPath:       this.item.attributes.video,
                    playImmediately: this.playImmediately,
                    
                    onFinalFrame: (function () {
                        Backbone.history.navigate('#/topic/' + this.item.attributes.object);
                    }).bind(this)
                });
                this.videoControlsView.render();
                this.listenTo(this.overlayView, 'overlayDismissed', this.videoControlsView.transportPlay);
            },
            
            cleanup: function () {
                this.videoControlsView.remove();
                this.overlayCleanup();
            },
        });
        
        _.extend(ReckonerView.prototype, overlayMixin);
        return ReckonerView;
    }
);
