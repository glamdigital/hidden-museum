define([
        'backbone',
        'underscore',
        'hbs!app/templates/interactive/blackboard_gallery',
        'app/mixins/overlay',
        'hbs!app/templates/overlay_interactive_inner'
    ],
    
    function (Backbone, _, blackboardGalleryTemplate, overlayMixin, interactiveInnerTemplate) {
        var BlackboardGalleryView = Backbone.View.extend({
            template: blackboardGalleryTemplate,
            
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
                
            },
            
            cleanup: function () {
                this.overlayCleanup();
            },
        });
        
        _.extend(BlackboardGalleryView.prototype, overlayMixin);
        
        return BlackboardGalleryView;
    }
);
