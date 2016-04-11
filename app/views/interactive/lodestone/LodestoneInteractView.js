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
        'app/media',
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
        mediaUtil,
        move
    ) {
        
        MAX_WIND_ANGLE = 4 * 360;
        
        MAX_WIND_HEIGHT = -70;
        
        var LodestoneInteractView = Backbone.View.extend({
            template: lodestoneTemplate,

            tapKeySound: mediaUtil.createAudioObj('audio/lodestone/quiet_clunk.wav'),
            keyInSound: mediaUtil.createAudioObj('audio/lodestone/keyIn.wav'),
            ratchetSound: mediaUtil.createAudioObj('audio/lodestone/ratchet.wav'),
            addWeightSound: mediaUtil.createAudioObj('audio/lodestone/add_weight.wav'),
            fullWindSound: mediaUtil.createAudioObj('audio/lodestone/click_in_place.wav'),
            fallStartSound: mediaUtil.createAudioObj('audio/lodestone/fall_loud.wav'),
            fallSound: mediaUtil.createAudioObj('audio/lodestone/fall.wav'),


            initialize: function() {

                //this.videos = {
                //    //hash of videos to phases - each key corresponds to the video playing when that phase begins
                //    'start': 'video/lodestone/intro.mp4',
                //    'winding': 'video/lodestone/keysup.mp4',
                //    'adding': null,
                //    'fallen': null,
                //    'ended': 'video/lodestone/outro.mp4'
                //};

                
                this.resetState();
                this.model.set({state: 'winding'});

                this.overlayInitialize({ displayOnArrival: true });
                this.overlaySetTemplate(interactiveInnerTemplate, this.model.toJSON());

                this.playRatchetAudio = _.bind(_.throttle(function(){
                    this.ratchetSound.play();
                }, 300),this);
            },

            resetState: function() {
                if(this.stateModel) {
                    this.stopListening(this.stateModel);
                }

                this.stateModel = new LodestoneModel();

                //model to track handle winding
                this.windModel = new Backbone.Model({
                    angle: 0,
                    handleMinHeight: null,
                    handleWidth: 100
                });

                this.listenTo(this.stateModel, 'change:state', this.render);

            },
            
            serialize: function() {
                var out = this.stateModel.toJSON();
                var state = this.stateModel.attributes.state;
                var shouldShowReadout = (state === 'adding' || state === 'fallen' || state == 'failed');
                out.readoutVisible = shouldShowReadout? 'readout-visible': '';
                out.totalWeight = this.stateModel.getTotalWeight();
                
                out.shouldShowKeyOnTable = (state === 'start');
                out.showRatchet = (state == 'winding');
                out.instruction = out.instructions[state];
                out.renderContinueButton = (state === 'fallen');
                out.renderRetryButton = (state === 'failed' );
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
                                image: "img/objects/lodestone/RatchetHandle.png",
                                oneWay: true
                            });
                            this.zoomHandleView.render();
                            this.updateRatchetArm();
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

                                //play sound
                                this.fallStartSound.play();

                                //animate fall
                                var cradle = $('#weight-cradle')[0];
                                var fallDist = MAX_WIND_HEIGHT;
                                move(cradle)
                                    //fall
                                    .duration('0.2s')
                                    .ease('in')
                                    .y(-MAX_WIND_HEIGHT + 30)
                                    
                                    //bounce
                                    .end(_.bind(function() {
                                        this.fallSound.play();
                                        if( navigator.notification ) { navigator.notification.vibrate(100); }
                                        move(cradle).y(-MAX_WIND_HEIGHT - 7)
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
                this.listenTo(this.windModel, 'change', _.bind(function(source) {
                    //move the crown up
                    this.setCrownHeight();

                    this.playRatchetAudio();
                    
                    this.updateSmallKeys();
                    
                    this.updateRatchetArm();
                    
                    //check if it's at the top or at the bottom
                    if (this.windModel.attributes.angle <0) {
                        this.windModel.set({angle: 0});
                    }
                    
                    if (this.windModel.attributes.angle > MAX_WIND_ANGLE) {
                        this.stopListening(this.windModel);
                        this.windModel.attributes.angle = MAX_WIND_ANGLE;

                        this.fullWindSound.play();

                        this.stateModel.set({state: 'adding'});
                    }
                }, this));
            },

            setCrownHeight: function() {
              
                var frameHeight = $("#crown-container").height();
                $('#crown-holder #crown').height(frameHeight * 0.27);
                
                var crownTop = (0.1*frameHeight + MAX_WIND_HEIGHT * this.windModel.attributes.angle / MAX_WIND_ANGLE) + 30*(frameHeight-620)/620;
                $('#crown-holder').css({'top': crownTop});
            },
            
            updateSmallKeys: function() {
                var lKeyNewOri = 180 + this.windModel.attributes.angle;
                var rKeyNewOri = 210 + this.windModel.attributes.angle;
                
                $('#lodestone-Lkey').css('transform', 'rotate(' + lKeyNewOri + 'deg)');
                $('#lodestone-Rkey').css('transform', 'rotate(' + rKeyNewOri + 'deg)');
            },
            
            updateRatchetArm: function() {
                var numTeeth = 21;
                var degPerTeeth = Math.floor(360/numTeeth);
                var phase =  (5 + this.windModel.attributes.angle) % degPerTeeth;
                var armInitialAngle = 5;
                
                var armAngle = (0.3 * (armInitialAngle - phase)) - 5;
                $('#ratchet-arm').css('transform', 'rotate(' + armAngle + 'deg)');
                
            },
            
            onChooseWeight: function(choice) {
                this.stateModel.attributes.loadedWeights.unshift(choice);
                this.render();

                //play sound
                this.addWeightSound.play();

                //check we're not too heavy
                var total = this.stateModel.getTotalWeight();
                $('.readout-value').html(total);
                
                if(this.stateModel.hasExceededLimit()) {
                    this.stateModel.set({state: 'fallen'});
                } else if(this.stateModel.getTotalHeight() >= this.stateModel.attributes.maxHeight) {
                    this.stateModel.set({state: 'failed'});
                }
            },
            
            events: {
                "click img.lodestone-key": "onClickKey",
                "click #continue-button": "continue",           //class only exists in fallen state
                "click #retry-button": "retry"           //class only exists in failed state
            },
            
            onClickKey: function() {
                this.tapKeySound.play();

                //animate key up towards
                var frameHeight = $("#frame").height();
                var frameWidth = $("#frame").width();
                var keyL = $('#lodestone-Lkey')[0];
                move(keyL)
                    .translate(frameWidth *13/100, -frameHeight *54/100)
                    .rotate(180)
                    .duration('1s')
                    .ease('in-out')
                    .end(_.bind(function() {
                        //swap for ratchet images
                        $('.lodestone-key').attr('src', 'img/objects/lodestone/ratchet-handle.png');
                        //play clunk audio
                        this.keyInSound.play();
                        //move to winding state
                        setTimeout(_.bind(function () {
                            this.stateModel.set({state: 'winding'});
                        }, this), 500);
                    },this));
                
                var keyR = $('#lodestone-Rkey')[0];
                move(keyR)
                    .translate(frameWidth *39/100, -frameHeight *54/100)
                    .rotate(210)
                    .duration('1.2s')
                    .ease('in-out')
                    .end();
            },
            
            continue: function() {
                //return to menu after finishing, but only after the weight has finished falling.
                Backbone.history.navigate('#/topic/' + this.item.attributes.topic);
            },

            retry: function() {
                this.resetState();
                this.render();
            },

            cleanup: function() {
                this.overlayCleanup();
                
                //clean up audio
                tapKeySound.cleanup();
                keyInSound.cleanup();
                ratchetSound.cleanup();
                addWeightSound.cleanup();
                fullWindSound.cleanup();
                fallStartSound.cleanup();
                fallSound.cleanup();
            }
        });
    
        _.extend(LodestoneInteractView.prototype, overlayMixin);
        return LodestoneInteractView;
    }
);
