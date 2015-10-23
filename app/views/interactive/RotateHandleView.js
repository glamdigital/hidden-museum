/**
 * Created by ahaith on 22/10/2015.
 */
define(["backbone", "move", "victor", "hbs!app/templates/interactive/handle"], function(Backbone, move, Victor, handleTemplate){



    var HandleView = Backbone.View.extend({
        template: handleTemplate,

        initialize: function(params) {
            //listen to model changes and update angle
            this.onModelChange = params.onModelChange;
            this.image = params.image;
            this.model.set({angle: 0});
            //this.listenTo(this.model, 'change', _.bind(this.onModelChange, this));

        },

        serialize: function() {
            var out = {
                image: this.image
            };
            return out;
        },

        afterRender: function() {
            //set angle based on model
            this.setAngle(this.model.attributes.angle);
            var $img = this.$el.find('img');
            $img.on('load', _.bind(function() {
                this.pivot = new Victor(
                    $img.offset().left + $img.width()/2,
                    $img.offset().top + $img.height()/2
                );
                console.log("Pivot = ", this.pivot);
            }, this));
        },

        setAngle: function(angle) {
            move('img')
                .rotate(angle)
                .duration(0)
                .end();

            //console.log("Set angle to ", angle);
        },

        events: {
            "touchstart img": "handleTouchStart",
            "touchmove img": "handleTouchMove",
            "touchend img": "handleTouchEnd"
        },

        handleTouchStart: function(ev) {
            this.touchPrevPos = new Victor(
                 ev.originalEvent.changedTouches[0].pageX,
                ev.originalEvent.changedTouches[0].pageY
            );
        },


        handleTouchMove: function(ev) {
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
            if(angleChange > 350) {
                angleChange -= 360;
            }
            else if(angleChange < -350) {
                angleChange += 350;
            }

            this.model.set({angle: this.model.attributes.angle + angleChange});

            this.setAngle(this.model.attributes.angle);


            this.touchPrevPos = touchPos;


        },
        handleTouchEnd: function(ev) {
            //no longer handling touches
        },
    });

    return HandleView;

});