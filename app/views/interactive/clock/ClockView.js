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
            var time = moment().hours(0).minutes(0).seconds(0);
            this.model = new Backbone.Model({
                time: time,

                //time to angle
                get24HrAngle_H: function() {
                    //console.log(this.time.format("HH:mm "), this.time.hours(), " hours. ", this.time.minutes(), " mins");
                    var totalHours = this.time.hours() + this.time.minutes()/60;
                    //console.log(totalHours);
                    var totalRevolutions = totalHours/12;
                    return 360 * totalRevolutions;
                },
                get24HrAngle_M: function() {
                    return 360 * ( 12* this.time.hours() + this.time.minutes());
                },
                get10HrAngle: function() {
                    //
                },

                //angle to time
                from24HrAngle_H: function(angle) {
                    return this.time.hours( 12*angle/360 );
                },
                from24HrAngle_M: function(angle) {
                    this.time.hours(0);
                    return this.time.minutes( 60*angle/360 );
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
            this.listenTo(this.twentyFourHourMinuteHandModel, 'change', _.throttle(_.bind(function() {
                var time = this.model.attributes.from24HrAngle_M(this.twentyFourHourMinuteHandModel.attributes.angle);
                this.model.set({time: time});
                this.model.trigger('change', this.model);
            }, this), 10));
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
            //this.listenTo(this.twentyFourHourHourHandModel, 'change', _.bind(function() {
            //    this.model.attributes.from24HrAngle_H(this.twentyFourHourHourHandModel.attributes.angle);
            //}, this));
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
            this.listenTo(this.model, 'change', _.bind(function() {
                var angle24hr_hourhand = this.model.attributes.get24HrAngle_H();
                this.twentyFourHourHourHandModel.set({angle: angle24hr_hourhand });
                //this.twentyFourHourMinuteHandModel.set({angle: this.model.attributes.get24HrAngle_M()});
                //this.tenHourClockModel.set({angle: this.model.attributes.get10HrAngle()});
            }, this));


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