define([
        'backbone',
        'underscore',
        'app/models/interactive/LodestoneModel',
        'hbs!app/templates/interactive/lodestone',
        'app/views/interactive/clock/RotateHandleView',
        'app/views/interactive/lodestone/PaletteView',
        'app/views/interactive/lodestone/WeightsView',
        'app/mixins/overlay',
        'hbs!app/templates/overlay_interactive_inner',
        'app/views/VideoControlsView',
        'move',

       ], function(
        Backbone,
        _,
        LodestoneModel,
        lodestoneTemplate,
        RotateHandleView,
        PaletteView,
        WeightsView,
        overlayMixin,
        interactiveInnerTemplate,
        VideoControlsView,
        move
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
                    handleMinHeight: null,
                    handleWidth: 100,
                });

                this.listenTo(this.model, 'change:state', this.render);

            },

            serialize: function() {
                return this.model.toJSON();
            },

            afterRender: function() {
                this.setCrownHeight();

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
                                image: "img/objects/lodestone/ratchet-handle.png"
                            });
                            this.zoomHandleView.render();
                            break;
                        case 'adding':
                            //add pallette view
                            this.weightPaletteView = new PaletteView({
                                el: $('#controls-holder'),
                                choices: this.model.attributes.availableWeights,
                            });
                            this.weightPaletteView.render();

                            //listen for clicks on weights
                            this.listenTo(this.weightPaletteView, 'choice-clicked', _.bind(this.onChooseWeight, this));
                            break;
                        case 'fallen':
                            //prepare for exit
                            console.log("FALLING!");

                            //animate the drop after a half second wait
                            _.delay(function() {
                                var cradle = $('#weight-cradle')[0];
                                console.log("dropping ", cradle);
                                var fallDist = MAX_WIND_HEIGHT;
                                move(cradle)
                                    //fall
                                    .duration('0.2s')
                                    .y(-MAX_WIND_HEIGHT + 30)
                                    //bounce
                                    .then()
                                    //.y(20)
                                    //.ease('in-out')
                                    //.duration('1s')
                                    //////bounce-fall
                                    //.then()
                                    .y(-40)
                                    .ease('in-out')
                                    .duration('0.2s')
                                    //.pop()
                                    .then()
                                    .y(10)
                                    .ease('in-out')
                                    .duration('0.1s')
                                    .pop()
                                    .pop()

                                    .end();
                            }, 100);

                            break;
                        case 'ended':
                            console.log("All Finished");
                            setTimeout(_.bind(function() {
                                Backbone.history.navigate('#/topic/' + this.item.attributes.object);
                            }, this), 1000);
                    }
                }

                this.weightsView = new WeightsView({
                    el: $('#weight-cradle'),
                    model: this.model,
                });
                this.weightsView.render();

                //move when the winding changes
                this.listenTo(this.windModel, 'change', function(source) {
                    //move the crown up
                    this.setCrownHeight();

                    //check if it's at the top or at the bottom
                    if (this.windModel.attributes.angle <0) {
                        this.windModel.set({angle: 0});
                    }

                    if (this.windModel.attributes.angle > MAX_WIND_ANGLE) {
                        console.log('Wound all the way up');
                        //TODO trigger noise
                        //TODO advance to next state
                        this.model.set({state: 'adding'});
                    }
                });
            },

            setCrownHeight: function() {
                var crownHeight = MAX_WIND_HEIGHT * this.windModel.attributes.angle / MAX_WIND_ANGLE;
                $('#crown-holder').css('top', crownHeight);
            },

            onChooseWeight: function(choice) {
                this.model.attributes.loadedWeights.unshift(choice);
                this.render();

                //check we're not too heavy
                var total = this.model.getTotalWeight();

                if(this.model.hasExceededLimit()) {
                    this.model.set({state: 'fallen'});
                }

            },

            events: {

            }
        });

        return LodestoneInteractView;

    }
);