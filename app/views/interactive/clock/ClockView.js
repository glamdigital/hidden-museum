/**
 * Created by ahaith on 22/10/2015.
 */
define([
    "backbone",
    "app/views/interactive/RotateHandleView",
    "hbs!app/templates/interactive/clock"
    ], function(
    Backbone,
    RotateHandleView,
    clockTemplate
    ) {

    var ClockView = Backbone.View.extend({
        template: clockTemplate,

        initialize: function(params) {
            this.time = new Backbone.Model({
                time: 0,
                handleMinHeight: 50,
                handleWidth: 10,
            });
        },

        afterRender: function() {
            //create the handle views

            this.twentyFourHourClockView = new RotateHandleView({
                el: $('#24hr'),
                model: this.time,
                onModelChange : function() { console.log("angle changed"); },
                image: "img/minute_hand.png"
            });
            this.twentyFourHourClockView.render();
        }
    });
    return ClockView;

});