define([
        'backbone',
        'underscore',
        'hbs!app/templates/overlay_base',
        'hbs!app/templates/overlay_default_inner'
    ],
    
    function (Backbone, _, baseTemplate, defaultInnerTemplate) {
        var overlayMixin = {
            overlaySetTemplate: function (template, templateContext) {
                this.innerView.template        = template;
                this.innerView.templateContext = templateContext;
                
                this.innerView.render();
            },
            
            overlayInitialize: function (config) {
                // Create the views
                this.overlayView = new this.OverlayView();
                this.innerView   = new this.InnerView();
                
                // The 'rootContext' is the context the mixin gets grafted onto.
                this.overlayView.rootContext = this;
                
                var jContentOverlay = $('#content-overlay');
                
                // Ensure the content overlay is hidden to begin with.
                if (!jContentOverlay.hasClass('hidden')) {
                    jContentOverlay.addClass('hidden');
                }
                
                // Display the overlay once its rendered if the config requires it.
                if (config && config.displayOnArrival) {
                    this.innerView.displayOnArrival = true;
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
                //console.log('Entered overlayCleanup()');
                
                if (this.innerView) {
                    //console.log('overlayCleanup() removing inner view');
                    this.innerView.remove();
                }
                
                if (this.overlayView) {
                    //console.log('overlayCleanup() removing overlay view');
                    this.overlayView.remove();
                }
            }
        };
        
        var OverlayView = Backbone.View.extend({
            template: baseTemplate,
            
            serialize: function() {
                return {};
            },
            
            initialize: function (params) {
                this.listenTo(Backbone, 'nav_info', this.toggleVisibility);
            },
            
            afterRender: function () {
                var jInner = $('#content-overlay .inner');
                
                jInner.append(this.rootContext.innerView.el);
                
                this.rootContext.innerView.render();
            },
            
            events: {
                'click .lightbox': 'toggleVisibility'
            },
            
            toggleVisibility: function (event) {
                if (event && (event.target.localName !== 'a') && (event.target.localName !== 'i')) {
                    event.preventDefault();
                }
                
                var jContentOverlay = $('#content-overlay');
                
                //console.log('nav_info received by overlay, isHidden=' + jContentOverlay.hasClass('hidden'));
                
                if (jContentOverlay.hasClass('hidden')) {
                    //console.log('showing overlay');
                    this.render();
                    jContentOverlay.removeClass('hidden');
                }
                else {
                    //console.log('hiding overlay');
                    jContentOverlay.addClass('hidden');
                    this.trigger("overlayDismissed");                    
                }
            },
        });
        
        var InnerView = Backbone.View.extend({
            template: defaultInnerTemplate,
            
            displayOnArrival: false,
            
            templateContext: {},
            
            afterRender: function () {
                if (this.displayOnArrival) {
                    $('#content-overlay').removeClass('hidden');
                    this.displayOnArrival = false;
                }
            },
            
            serialize: function() {
                return this.templateContext;
            }
        });
        
        overlayMixin.OverlayView = OverlayView;
        overlayMixin.InnerView   = InnerView;
        
        return overlayMixin;
    }
);
