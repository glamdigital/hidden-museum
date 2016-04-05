define([
        'backbone',
        'underscore',
        'owlcarousel',
        'panzoom',
        'hbs!app/templates/interactive/blackboard_gallery',
        'app/collections/BlackboardsCollection',
        'app/mixins/overlay',
    ],function (
      Backbone,
      _,
      owlCarousel,
      panzoom,
      blackboardGalleryTemplate,
      BlackboardsCollection,
      overlayMixin
    ) {
        var BlackboardGalleryView = Backbone.View.extend({
            template: blackboardGalleryTemplate,

            initialize: function (params) {
                this.isZoomed = false;
                
                this.blackboards = new  BlackboardsCollection();
                this.blackboards.fetch({
                  success: function() {
                    this.render();
                  }.bind(this)
                });
            },

            serialize: function () {
              var data = {};
              data.blackboards = this.blackboards.toJSON();
              return data;
            },

            afterRender: function () {
                
                $('.blackboard-gallery').owlCarousel({
                  center: true,
                  items:1,
                  loop:false,
                  dots:true,
                });
            },
            
            events: {
                'click .ui .gallery .close': 'onBlackboard',
                'click .ui .gallery .thumbnail': 'onBlackboard',
            },
            
            onBlackboard: function (event) {
                this.isZoomed = !this.isZoomed;
                if (this.isZoomed) {
                    $('.ui .gallery .zoom-view').removeClass('hidden');
                    $('.ui .gallery .close').removeClass('hidden');
                    $('.ui .gallery .scroll-container').addClass('hidden');
                    $('.ui .gallery .thumbnail').addClass('hidden');
                    $(".ui .gallery .zoom-view").panzoom();
                }
                else {
                    $('.ui .gallery .zoom-view').addClass('hidden');
                    $('.ui .gallery .close').addClass('hidden');
                    $('.ui .gallery .scroll-container').removeClass('hidden');
                    $('.ui .gallery .thumbnail').removeClass('hidden');
                    $(".ui .gallery .zoom-view").panzoom("destroy");
                }
            },
            
            cleanup: function () {
                this.overlayCleanup();
            }
        });
        
        _.extend(BlackboardGalleryView.prototype, overlayMixin);
        
        return BlackboardGalleryView;
    }
);
