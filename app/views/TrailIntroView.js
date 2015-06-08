define(["backbone", "underscore", "app/models/Trail", "app/views/AudioControlsView", "hbs!app/templates/trail_intro"],
    function(Backbone, _, Trail, AudioControlsView, trailIntro) {

    var TrailIntroView = Backbone.View.extend({
        template: trailIntro,

        initialize: function(params) {
            this.trail = params.trail;
            this.nextURL = params.nextURL;
            this.listenTo(Backbone, 'changed_floor', this.changedFloor);
        },

        afterRender: function() {
            if (this.trail.attributes.audio) {
                this.audioControls = new AudioControlsView({el:$('.audio-controls'),
                                                            audio: this.trail.attributes.audio,
                                                            caption: 'Trail Intro'});
                this.audioControls.render();
            }
        },

        serialize: function() {
            var out = {}
            out.trail = this.trail.toJSON();
            out.topics = this.trail.getTopics().toJSON();
            out.nextURL = this.nextURL;
            out.trail_slug = this.trail.attributes.slug;
            return out;
        },

        events: {
            "click #play-audio": "playAudio",
            "click #pause-audio": "pauseAudio",
            "click #restart-audio": "restartAudio",
            "click .play": "playAudio",
        },

        playAudio: function(ev) {
            if(this.audio) {
                this.audio.play();
                $('#play-audio').hide();
                $('#pause-audio').show();
                $('#restart-audio').show();
            }
        },

        pauseAudio: function(ev) {
            if(this.audio) {
                this.audio.pause();
            }
            $('#play-audio').show();
            $('#pause-audio').hide();
        },

        restartAudio: function(ev) {
            if(this.audio) {
                this.audio.currentTime = 0;
            }
        },

        showStartLink: function(ev) {
            ev.preventDefault();
            $('.start-trail').show();
            //add the 'finished' class to the video
            var $video = $('#intro-video');
            $video.addClass('finished');
            //hide the controls
            $video.removeAttr('controls');
        }
    });

    return TrailIntroView;

});
