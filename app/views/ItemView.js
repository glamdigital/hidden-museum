define(["backbone", "underscore", "hbs!app/templates/item", "app/logging", "app/floor_tracking",
        "app/views/AudioControlsView"],
    function(Backbone, _, itemTemplate, Logging, FloorTracking,
             AudioControlsView) {

  var ItemView = Backbone.View.extend({

    template: itemTemplate,

    serialize: function() {
      var output = this.item.toJSON();

      output.nextURL = this.nextURL;
      output.trailTitle = this.trail.attributes.title;
      output.topicTitle = this.topic.attributes.title;
      return output;
    },

    initialize: function(params) {
      this.item = params.item;
      this.nextURL = params.nextURL;
      this.trail = params.trail;
      this.topic = params.topic;
      //listen for events
      this.eventId = 'beaconRange:' + this.item.attributes.beaconMajor;
      this.listenTo(Backbone, this.eventId, this.didRangeBeacon);
      Logging.logToDom("Listening for event: " + this.eventId);
      this.foundAtInit = params.found;
      this.headerView = params.headerView;
    },

    afterRender: function() {
        if (this.item.attributes.audio) {
            this.audioControlsView = new AudioControlsView({el: $('.audio-controls', this.el),
                                                            audio: this.item.attributes.audio,
                                                            caption: 'About this item'});
            this.audioControlsView.render();
        }

        if(this.foundAtInit) {
          this.findObject();
        }

    },

    didRangeBeacon: function(data) {
        Logging.logToDom("View heard about ranged beacon!");
      switch(data.proximity) {
        case "ProximityImmediate":
          //update proximity indicator
          $('.proximity-indicator').removeClass('near far').addClass('immediate').html('Immediate');
          this.findObject();
          break;
        case "ProximityNear":
          //update proximity indicator
          $('.proximity-indicator').removeClass('immediate far').addClass('near').html('Near');
          break;
        case "ProximityFar":
          //update proximity indicator
          $('.proximity-indicator').removeClass('immediate near far').html('Scanning...');
          break;
      }
    },

    findObject: function() {
      $('.search-item').hide();
      $('.found-item').show().css('display', 'inline-block');
      $('.hint-container').hide();

      //unsubscribe from further beacon events
      this.stopListening(Backbone, this.eventId);
      this.item.attributes.isFound=true;

      Backbone.trigger('found-item');

      //vibrate
        if(navigator.notification) {
            navigator.notification.vibrate(500);
        }

      //set header next link to found
      this.headerView.setNextURL(this.nextURL);
      this.headerView.render();


        //fix the height of the description box, for correct overflow scrolling
        var windowHeight = $(window).height();
        var $description = $('p.description');
        var descPos = $description.offset();
        var descHeight = windowHeight - descPos.top - 10;
        $description.height(descHeight);

        //enable user prompting to switch floor
        FloorTracking.prompttoSwitch = true;
    },

    //For browser simulation of 'finding' the object. Click on the picture
    events: {
      "click img.item-image" : "onClickImage",
      "click .show-hint" : "showHint",
      "click #nav-menu-button" : "toggleNavMenu",
      "click .map-link" : "showMap",
      "click .map-container" : "hideMap"
    },

    onClickImage: function(ev) {
      Backbone.trigger(this.eventId, { proximity:"ProximityImmediate" });
    },
    showHint: function(ev) {
        ev.preventDefault();
      $('.show-hint').hide();
      $('.hint').show();
    },

    showMap: function(ev) {
      $('.map-container').show();
        //reposition to center on screen;
        var $img = $('img.map-image');
        var sHeight = $(window).height();
        var imgHeight = $img.height();
        var offset = (sHeight - imgHeight)/2;
        $img.css('top', '' + offset + 'px');

    },

    hideMap: function(ev) {
      $('.map-container').hide();
    },

    toggleNavMenu: function(ev)
    {
        var content = $('#content');
        content.toggleClass('slideout');
    }

    //allQuestions: allQuestions
  }
  );

  return ItemView;

});
