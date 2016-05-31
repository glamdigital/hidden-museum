define([
    'backbone', 
    'app/media',
    'hbs!app/templates/audio_controls'
],

    function(
        Backbone, 
        mediaUtil,
        audioControlsTemplate
    ) {

	    Number.prototype.toMSS = function () {
		    var sec_num = Math.floor(this);
		    var minutes = Math.floor((sec_num ) / 60);
		    var seconds = sec_num - (minutes * 60);

		    if (seconds < 10) {seconds = "0"+seconds;}
		    var time = minutes+':'+seconds;
		    return time;
		}

    var AudioControlsView = Backbone.View.extend({

        template: audioControlsTemplate,

        initialize: function(params) {
            this.audio = params.audio;
            this.caption = params.caption;
            this.duration = parseInt(params.duration).toMSS();
            this.media = mediaUtil.createAudioObj(this.getAudioURL());
            this.paused = true;

	        this.updateInterval = setInterval(this.updateElapsed.bind(this), 1000);

            //listen for events that a (nother) piece of audio has been triggered
            this.listenTo(Backbone, 'audio-player-start', _.bind(this.onAnyAudioPlayerStart, this));
        },

        serialize: function() {
            return {    audio: this.audio,
	                    caption: this.caption,
	                    duration: this.duration,
            };
        },

        events: {
          "click .audio": "toggleAudio",
          //"click #play-audio" : "playAudio",
          //"click #pause-audio" : "pauseAudio",
          "click #restart-audio" : "restartAudio",
        },

        afterRender: function() {
            if(!this.media) {
                this.media = $('audio', this.$el)[0];
            }
        },

        onAnyAudioPlayerStart: function(source) {
            //if the event didn't originate from us, pause the audio
            if(source !== this) {
                this.pauseAudio();
            }
            this.$el.removeClass('playing');
        },

        getAudioURL: function() {
            path = 'audio/' + this.audio;
            // if(device.platform.toLowerCase() === "android") {
            //     return "/android_asset/www/" + path;
            // }
            return path;
        },

        playAudio: function(ev) {
            if(this.media) {
                this.media.play();
            }
            $('#play-audio', this.$el).hide();
            $('#pause-audio', this.$el).show();
            $('#restart-audio', this.$el).show();
            Backbone.trigger('audio-player-start', this);
            this.$el.addClass('playing');
            this.paused = false;
        },

        pauseAudio: function(ev) {
            this.media.pause();
            $('#play-audio', this.$el).show();
            $('#pause-audio', this.$el).hide();
            this.paused = true;
        },

        toggleAudio: function(ev) {
            if(this.paused) {
                this.playAudio();
            } else {
                this.pauseAudio();
            }
        },

        restartAudio: function(ev) {
            ev.stopPropagation();
            if(this.media) {
                this.media.setTime(0);
	            $('#media-elapsed', this.$el).html('0:00');
            }
        },

	    updateElapsed: function() {
            this.media.getProgress(function (elapsed) {
                if(elapsed < 0) {
                    //not playing
                    return;
                }
                $('#media-elapsed', this.$el).html(elapsed.toMSS());
            }.bind(this));
	    },

        cleanup: function() {
            this.media.cleanup();
	        clearInterval(this.updateInterval);
        }

    });

    return AudioControlsView;

});
