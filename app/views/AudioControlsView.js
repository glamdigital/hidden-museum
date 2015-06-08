define(['backbone', 'hbs!app/templates/audio_controls'],
    function(Backbone, audioControlsTemplate) {

    var AudioControlsView = Backbone.View.extend({

        template: audioControlsTemplate,

        initialize: function(params) {
            this.audio = params.audio;
            this.caption = params.caption;
            //use Media plugin, for Android playback
            if(typeof(Media) !== 'undefined') {
                this.media_obj = new Media(this.getAudioURL(),
                    //success
                    function () {alert("Successfully created audio object");},
                    //failure
                    function (err) {
                    alert("Failed to create audio object:" + err.code + " " + err.message );}
                );
            } else { alert("Media plugin not available!");}
        },

        serialize: function() {
            return { audio: this.audio, caption: this.caption };
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

        cleanup: function() {
            if(this.media_obj) {
                this.media_obj.release();
            }
        }

    });

    return AudioControlsView;

});
