/**
 * Created by ahaith on 26/10/2015.
 */
define([
        'backbone',
        'app/media',
        'moment',
        'hbs!app/templates/interactive/digitalClock'
            ], function(
        Backbone,
        mediaUtil,
        moment,
        digitalClockTemplate
    ) {

   MINSMULTIPLIER = 2;
   
   var DigitalClockView = Backbone.View.extend( {
       template: digitalClockTemplate,
       

       initialize: function() {
           //this.listenTo(this.model, 'change', this.render);

           //listen for touch start/end events anywhere.
           this.soundMinutes = 0;
           this.numTouches = 0;
           
           this.intervalTime = null;
           this.touchStopped = false;
           
           this.decreaseInterval = null;
           this.increaseInterval = null;
           this.updateTime = _.bind(this._updateTime, this);
           
           //sounds
           this.clockMinutesSound = mediaUtil.createAudioObj('audio/armillary/clock-minutes.mp3');
       },

       afterRender: function() {
           if(!this.listenersInitialised) {
               $('#digital-clock').on('touchstart', _.bind(this.onTouchStart, this));
               $('#digital-clock').on('touchend', _.bind(this.onTouchEnd, this));
               $('#digital-clock').on('touchcancel', _.bind(this.onTouchEnd, this));
               this.listenersInitialised = true;
           }
       },

       //tell layout manager not to use RequestAnimationFrame to manage rendering.
       // the sphere uses that, which causes an issue here.
       useRAF : false,

       serialize: function() {


           var out = {
               time: this.model.attributes.time.format("HH:mm"),
           };
           return out;
       },

       playClockSounds: function () {
         if (Math.abs(this.soundMinutes - this.model.attributes.time.minutes()) >= 5 ) {
           this.clockMinutesSound.setTime(0);
           this.clockMinutesSound.play();
           this.soundMinutes = this.model.attributes.time.minutes();
         }
       },

       _updateTime: function() {
          $('.digital-time').html(this.model.attributes.time.format("HH:mm"));
          this.playClockSounds();
       },

       events: {
           "click .increase-time": "increaseTime",
           "click .decrease-time": "decreaseTime"
       },

       getTimeDiff: function () {
         var nowTime = moment();
         var diffDigitalMillisecs = 60;
         
         if  (this.touchStopped) {
           // getTimeDiff is executed once more after the onTouchEnd event because of the intervalTime.
           // In this execution the intervalTime is set to null so that the next time a (+-) button is pressed
           // we get a new intervalTime. Otherwise the difference is calculated between the time of this touch and the previous touch
           this.touchStopped = false;
           this.intervalTime = null;
         } else {
           if (this.intervalTime != null) {
             diffDigitalMillisecs = MINSMULTIPLIER * ( nowTime.diff(this.intervalTime, "milliseconds"));
           }
           this.intervalTime = nowTime;
         }
         return (diffDigitalMillisecs);
       },
       
       increaseTime: function() {
           var addedDigitalSecs = this.getTimeDiff();
           this.model.attributes.time.add(addedDigitalSecs, 'seconds');
           this.model.trigger('change', this);
           this.playClockSounds();
       },

       decreaseTime: function() {
           var addedDigitalSecs = this.getTimeDiff();
           this.model.attributes.time.subtract(addedDigitalSecs, 'seconds');
           this.model.trigger('change', this);
           this.playClockSounds();
       },

       onTouchStart: function(ev) {
            var target = ev.originalEvent.changedTouches[0].target;
            //check if we are on the increase button
            if( target == $('.increase-time')[0])
            {
                if(this.increaseInterval == null) {
                    this.increaseInterval = setInterval(_.bind(this.increaseTime, this), 10);
                }
                clearInterval(this.decreaseInterval);
                this.decreaseInterval = null;
            }
            else if(target == $('.decrease-time')[0])
            {
                if(this.decreaseInterval == null) {
                    this.decreaseInterval = setInterval(_.bind(this.decreaseTime, this), 10);
                }
                clearInterval(this.increaseInterval);
                this.increaseInterval = null;
            }
           //check if we are on the decrease button
           this.numTouches++;
       },

       onTouchEnd: function(ev) {
           this.increasing = this.decreasing = false;
           this.numTouches--;

           this.touchStopped = true;
           clearInterval(this.increaseInterval);
           this.increaseInterval = null;
           clearInterval(this.decreaseInterval);
           this.decreaseInterval = null;
       },

       cleanup: function() {
           $('#digital-clock').off('touchstart');
           $('#digital-clock').off('touchend');
           this.clockMinutesSound.cleanup();
       }
   });

    return DigitalClockView;
});
