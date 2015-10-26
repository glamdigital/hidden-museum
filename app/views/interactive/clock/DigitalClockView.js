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
           this.listenTo(this.model, 'change', this.render);
       },

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

       events: {
           "click .increase-time": "increaseTime",
           "click .decrease-time": "decreaseTime"
       },

       increaseTime: function() {
           this.model.attributes.time.add(1, 'minute');
           this.model.trigger('change', this.model);
       },
       decreaseTime: function() {
           this.model.attributes.time.subtract(1, 'minute');
           this.model.trigger('change', this.model);
       }
   });

    return DigitalClockView;
});