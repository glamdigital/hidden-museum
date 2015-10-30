/**
 * Created by ahaith on 26/10/2015.
 */
define([
        'backbone',
        'hbs!app/templates/interactive/digitalClock'
            ], function(
        Backbone,
        digitalClockTemplate
    ) {

   var DigitalClockView = Backbone.View.extend( {
       template: digitalClockTemplate,

       initialize: function() {
           //this.listenTo(this.model, 'change', this.render);

           //listen for touch start/end events anywhere.
           //$('body').on('touchstart', _.bind(this.onTouchStart,this));
           //$('body').on('touchEnd', _.bind(this.onTouchEnd,this));
       },

       //tell layout manager not to use RequestAnimationFrame to manage rendering.
       // the sphere uses that, which causes an issue here.
       useRAF : false,

       serialize: function() {
           var hours = this.model.attributes.time.hours().toString();
           //ensure leading zero
           if(hours.length<2) { hours = '0' + hours; }

           var minutes = this.model.attributes.time.minutes().toString();
           if(minutes.length<2) { minutes = '0' + minutes; }
           var out = {
               hours: hours,
               minutes: minutes
           };
           return out;
       },

       render: function() {
           console.log("RENDER digital clock");
       }

       //
       //events: {
       //    //"click .increase-time": "increaseTime",
       //    //"click .decrease-time": "decreaseTime"
       //},
       //
       //increaseTime: function() {
       //    this.model.attributes.time.add(1, 'minute');
       //    this.model.trigger('change', this);
       //},
       //
       //decreaseTime: function() {
       //    this.model.attributes.time.subtract(1, 'minute');
       //    this.model.trigger('change', this);
       //},
       //
       //onTouchStart: function(ev) {
       //     //check if we are on the increase button
       //
       //    //check if we are on the
       //},
       //
       //cleanup: function() {
       //    $('.digital-clock').off('touchstart');
       //    $('.digital-clock').off('touchend');
       //}
   });

    return DigitalClockView;
});