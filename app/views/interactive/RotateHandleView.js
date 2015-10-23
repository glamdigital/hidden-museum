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
                handleWidth: 20,
                handleMinHeight: 0,
                handleMaxHeight: 80,
                angle: 0
            });
            //this.listenTo(this.model, 'change', _.bind(this.onModelChange, this));

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
                console.log("Pivot = ", this.pivot);
            }, this));
            //set angle based on model
            this.setAngle(this.model.attributes.angle);
        },

        setAngle: function(angle) {
            var $img = this.$el.find('img');
            move($img[0])
                .rotate(angle)
                .duration(0)
                .end();

            //console.log("Set angle to ", angle);
        },

        events: {
            "touchstart .clock-face": "handleTouchStart",
            "touchmove .clock-face": "handleTouchMove",
            "touchend .clock-face": "handleTouchEnd"
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
            var withinHeight = -touchLocalPos.y > this.model.attributes.handleMinHeight;
            withinHeight = withinHeight && touchLocalPos.y < this.model.attributes.handleMaxHeight;

            if(withinWidth && withinHeight) {
                this.touchPrevPos = new Victor(
                    touch.pageX,
                    touch.pageY
                );
                this.hasTouch = true;
                ev.stopPropagation();
                return true;
            } else {
                this.hasTouch = false;
                return false;
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

                //calculate how far we've moved perpendicular to the pivot
                var pivotToPrevTouch = this.touchPrevPos.clone().subtract(this.pivot);
                var pivotToTouch = touchPos.clone().subtract(this.pivot);


                var angleChange = pivotToTouch.horizontalAngleDeg() - pivotToPrevTouch.horizontalAngleDeg();

                //account for where angle flips from -180 to +180
                if (angleChange > 350) {
                    angleChange -= 360;
                }
                else if (angleChange < -350) {
                    angleChange += 350;
                }

                this.model.set({angle: this.model.attributes.angle + angleChange});

                this.setAngle(this.model.attributes.angle);


                this.touchPrevPos = touchPos;
                ev.stopPropagation();
                return true;
            }
            return false;


        },
        handleTouchEnd: function(ev) {
            //no longer handling touches
        },
    });

    return HandleView;

});