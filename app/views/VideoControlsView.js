define([
        'backbone',
        'underscore',
        'hbs!app/templates/video_controls'
    ],
    
    function (Backbone, _, videoControlsTemplate) {
        
        var VideoControlsView = Backbone.View.extend({
            orientationMode: null, // null is unlocked, string for mode
            
            hidePause: false,
            
            onFinalFrame: function () {},
            
            template: videoControlsTemplate,
            
            serialize: function () {
                // var output = this.item.toJSON();
                
                // output.nextURL = this.nextURL;
                
                // return output;
                
                return this.templateData;
            },
            
            initialize: function (params) {
                if (params.hasOwnProperty('orientationMode')) {
                    this.orientationMode = params.orientationMode;
                }
                
                if (params.hasOwnProperty('hidePause')) {
                    this.hidePause = params.hidePause;
                }
                
                if (params.hasOwnProperty('onFinalFrame') && typeof params.onFinalFrame === 'function') {
                    this.onFinalFrame = params.onFinalFrame;
                }
                
                this.templateData = {
                    imagePath: params.imagePath || '',
                    videoPath: params.videoPath || '',
                    orientation: this.orientationMode
                };
                this.playImmediately = params.playImmediately;
            },
            
            afterRender: function () {
                if (this.hidePause) {
                    var jTransportControls = $('.video-player .transport-controls');
                    jTransportControls.find('.pause').addClass('hidden');
                }
                
                var jVideo = $('.video-player video');
                
                jVideo.on('ended',   this.onVideoEnded.bind(this));
                jVideo.on('pause',   this.onPause.bind(this));
                jVideo.on('play',    this.onPlay.bind(this));
                jVideo.on('playing', this.onPlay.bind(this));
                jVideo.on('webkitbeginfullscreen', this.onFullscreen.bind(this));
                jVideo.on('webkitendfullscreen', this.onEndFullscreen.bind(this));
                if (this.playImmediately) this.transportPlay();
            },
            
            onFullscreen: function(ev) {
              if(this.orientationMode === 'landscape-primary') {
                screen.lockOrientation(this.orientationMode);
              }
            },
            
            onEndFullscreen: function(ev) {
              screen.lockOrientation("portrait-primary");
              this.onVideoEnded();
            },
            
            onPause: function (event) {
                if (this.hidePause) {
                    var jTransportControls = $('.video-player .transport-controls');
                    jTransportControls.find('.play').removeClass('hidden');
                    jTransportControls.find('.pause').addClass('hidden');
                }
            },
            
            onPlay: function (event) {
                if (this.hidePause) {
                    var jTransportControls = $('.video-player .transport-controls');
                    jTransportControls.find('.play').addClass('hidden');
                    jTransportControls.find('.pause').removeClass('hidden');
                }
            },
            
            events: {
                'click .video-player video': 'transportTogglePlay',
                'click .video-player .transport-controls .play': 'transportPlay',
                'click .video-player .transport-controls .pause' : 'transportPause',
                'click .video-player .transport-controls .restart' : 'transportRestart'
            },
            
            transportTogglePlay: function (event) {
                var video = $('.video-player video')[0];
                
                if (video.paused) {
                    this.transportPlay(event);
                }
                else {
                    this.transportPause(event);
                }
            },
            
            transportPlay: function (event) {
                // console.log('Play pressed');
                
                var video = $('.video-player video')[0];
                video.play();
            },
            
            transportPause: function (event) {
                // console.log('Pause pressed');
                
                var video = $('.video-player video')[0];
                video.pause();
            },
            
            transportRestart: function (event) {
                // console.log('Restart pressed');
                
                var video = $('.video-player video')[0];
                video.currentTime = 0;
                video.play();
            },
            
            onVideoEnded: function (event) {
                this.onFinalFrame();
            },
            
            cleanup: function() {
            }
        });
        
        return VideoControlsView;
    }
);
