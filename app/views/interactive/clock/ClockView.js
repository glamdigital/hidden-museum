/**
 * Created by ahaith on 22/10/2015.
 */
define([
        "backbone",
        "app/views/interactive/clock/RotateHandleView",
        "app/views/interactive/clock/DigitalClockView",
        "moment",
        "hbs!app/templates/interactive/clock",
        "move",
    ], function(
        Backbone,
        RotateHandleView,
        DigitalClockView,
        moment,
        clockTemplate,
        move
    ) {

    TIME = moment();

    var ClockView = Backbone.View.extend({
        template: clockTemplate,

        initialize: function(params) {
            var time = moment().hours(0).minutes(0).seconds(0);
            this.model = new Backbone.Model({
                time: time,

                setTime: function() {
                    this.set({time:TIME});
                },
                //time to angle
                get24HrAngle_H: function() {
                    var totalHours = this.time.hours() + this.time.minutes()/60;
                    var totalRevolutions = totalHours/12;
                    return 360 * totalRevolutions;
                },
                get24HrAngle_M: function() {
                    var revs = ( this.time.minutes() / 60);
                    revs += this.time.hours();
                    return 360 * revs;
                },
                get10HrAngle: function() {
                    //one full revolution per day
                    var hours = this.time.hours() + this.time.minutes()/60;
                    var days = hours/24;
                    return days*360;
                },

                //angle to time
                from24HrAngle_H: function(angle) {
                    this.time.hours(0);
                    var hours = 12*angle/360;
                    this.time.hours( hours );
                    var minutes = 60* (hours%1);
                    this.time.minutes(minutes);
                    return this.time;
                },
                from24HrAngle_M: function(angle) {
                    this.time.hours(0);
                    return this.time.minutes( 60*angle/360 );
                },
                from10HrAngle: function(angle) {
                    var minutes = (angle/360)*24*60;
                    this.time.hours(0);
                    return this.time.minutes(minutes);
                }

            });

            $('.set-time').click(_.bind(function(ev) {
                this.model.setTime();
            }, this))
        },

        afterRender: function() {

            //model for minute hand
            this.twentyFourHourMinuteHandModel = new Backbone.Model({
                handleMinHeight: 120,
                handleWidth: 10,
            });
            //update time when this changes
            this.listenTo(this.twentyFourHourMinuteHandModel, 'force-change', _.bind(function(source) {
                var time = this.model.attributes.from24HrAngle_M(this.twentyFourHourMinuteHandModel.attributes.angle);
                this.model.set({time: time});
                this.model.trigger('change', this.twentyFourHourMinuteHandModel);
                //this.update10hrHand();
                //this.updateHourHand();
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
            this.listenTo(this.twentyFourHourHourHandModel, 'force-change', _.bind(function(source) {
                var time = this.model.attributes.from24HrAngle_H(this.twentyFourHourHourHandModel.attributes.angle);
                this.model.set({time: time});
                this.model.trigger('change', this.twentyFourHourHourHandModel);
                //update the other clocks
                //this.update10hrHand();
                //this.updateMinuteHand();
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
            this.listenTo(this.tenHourClockModel, 'force-change', _.bind(function() {
                var time = this.model.attributes.from10HrAngle(this.tenHourClockModel.attributes.angle);
                this.model.set({time: time});
                this.model.trigger('change', this.tenHourClockModel);
                //update other clocks
                //this.updateHourHand();
                //this.updateMinuteHand();

            }, this));
            //create view
            this.tenHourClockView = new RotateHandleView({
                el: $('#ten-hr'),
                model: this.tenHourClockModel,
                image: "img/hour_hand.png",
            });
            this.tenHourClockView.render();

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
                        if(this.twentyFourHourClockMinuteHandView.handleTouchMove(ev))
                        {
                            //unhandled event
                        }
                    }
                }
            }, this));

            this.listenTo(this.model, 'change', _.bind(function(source) {
                if(source !== this.twentyFourHourHourHandModel) {
                    this.updateHourHand();
                }
                if(source !== this.twentyFourHourMinuteHandModel) {
                    this.updateMinuteHand();
                }
                if(source !== this.tenHourClockModel) {
                    this.update10hrHand();
                }
            }, this));

            ///digital clock
            this.digitalClockView = new DigitalClockView({
                model: this.model,
                el: $('#digital-clock'),
            });
            this.digitalClockView.render();

        },

        updateMinuteHand: function() {
            var angle24hr_minutehand = this.model.attributes.get24HrAngle_M();
            this.twentyFourHourMinuteHandModel.set({angle: angle24hr_minutehand});
        },

        updateHourHand: function() {
            var angle24hr_hourhand = this.model.attributes.get24HrAngle_H();
            this.twentyFourHourHourHandModel.set({angle: angle24hr_hourhand });
        },

        update10hrHand: function() {
            var angle = this.model.attributes.get10HrAngle();
            this.tenHourClockModel.set({angle: angle});
        }


    });
    return ClockView;

});