/**
 * Created by ahaith on 22/10/2015.
 */
define([
            "backbone",
            "move",
            "victor",
            "hbs!app/templates/interactive/handle",
            "hbs!app/templates/interactive/canvasHandle"
        ], function(
            Backbone,
            move,
            Victor,
            handleTemplate,
            canvasHandleTemplate
        ){



    var HandleView = Backbone.View.extend({
        template: handleTemplate,
        template_canvas: canvasHandleTemplate,

        initialize: function(params) {
            //listen to model changes and update angle
            this.onModelChange = params.onModelChange;
            this.image = params.image;
            this.useCanvas = params.useCanvas;

            //use alternative template for canvas rendering
            if(this.useCanvas) {
                this.template = this.template_canvas;
            }
            this.model.set({
                angle: 0
            });
            this.listenTo(this.model, 'change', _.bind(function(){
                this.setAngle(this.model.attributes.angle);
            }, this));
            this.oneWay = !!params.oneWay;

        },

        serialize: function() {
            var out = {
                image: this.image
            };
            return out;
        },

        afterRender: function() {
            //determine pivot coordinates
            var $img = this.$el.find('.handle');
            
            
            if(this.useCanvas) {
                this.$canvas = $('canvas', this.$el);
                this.$canvas[0].width = this.$canvas.width();
                this.$canvas[0].height = this.$canvas.height();
                this.pivot = new Victor(
                    $img.offset().left + $img.width()/2,
                    $img.offset().top + $img.height()/2
                )
            } else {
                $img.on('load', _.bind(function() {
                    this.pivot = new Victor(
                        $img.offset().left + $img.width()/2,
                        $img.offset().top + $img.height()/2
                    );
                }, this));
            }
            
            //set correct sizes for canvases
            var $min24 = $('#twenty-four_min');
            $min24.height($min24.width());
            
            var $hr24 = $('#twenty-four_hour');
            $hr24.height($hr24.width());
            
            var $hr10 = $('#ten-hr');
            $hr10.height($hr10.width());
            
            _.defer(function () {
              _.delay(function () {
                  this.setAngle(this.model.attributes.angle);
              }.bind(this),500);
            }.bind(this));
        },

        setAngle: function(angle, duration) {
            duration = duration || 0;
            if(this.useCanvas) {
                //todo redraw
                var c = this.$canvas[0];
                var ctx = c.getContext('2d');
                ctx.clearRect(0, 0, 1000, 1000);
                var $img = $('.handle-img', this.$el);
                
                ctx.setTransform(1,0,0,1,0,0); //identity
                
                
                ctx.translate(c.width/2, c.height/2)
                ctx.rotate(angle * Math.PI/180);
                ctx.scale(this.model.attributes.scale, this.model.attributes.scale);
                ctx.translate(-$img.width()/2, -$img.height()/2 - this.model.attributes.vOffset);
                
                ctx.drawImage($img[0], 0, 0);
                
            } else {
                var $img = this.$el.find('img');
                move($img[0])
                .rotate(angle)
                .duration(duration)
                .end();
            }

        },

        events: {
            "touchstart img": "handleTouchStart",
            "touchmove img": "handleTouchMove",
            "touchend img": "handleTouchEnd"
        },

        handleTouchStart: function(ev) {
            //just consider touch 0
            //This may behave unpredictably for multiple touches
            var touch = ev.originalEvent.changedTouches[0];

            //Calculate position of the touch relative to the image's own frame of reference
            //pos within element
            var touchLocalPos = new Victor(
                touch.clientX,
                touch.clientY
            );
            //pos relative to centre of element
            touchLocalPos.subtract(this.pivot);
            //pos relative to rotation
            touchLocalPos.rotateDeg(-this.model.attributes.angle);

            var withinWidth = Math.abs(touchLocalPos.x) < this.model.attributes.handleWidth;
            var withinHeight
            if(this.model.attributes.handleMinHeight) {
                //single-sided hand
                withinHeight = -touchLocalPos.y > 0;
                withinHeight = withinHeight && -touchLocalPos.y < this.model.attributes.handleMinHeight;
            } else {
                //double-sided handle, use full height of image
                withinHeight = true;
            }

            if(withinWidth && withinHeight) {
                this.touchPrevPos = new Victor(
                    touch.pageX,
                    touch.pageY
                );
                this.hasTouch = true;
                var pivotToTouch = this.touchPrevPos.clone().subtract(this.pivot);
                this.startAngle =  pivotToTouch.horizontalAngleDeg() - pivotToTouch.horizontalAngleDeg();
                ev.stopPropagation();
                return false;
            } else {
                this.hasTouch = false;
                return true;
            }

        },

        handleTouchMove: function(ev) {
            //multitouch will cause problems, but dealing with this is beyond scope for now
            if(this.hasTouch) {

                //Rotate by the absolute distance moved, pick direction based on
                touchPos = new Victor(
                    ev.originalEvent.changedTouches[0].pageX,
                    ev.originalEvent.changedTouches[0].pageY
                );

                var delta = touchPos.clone().subtract(this.touchPrevPos);

                //calculate how far we've moved around to the pivot
                var pivotToPrevTouch = this.touchPrevPos.clone().subtract(this.pivot);
                var pivotToTouch = touchPos.clone().subtract(this.pivot);
                var angleChange = pivotToTouch.horizontalAngleDeg() - pivotToPrevTouch.horizontalAngleDeg();

                //account for where angle flips from -180 to +180
                if (angleChange > 180) {
                    angleChange -= 360;
                }
                else if (angleChange < -180) {
                    angleChange += 360;
                }

                if(angleChange < 0 && this.oneWay) {
                    //don't update the angle change if this is a one-way ratchet.
                } else {
                    this.model.set({angle: this.model.attributes.angle + angleChange});
                }
                
                this.model.trigger('force-change', this.model);

                this.setAngle(this.model.attributes.angle);


                this.touchPrevPos = touchPos;
                ev.stopPropagation();
                return false;
            } else {
                return true;
            }


        },
        handleTouchEnd: function(ev) {
            //no longer handling touches
        },
    });

    return HandleView;

});
