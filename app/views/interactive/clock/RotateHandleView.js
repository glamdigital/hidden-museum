/**
 * Created by ahaith on 22/10/2015.
 */
define([
            "backbone",
            "move",
            "victor",
            "hbs!app/templates/interactive/handle"
        ], function(
            Backbone,
            move,
            Victor,
            handleTemplate
        ){



    var HandleView = Backbone.View.extend({
        template: handleTemplate,

        initialize: function(params) {
            //listen to model changes and update angle
            this.onModelChange = params.onModelChange;
            this.image = params.image;
            this.model.set({
                angle: 0
            });
            this.listenTo(this.model, 'change', _.bind(function(){
                this.setAngle(this.model.attributes.angle);
            }, this));

        },

        serialize: function() {
            var out = {
                image: this.image
            };
            return out;
        },

        afterRender: function() {
            //determine pivot coordinates
            var $img = this.$el.find('img');
            $img.on('load', _.bind(function() {
                this.pivot = new Victor(
                    $img.offset().left + $img.width()/2,
                    $img.offset().top + $img.height()/2
                );
            }, this));
            //set angle based on model
            this.setAngle(this.model.attributes.angle);
        },

        setAngle: function(angle, duration) {
            duration = duration || 0;
            var $img = this.$el.find('img');
            move($img[0])
                .rotate(angle)
                .duration(duration)
                .end();

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


                this.model.set({angle: this.model.attributes.angle + angleChange});
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