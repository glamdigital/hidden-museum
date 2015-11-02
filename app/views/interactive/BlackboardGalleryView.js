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
            
            explanationComponents: [],
            index: 0,
            total: 0,
            
            events: {
                'click .ui .gallery .blackboard': 'onBlackboard',
                'click .ui .controls .previous':  'onPrevious',
                'click .ui .controls .next':      'onNext'
            },
            
            onBlackboard: function (event) {
                console.log('onBlackboard() toggling zoom');
                this.isZoomed = !this.isZoomed;
                Backbone.trigger('blackboard_gallery_render');
            },
            
            onPrevious: function (event) {
                // console.log('onPrevious() current index = ' + this.index);
                
                if (this.index > 0) {
                    this.index--;
                    Backbone.trigger('blackboard_gallery_render');
                }
            },
            
            onNext: function (event) {
                // console.log('onNext() current index = ' + this.index);
                
                if (this.index < this.total - 1) {
                    this.index++;
                    Backbone.trigger('blackboard_gallery_render');
                }
            },
            
            serialize: function () {
                
            },
            
            initialize: function (params) {
                this.explanationComponents = [];
                
                this.index    = 0;
                this.item     = params.item;
                this.isZoomed = false;
                
                this.overlayInitialize({ displayOnArrival: true });
                this.overlaySetTemplate(interactiveInnerTemplate, this.model.toJSON());
                
                this.listenTo(Backbone, 'blackboard_gallery_render', this.renderGallery);
            },
            
            renderProgress: function () {
                var jProgress = $('.ui .controls .progress');
                var jIndex = jProgress.find('.index').first();
                var jTotal = jProgress.find('.total').first();
                
                // We count from zero but users don't so display the index with +1
                var display = {
                    index: this.total > 0 ? this.index + 1 : 0,
                    total: this.total > 0 ? this.total : 0
                };
                
                jIndex.html(display.index);
                jTotal.html(display.total);
            },
            
            renderExplanation: function () {
                var jGallery     = $('.ui .gallery');
                var jBlackboard  = jGallery.find('.blackboard');
                var jZoomed      = jGallery.find('.zoom-view .blackboard');
                var jName        = jGallery.find('.name');
                var jRoles       = jGallery.find('.roles');
                var jDescription = jGallery.find('.descriptive-text');
                
                var explanation  = this.explanationComponents[this.index];
                
                if (explanation.imageRoot) {
                    // NB Slightly dirty - all blackboards (including zoomed) get set, then we fix up the zoomed ones.
                    jBlackboard.attr('src', 'img/objects/blackboard/gallery/' + explanation.imageRoot + '.jpg');
                    jZoomed.attr('src', 'img/objects/blackboard/gallery/' + explanation.imageRoot + '_zoomed.jpg');
                }
                
                jName.empty();
                jName.append(explanation.jAuthor.clone());
                
                jRoles.empty();
                jRoles.append(explanation.jRoles.clone());
                
                jDescription.empty();
                jDescription.append(explanation.jDescription.clone());
                
                var jZoomView = $('.ui .gallery .zoom-view');
                
                if (this.isZoomed) {
                    jZoomView.removeClass('hidden');
                    $('.ui .gallery .scroll-container').addClass('hidden');
                }
                else {
                    jZoomView.addClass('hidden');
                    $('.ui .gallery .scroll-container').removeClass('hidden');
                }
            },
            
            renderGallery: function () {
                this.renderExplanation();
                this.renderProgress();
            },
            
            afterRender: function () {
                var self = this;
                
                var jExplanations = $('.explanations .explanation');
                
                jExplanations.each(function (index, element) {
                    var i = 0;
                    var imageRoot = null;
                    
                    // Extract a class other than 'explanation', which we assume can be
                    // used as the corresponding blackboard image name with .jpg
                    // appended to it in renderExplanation().
                    for (i = 0; i < this.classList.length; i++) {
                        if (this.classList[i] !== 'explanation') {
                            imageRoot = this.classList[i];
                            break;
                        }
                    }
                    
                    self.explanationComponents.push({
                        imageRoot:    imageRoot,
                        jAuthor:      $(this).find('.author').first().clone(),
                        jRoles:       $(this).find('.role').clone(),
                        jDescription: $(this).find('.description').first().clone()
                    });
                });
                
                this.total = this.explanationComponents.length;
                
                this.renderGallery();
            },
            
            cleanup: function () {
                this.overlayCleanup();
            },
        });
        
        _.extend(BlackboardGalleryView.prototype, overlayMixin);
        
        return BlackboardGalleryView;
    }
);
