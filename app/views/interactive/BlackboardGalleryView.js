define([
        'backbone',
        'underscore',
        'owlcarousel',
        'panzoom',
        'hbs!app/templates/interactive/blackboard_gallery',
        'app/collections/BlackboardsCollection',
        'app/mixins/overlay',
        'app/media',
        'hbs!app/templates/overlay_interactive_inner'
    ],function (
      Backbone,
      _,
      owlCarousel,
      panzoom,
      blackboardGalleryTemplate,
      BlackboardsCollection,
      overlayMixin,
      mediaUtil,
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
                
                //sounds
                this.chalkSound = mediaUtil.createAudioObj('audio/blackboard_gallery/chalk.mp3');
                this.shortChalkSound = mediaUtil.createAudioObj('audio/blackboard_gallery/short_chalk.mp3');
                this.sentGAFinish = false;
                if (window.ga) {
                  window.ga.trackEvent('Interactive', 'Start', this.model.get("title"))
                }
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
                  onDrag: function (ev,ev2,ev3) {
                    this.shortChalkSound.setTime(0);
                    this.shortChalkSound.play();
                    if (window.ga) {
                      if ( (!this.sentGAFinish) && ev.item.count - ev.item.index == 2) {
                        this.sentGAFinish = true;
                        window.ga.trackEvent('Interactive', 'Finish', this.model.get("title"))
                      }
                    }
                  }.bind(this),
                });
                
                var scrollContainerHeight = $('.content').height() - $('.thumbnail').height() - $('.owl-dots').height();
                if($(window).width() >= 700) { scrollContainerHeight -= 20; }
                
                $('.scroll-container').height(scrollContainerHeight + 'px');
                $('.owl-dot span').css('margin', '3px');
                
            },
            
            events: {
                'click .ui .gallery .close': 'onBlackboard',
                'click .ui .gallery .thumbnail': 'onBlackboard',
            },
            
            onBlackboard: function (event) {
                this.chalkSound.setTime(0);
                this.chalkSound.play();
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
              this.chalkSound.cleanup();
              this.shortChalkSound.cleanup();
              this.overlayCleanup();
            }
        });
        
        _.extend(BlackboardGalleryView.prototype, overlayMixin);
        
        return BlackboardGalleryView;
    }
);
