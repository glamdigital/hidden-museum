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
        'move'
    ],
    
    function(
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
        
        MAX_WIND_ANGLE = 4 * 360;
        
        MAX_WIND_HEIGHT = -95;
        
        var LodestoneInteractView = Backbone.View.extend({
            template: lodestoneTemplate,
            
            initialize: function() {
                this.stateModel = new LodestoneModel();
                
                this.videos = {
                    //hash of videos to phases - each key corresponds to the video playing when that phase begins
                    'start': 'video/lodestone/intro.mp4',
                    'winding': 'video/lodestone/keysup.mp4',
                    'adding': null,
                    'fallen': null,
                    'ended': 'video/lodestone/outro.mp4'
                };
                
                //model to track handle winding
                this.windModel = new Backbone.Model({
                    angle: 0,
                    handleMinHeight: null,
                    handleWidth: 100
                });
                
                this.listenTo(this.stateModel, 'change:state', this.render);
                
                this.overlayInitialize({ displayOnArrival: true });
                this.overlaySetTemplate(interactiveInnerTemplate, this.model.toJSON());
            },
            
            serialize: function() {
                var out = this.stateModel.toJSON();
                var state = this.stateModel.attributes.state;
                var shouldShowReadout = (state === 'adding' || state === 'fallen');
                out.readoutVisible = shouldShowReadout? 'readout-visible': '';
                out.totalWeight = this.stateModel.getTotalWeight();
                
                out.shouldShowKey = (state === 'start');
                out.instruction = out.instructions[state];
                out.renderContinueButton = (state === 'fallen');
                return out;
            },
            
            afterRender: function() {
                this.setCrownHeight();
                
                //initialise appropriate subview dependent on state
                if (this.stateModel.attributes.videoPlaying) {
                    //add video player
                    this.videoControlsView = new VideoControlsView({
                        el: $('.video-holder'),
                        orientationMode: 'portrait',
                        hidePause: true,
                        imagePath: null,
                        videoPath: this.videos[this.stateModel.attributes.state],
                        onFinalFrame: _.bind(function () {
                            console.log('video ended');
                        }, this)
                    });
                }
                else {
                    switch (this.stateModel.attributes.state) {
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
                                choices: this.stateModel.attributes.availableWeights
                            });
                            this.weightPaletteView.render();
                            
                            //listen for clicks on weights
                            this.listenTo(this.weightPaletteView, 'choice-clicked', _.bind(this.onChooseWeight, this));
                            break;
                            
                        case 'fallen':
                            //prepare for exit
                            
                            //animate the drop after a half second wait
                            _.delay(_.bind(function() {
                                var cradle = $('#weight-cradle')[0];
                                var fallDist = MAX_WIND_HEIGHT;
                                move(cradle)
                                    //fall
                                    .duration('0.2s')
                                    .ease('in')
                                    .y(-MAX_WIND_HEIGHT + 30)
                                    
                                    //bounce
                                    .end(_.bind(function() {
                                        if( navigator.notification ) { navigator.notification.vibrate(100); }
                                        move(cradle).y(-MAX_WIND_HEIGHT - 10)
                                        .ease('in-out')
                                        .duration('0.2s')
                                        .end(_.bind(function() {
                                            move(cradle).y(-MAX_WIND_HEIGHT)
                                            .ease('in-out')
                                            .duration('0.1s')
                                            .end(_.bind(function() {
                                                setTimeout(_.bind(function() {
                                                    //Backbone.history.navigate('#/topic/lodestone');
                                                    $('#continue-button').show();
                                                },this), 1000);
                                            },this));
                                        },this));
                                    }, this));
                            },this), 100);
                            break;
                            
                        case 'ended':
                            console.log("All Finished");
                            setTimeout(_.bind(function() {
                                //Backbone.history.navigate('#/topic/' + this.item.attributes.object);
                            }, this), 1000);
                            break;
                    }
                }
                
                this.weightsView = new WeightsView({
                    el: $('#weight-cradle'),
                    model: this.stateModel
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
                        this.windModel.attributes.angle = MAX_WIND_ANGLE;
                        //TODO trigger noise
                        this.stateModel.set({state: 'adding'});
                        this.stopListening(this.windModel);
                    }
                });
            },
            
            setCrownHeight: function() {
                var crownHeight = MAX_WIND_HEIGHT * this.windModel.attributes.angle / MAX_WIND_ANGLE;
                $('#crown-holder').css('top', crownHeight);
            },
            
            onChooseWeight: function(choice) {
                this.stateModel.attributes.loadedWeights.unshift(choice);
                this.render();
                
                //check we're not too heavy
                var total = this.stateModel.getTotalWeight();
                $('.readout-value').html(total);
                
                if(this.stateModel.hasExceededLimit()) {
                    this.stateModel.set({state: 'fallen'});
                }
            },
            
            events: {
                "click img.lodestone-key": "onClickKey",
                "click #continue-button": "continue"           //class only exists in fallen state
            },
            
            onClickKey: function() {
                //animate key up towards
                var keyL = $('#lodestone-Lkey')[0];
                move(keyL)
                    .translate(55, -345)
                    .rotate(180)
                    .duration('1s')
                    .ease('in-out')
                    .end(_.bind(function() {
                        $('.lodestone-key').attr('src', 'img/objects/lodestone/ratchet-handle.png');
                        setTimeout(_.bind(function () {
                            this.stateModel.set({state: 'winding'});
                        }, this), 500);
                    },this));
                
                var keyR = $('#lodestone-Rkey')[0];
                move(keyR)
                    .translate(177, -352)
                    .rotate(210)
                    .duration('1.2s')
                    .ease('in-out')
                    .end();
            },
            
            continue: function() {
                //return to menu after finishing, but only after the weight has finished falling.
                Backbone.history.navigate('#/topic/' + this.item.attributes.topic);
            }
        });
    
        _.extend(LodestoneInteractView.prototype, overlayMixin);
        return LodestoneInteractView;
    }
);
