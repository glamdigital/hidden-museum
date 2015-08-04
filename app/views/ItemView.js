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
      output.useQR = this.trail.attributes.useQRCodes;

	    //show skip button for beacon trail
      output.showskip = this.trail.attributes.isTrail && !output.useQR



      return output;
    },

    initialize: function(params) {
      this.item = params.item;
      this.nextURL = params.nextURL;
      this.trail = params.trail;
      this.topic = params.topic;
	    if(!this.trail.attributes.useQRCodes) {
		    //listen for events
		    this.eventId = 'beaconRange:' + this.item.attributes.beaconMajor;
		    this.listenTo(Backbone, this.eventId, this.didRangeBeacon);
            Logging.logToDom("Listening for event: " + this.eventId);
	    }
      this.foundAtInit = params.found;
      this.headerView = params.headerView;

	    
      this.pauseTimes = params.item.attributes.pauseTimes;

	    for(var i=0; i<this.pauseTimes.length; i++) {
		    this.pauseTimes[i].hit = false;
	    }
    },

    afterRender: function() {
        if (this.item.attributes.audio) {
            this.audioControlsView = new AudioControlsView({el: $('.audio-controls', this.el),
                                                            audio: this.item.attributes.audio,
                                                            caption: 'About this item',
                                                            duration: this.item.attributes.audio_duration});
            this.audioControlsView.render();
        }

        if(this.foundAtInit) {
          this.findObject();
        }

	    //listen for video finished
	    $('video').on('ended', this.onVideoEnded.bind(this));
		$('video').on('timeupdate', this.checkShouldPause.bind(this));
        $('video').on('seeked', this.resetPauses.bind(this));
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
          this.findObject();
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
            //navigator.notification.vibrate(500);
        }

      //set header next link to found, only for Trail trails
	    if(this.trail.attributes.isTrail) {
		    this.headerView.setNextURL(this.nextURL);
	    }
      this.headerView.render();


        //fix the height of the description box, for correct overflow scrolling
        //var windowHeight = $(window).height();
        //var $description = $('p.description');
        //var descPos = $description.offset();
        //var descHeight = windowHeight - descPos.top - 10;
        //$description.height(descHeight);
        //

	    if(!this.item.attributes.video && !this.item.attributes.audio) {
		    //fix height of entire screen, for overflow scrolling
		    var windowHeight = $(window).height();
		    var $found = $('.found-item');
		    var descPos = $found.offset();
		    var descHeight = windowHeight - descPos.top - 10;
		    $('div.found-item').height(descHeight);
	    }

        //enable user prompting to switch floor
        FloorTracking.prompttoSwitch = true;

	    $('video').on('play', this.makeFullScreen);
    },

    //For browser simulation of 'finding' the object. Click on the picture
    events: {
      //"click img.item-image" : "onClickImage",
      "click .show-hint" : "showHint",
      "click #nav-menu-button" : "toggleNavMenu",
      "click .map-link" : "showMap",
      "click .map-container" : "hideMap",
      "click .scan-qr": "scanQRCode",
      "click video": "makeFullScreen",
      "play video": "makeFullScreen",
      "click .skip-item": "skipItem",
    },

    skipItem: function(ev) {
	    //give the user a confirmation
		navigator.notification.confirm("Are you sure you want to skip this item?",
										function() {
											this.findObject();
										}.bind(this));

    },

    makeFullScreen: function(ev) {
	    $('video')[0].webkitEnterFullscreen();
	    $('video')[0].play();
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
    },

    onVideoEnded: function(ev)
    {
	    //come out of fullscreenvideo
	    $('video')[0].webkitExitFullscreen();

		if(this.trail.attributes.showImgAfterVideo)
		{
			//show the video poster again. Calling load() appears to be the simplest way to achieve this.
			$('video')[0].load();
		}
    },

    checkShouldPause: function(ev)
    {
	    //if we're at a time we should pause at, then pause
	    for(var i=0; i<this.pauseTimes.length; i++) {
		    var vid = $('video')[0];
		    var pause = this.pauseTimes[i];
		    console.log("Should pause? hit = " + pause.hit + " - pauseTime = " + pause.time + ". currentTime = " + vid.currentTime);
		    if(!pause.hit && pause.time < vid.currentTime) {
			    console.log("Paused!");
			    vid.pause();
			    pause.hit = true;
		    }
	    }
    },

    resetPauses: function(ev)
    {
        for(var i=0; i<this.pauseTimes.length; i++) {
	        var vid = $('video')[0];
	        var pause = this.pauseTimes[i];
	        if(vid.currentTime < pause.time) {
		        pause.hit = false;
	        }
        }
    },

    scanQRCode: function(ev) {
      ev.preventDefault();
	  cordova.plugins.barcodeScanner.scan(
		  function(result) {
			  console.log("Got barcode");
			  console.log("result.text");
			  if(result.text.toString() == this.item.attributes.unlock_code)
			  {

				  this.findObject();
			  }
			  else
			  {
				  $('.qr-feedback').html("Code Not Recognised");
			  }
		  }.bind(this)
	  )
    },

    cleanup: function() {
	    if(this.audioControlsView) {
		    this.audioControlsView.remove();
	    }
    }

    //allQuestions: allQuestions
  }
  );

  return ItemView;

});
