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
            },
            
            afterRender: function () {
                this.videoControlsView = new VideoControlsView({ el: $('.interactive.reckoner') });
                this.videoControlsView.initialize({
                    orientationMode: 'portrait',
                    hidePause:       true,
                    imagePath:       this.item.attributes.image,
                    videoPath:       this.item.attributes.video,
                    
                    onFinalFrame: (function () {
                        Backbone.history.navigate('#/topic/' + this.item.attributes.object);
                    }).bind(this)
                });
                this.videoControlsView.render();
            },
            
            cleanup: function () {
                this.overlayCleanup();
            },
        });
        
        _.extend(ReckonerView.prototype, overlayMixin);
        
        return ReckonerView;
    }
);
