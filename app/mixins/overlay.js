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
            },
            
            overlayInitialize: function () {
                this.overlayView = new this.OverlayView();
                
                var jContentOverlay = $('#content-overlay');
                
                // Ensure the content overlay is hidden to begin with.
                if (!jContentOverlay.hasClass('hidden')) {
                    jContentOverlay.addClass('hidden');
                }
                
                // Append the view element to the container rather
                // than using the container for the view, otherwise
                // Backbone.View.remove() will remove the container
                // from the DOM and prevent us from using it as an
                // insertion point in the future.
                jContentOverlay.append(this.overlayView.el);
                
                this.overlayView.render();
            },
            
            overlayCleanup: function () {
                console.log('Entered overlayCleanup()');
                if (this.overlayView) {
                    console.log('overlayCleanup() removing view');
                    this.overlayView.remove();
                }
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
                
                console.log('nav_info received by overlay, isHidden=' + jContentOverlay.hasClass('hidden'));
                
                if (jContentOverlay.hasClass('hidden')) {
                    console.log('showing overlay');
                    this.render();
                    jContentOverlay.removeClass('hidden');
                }
                else {
                    console.log('hiding overlay');
                    jContentOverlay.addClass('hidden');
                }
            }
        });
        
        overlayMixin.OverlayView = OverlayView;
        
        return overlayMixin;
    }
);
