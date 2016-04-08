define([
        'backbone',
        'underscore',
        'owlcarousel',
        'panzoom',
        'hbs!app/templates/interactive/blackboard_gallery',
        'app/collections/BlackboardsCollection',
        'app/mixins/overlay',
        'hbs!app/templates/overlay_interactive_inner'
    ],function (
      Backbone,
      _,
      owlCarousel,
      panzoom,
      blackboardGalleryTemplate,
      BlackboardsCollection,
      overlayMixin,
      interactiveInnerTemplate
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
                this.overlayInitialize({ displayOnArrival: true });
                this.overlaySetTemplate(interactiveInnerTemplate, this.model.toJSON());
            },

            serialize: function () {
              var data = {};
              data.blackboards = this.blackboards.toJSON();
              return data;
            },

            afterRender: function () {
                this.blackboards.each(function (blackboard, index) {
                  var img = $(".thumbnail img.blackboard")[index]; // Get my img elem
                  var pic_real_width, pic_real_height;
                  $("<img/>") // Make in memory copy of image to avoid css issues
                      .attr("src", $(img).attr("src"))
                      .load(function() {
                          pic_real_width = this.width;   // Note: $(this).width() will not
                          pic_real_height = this.height; // work for in memory images.
                          if (pic_real_width>pic_real_height) {
                            $("#blackboard-gallery-top-padding-"+index).addClass("landscape");
                          }
                      });
                  
                });
                
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
                    $(".ui .gallery .zoom-view").panzoom({contain:'invert'});
                    $(".back-link").click(function (ev) {
                      this.onBlackboard();
                      ev.preventDefault();
                    }.bind(this));
                }
                else {
                    $('.ui .gallery .zoom-view').addClass('hidden');
                    $('.ui .gallery .close').addClass('hidden');
                    $('.ui .gallery .scroll-container').removeClass('hidden');
                    $('.ui .gallery .thumbnail').removeClass('hidden');
                    $(".ui .gallery .zoom-view").panzoom("destroy");
                    $(".back-link").off("click");
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
