define([
        'backbone',
        'underscore',
        'app/models/interactive/LodestoneModel',
        'hbs!app/templates/interactive/lodestone',
        'app/mixins/overlay',
        'hbs!app/tempaltes/overlay_interactive_inner',
        'app/views/VideoControlsView',

       ], function(
        Backbone,
        _,
        LodestoneModel,
        lodestoneTemplate,
        overlayMixin,
        interactiveInnerTemplate,
        VideoControlsView
    ) {

        var LodestoneInteractView = Backbone.View.extend({
            template: lodestoneTemplate,

            initialize: function() {
                this.model = new LodestoneModel();

                this.videos = {
                    //hash of videos to phases - each key corresponds to the video playing when that phase begins
                    'start': 'video/lodestone/intro.mp4',
                    'winding': 'video/lodestone/keysup.mp4',
                    'adding': null,
                    'fallen': null,
                    'ended': 'video/lodestone/outro.mp4',
                };

                //model to track handle winding
                this.windModel = new Backbone.Model({
                    angle: 0
                });

            },

            serialize: function() {
                return this.model.toJSON();
            },

            afterRender: function() {
                //initialise appropriate subview dependent on state

                if(this.model.attributes.videoPlaying) {
                    //add video player
                    this.videoControlsView = new VideoControlsView({
                        el: $('.video-holder'),
                        orientationMode: 'portrait',
                        hidePause: true,
                        imagePath: null,
                        videoPath: this.videos[this.model.attributes.state],
                        onFinalFrame: _.bind(function () {
                            console.log('video ended');
                        }, this),
                    });
                } else {
                    switch (this.model.attributes.state) {
                        case 'start':
                            //add keys as touch hotspot
                            break;
                        case 'winding':
                            // add winding handle
                            break;
                        case 'adding':
                            //add pallette view
                            break;
                        case 'fallen':
                            //prepare for exit
                            break;
                    }
                }


            },

            events: {

            }
        });

        return LodestoneInteractView;

    }
);