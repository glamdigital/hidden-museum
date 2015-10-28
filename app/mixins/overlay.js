define([
        'backbone',
        'underscore',
        'hbs!app/templates/overlay_base',
        'hbs!app/templates/overlay_default_inner'
    ],
    
    function (Backbone, _, baseTemplate, defaultInnerTemplate) {
        var overlayMixin = {
            overlaySetTemplate: function (template) {
                this.overlayView.innerTemplate = template;
                this.overlayView.render();
            }
        };
        
        var OverlayView = Backbone.View.extend({
            template: baseTemplate,
            
            serialize: function() {
                return {};
            },
            
            innerTemplate: defaultInnerTemplate,
            
            initialize: function (params) {
                this.listenTo(Backbone, 'nav_info', this.toggleVisibility);
            },
            
            toggleVisibility: function () {
                var jContentOverlay = $('#content-overlay');
                
                console.log('nav_info received by overlay');
                
                if (jContentOverlay.hasClass('hidden')) {
                    this.render();
                    jContentOverlay.removeClass('hidden');
                }
                else {
                    jContentOverlay.addClass('hidden');
                }
            }
        });
        
        overlayMixin.OverlayView = OverlayView;
        
        //overlayMixin.overlayView = new OverlayView({el:$('#content-overlay')});
        // overlayMixin.overlayView.render();
        
        return overlayMixin;
    }
);
