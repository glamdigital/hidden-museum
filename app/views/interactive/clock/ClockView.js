/**
 * Created by ahaith on 22/10/2015.
 */
define([
        "backbone",
        "app/views/interactive/RotateHandleView",
        "hbs!app/templates/interactive/clock",
        "move",
    ], function(
        Backbone,
        RotateHandleView,
        clockTemplate,
        move
    ) {

    var ClockView = Backbone.View.extend({
        template: clockTemplate,

        initialize: function(params) {


        },

        afterRender: function() {
            //create the handle views

            $hourHandEl = $('#24hr_hour');
            this.twentyFourHourClockMinuteHandView = new RotateHandleView({
                el: $('#24hr_min'),
                model: new Backbone.Model({
                    handleMinHeight: 50,
                    handleWidth: 10
                }),
                image: "img/minute_hand.png"
            });
            this.twentyFourHourClockMinuteHandView.render();

            this.twentyFourHourClockHourHandView = new RotateHandleView({
                el: $hourHandEl,
                model: new Backbone.Model({
                    handleMinHeight: 50,
                    handleWidth: 10,
                }),
                image: "img/hour_hand.png"
            });
            this.twentyFourHourClockHourHandView.render();

            //if a touch event bubbles up to our own element, pass it on to the minute hand view, which is below the hour hand view
            this.$el.on('touchstart', _.bind(function(ev){
                if(!this.twentyFourHourClockMinuteHandView.handleTouchStart(ev))
                {
                    this.twentyFourHourClockHourHandView.handleTouchStart(ev);
                }
            }, this));
            this.$el.on('touchmove', _.bind(function(ev){
                if(!this.twentyFourHourClockMinuteHandView.handleTouchMove(ev))
                {
                    this.twentyFourHourClockHourHandView.handleTouchMove(ev);
                }
                console.log('forwarded touch event to minute hand');
            }, this));

        }


    });
    return ClockView;

});