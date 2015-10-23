/**
 * Created by ahaith on 22/10/2015.
 */
define([
        "backbone",
        "app/views/interactive/RotateHandleView",
        "moment",
        "hbs!app/templates/interactive/clock",
        "move",
    ], function(
        Backbone,
        RotateHandleView,
        moment,
        clockTemplate,
        move
    ) {

    var ClockView = Backbone.View.extend({
        template: clockTemplate,

        initialize: function(params) {
            var time = moment();
            this.model = new Backbone.Model({
                time: time,

                //time to angle
                get24HrAngle_H: function() {
                    return 360 * this.time.hours() + this.time.minutes()/60;
                },
                get24HrAngle_M: function() {
                    return 360 * ( 12* this.time.hours() + this.time.minutes());
                },
                get10HrAngle: function() {
                    //
                },

                //angle to time
                from24HrAngle_H: function(angle) {
                    this.time.hours( 12*angle/360 );
                },
                from24HrAngle_M: function(angle) {
                    this.time.minutes( 60*angle/360 );
                },
                from10HrAngle: function(angle) {
                    //
                }
            });
        },

        afterRender: function() {

            //model for minute hand
            this.twentyFourHourMinuteHandModel = new Backbone.Model({
                handleMinHeight: 120,
                handleWidth: 10,
            });
            //update time when this changes
            this.listenTo(this.twentyFourHourMinuteHandModel, 'change', _.bind(function() {
                this.model.attributes.from24HrAngle_M(this.twentyFourHourMinuteHandModel.attributes.angle);
            }, this));
            //create view;
            this.twentyFourHourClockMinuteHandView = new RotateHandleView({
                el: $('#twenty-four_min'),
                model: this.twentyFourHourMinuteHandModel,
                image: "img/minute_hand.png"
            });
            this.twentyFourHourClockMinuteHandView.render();


            //model for hour hand
            this.twentyFourHourHourHandModel = new Backbone.Model({
                handleMinHeight: 70,
                handleWidth: 10,
            });
            //update time when this changes
            this.listenTo(this.twentyFourHourHourHandModel, 'change', _.bind(function() {
                this.model.attributes.from24HrAngle_H(this.twentyFourHourHourHandModel.attributes.angle);
            }, this));
            //create view
            this.twentyFourHourClockHourHandView = new RotateHandleView({
                el: $('#twenty-four_hour'),
                model: this.twentyFourHourHourHandModel,
                image: "img/hour_hand.png",
            });
            this.twentyFourHourClockHourHandView.render();

            //model for ten hour clock hand
            this.tenHourClockModel = new Backbone.Model({
                handleMinHeight: 90,
                handleWidth: 10,
            });
            //update time when this changes
            this.listenTo(this.tenHourClockModel, 'change', _.bind(function() {
                this.model.attributes.from10HrAngle(this.tenHourClockModel.attributes.angle);
            }, this));
            //create view
            this.tenHourClockView = new RotateHandleView({
                el: $('#ten-hr'),
                model: this.tenHourClockModel,
                image: "img/hour_hand.png",
            });
            this.tenHourClockView.render();

            //
            ////update clocks based on time changes
            //this.listenTo(this.model, _.bind(function() {
            //    this.twentyFourHourHourHandModel.set({angle: this.model.get24HrAngle_H()});
            //    this.twentyFourHourMinuteHandModel.set({angle: this.model.get24HrAngle_M()});
            //    this.tenHourClockModel.set({angle: this.model.get10HrAngle()});
            //}, this));
            //
            //
            //listen for touch events and propagate to each clock hand in turn
            this.$el.on('touchstart', _.bind(function(ev) {
                if(this.tenHourClockView.handleTouchStart(ev)) {
                    if(this.twentyFourHourClockHourHandView.handleTouchStart(ev)) {
                        if(this.twentyFourHourClockMinuteHandView.handleTouchStart(ev))
                        {
                            //unhandled touch event
                        }
                    }
                }
            },this));

            this.$el.on('touchmove', _.bind(function(ev) {
                if(this.tenHourClockView.handleTouchMove(ev)) {
                    if(this.twentyFourHourClockHourHandView.handleTouchMove(ev)) {
                        if(this.twentyFourHourClockMinuteHandView.handleTouchMove(ev)) {
                            //unhandled event
                        }
                    }
                }
            }, this))

        }


    });
    return ClockView;

});