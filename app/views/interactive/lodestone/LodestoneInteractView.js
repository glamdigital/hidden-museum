define([
        'backbone',
        'underscore',
        'app/models/interactive/LodestoneModel',
        'hbs!app/templates/interactive/lodestone',
        'app/views/interactive/clock/RotateHandleView',
        'app/mixins/overlay',
        'hbs!app/tempaltes/overlay_interactive_inner',
        'app/views/VideoControlsView',

       ], function(
        Backbone,
        _,
        LodestoneModel,
        lodestoneTemplate,
        RotateHandleView,
        overlayMixin,
        interactiveInnerTemplate,
        VideoControlsView
    ) {

        MAX_WIND_ANGLE = 2.5 * 360;

        MAX_WIND_HEIGHT = -95;

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
                    angle: 0,
                    handleMinHeight: 120,
                    handleWidth: 20,
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
                            this.zoomHandleView = new RotateHandleView({
                                el: $('#controls-holder'),
                                model: this.windModel,
                                image: "img/minute_hand.png"
                            });
                            this.zoomHandleView.render();
                            break;
                        case 'adding':
                            //add pallette view
                            break;
                        case 'fallen':
                            //prepare for exit
                            break;
                    }
                }

                //move when the winding changes
                this.listenTo(this.windModel, 'change', function(source) {
                    //move the crown up
                    var crownHeight = MAX_WIND_HEIGHT * this.windModel.attributes.angle / MAX_WIND_ANGLE;
                    $('#crown-holder').css('top', crownHeight);

                    //check if it's at the top or at the bottom
                    if (this.windModel.attributes.angle <0) {
                        this.windModel.set({angle: 0});
                    }

                    if (this.windModel.attributes.angle > MAX_WIND_ANGLE) {
                        console.log('Wound all the way up');
                        //TODO trigger noise
                        //TODO advance to next state
                    }
                })


            },

            events: {

            }
        });

        return LodestoneInteractView;

    }
);