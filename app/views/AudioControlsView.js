define(['backbone', 'hbs!app/templates/audio_controls'],

    function(Backbone, audioControlsTemplate) {

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
	        this.duration = params.duration.toMSS();
            //use Media plugin, for Android playback
            if(typeof(Media) !== 'undefined') {
                this.media_obj = new Media(this.getAudioURL(),
                    //success
                    function () {},
                    //failure
                    function (err) {
                        alert("Failed to create audio object:" + err.code + " " + err.message );
                    }
                );
            } else { alert("Media plugin not available!");}

	        this.updateInterval = setInterval(this.updateElapsed.bind(this), 1000);
        },

        serialize: function() {
            return {    audio: this.audio,
	                    caption: this.caption,
	                    duration: this.duration,
            };
        },

        events: {
          "click #play-audio" : "playAudio",
          "click #pause-audio" : "pauseAudio",
          "click #restart-audio" : "restartAudio"
        },

        getAudioURL: function() {
            path = 'audio/' + this.audio;
            if(device.platform.toLowerCase() === "android") {
                return "/android_asset/www/" + path;
            }
            return path;
        },

        playAudio: function(ev) {
            if(this.media_obj) {
                this.media_obj.play();
            }
            else if(this.media) {
                this.media.play();
            }
            $('#play-audio').hide();
            $('#pause-audio').show();
            $('#restart-audio').show();
        },

        pauseAudio: function(ev) {
            if(this.media_obj) {
                this.media_obj.pause();
            }
            else if(this.media) {
                this.media.pause();
            }
            $('#play-audio').show();
            $('#pause-audio').hide();
        },

        restartAudio: function(ev) {
            if(this.media_obj) {
                this.media_obj.seekTo(0);
            }
            else if(this.media) {
                this.media.currentTime = 0;
            }
        },

	    updateElapsed: function() {
			this.media_obj.getCurrentPosition(function(elapsed) {
				if(elapsed < 0) {
					//not playing
					return;
				}
				$('#media-elapsed').html(elapsed.toMSS());
			});
	    },

        cleanup: function() {
            if(this.media_obj) {
	            console.log('releasing media object');
	            this.media_obj.stop();
                this.media_obj.release();
            }
	        clearInterval(this.updateInterval);
        }

    });

    return AudioControlsView;

});
