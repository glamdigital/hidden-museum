define([
        'backbone',
        'underscore',
        'hbs!app/templates/video_controls'
    ],
    
    function (Backbone, _, videoControlsTemplate) {
        
        var VideoControlsView = Backbone.View.extend({
            orientationMode: null, // null is unlocked, string for mode
            
            template: videoControlsTemplate,
            
            serialize: function () {
                // var output = this.item.toJSON();
                
                // output.nextURL = this.nextURL;
                
                // return output;
                
                return this.templateData;
            },
            
            initialize: function (params) {
                // this.item = params.item;
                // this.nextURL = params.nextURL;
                
                if (params.hasOwnProperty('orientationMode')) {
                    this.orientationMode = params.orientationMode;
                }
                
                this.templateData = {
                    imagePath: 'Darwin.jpg',
                    videoPath: 'slomo_portrait.mp4'
                };
            },
            
            ownOrientation: function (takeOwnership) {
                if (!screen ||
                    typeof screen.unlockOrientation !== 'function' ||
                    typeof screen.lockOrientation !== 'function') {
                    
                    return;
                }
                
                if (takeOwnership) {
                    if (this.orientationMode) {
                        screen.lockOrientation(this.orientationMode);
                    }
                    else {
                        screen.unlockOrientation();
                    }
                }
                else {
                    screen.unlockOrientation();
                }
            },
            
            afterRender: function () {
                $('.video-player video').on('ended', this.onVideoEnded.bind(this));
            },
            
            events: {
                'click .video-player video': 'makeFullScreen',
                'play .video-player video': 'makeFullScreen',
                'click .video-player .transport-controls .play': 'makeFullScreen',
                'click .video-player .transport-controls .pause' : 'transportPause',
                'click .video-player .transport-controls .restart' : 'transportRestart'
            },
            
            makeFullScreen: function (event) {
                $('.video-player').addClass('fullscreen');
                
                var jVideo = $('.video-player video')[0];
                
                //jVideo.show();
                jVideo.webkitEnterFullscreen();
                jVideo.play();
                
                this.ownOrientation(true);
                // if(typeof(screen !== 'undefined')) {
                //     screen.lockOrientation('landscape');
                // }
            },
            
            transportPause: function (event) {
                console.log('Pause pressed');
            },
            
            transportRestart: function (event) {
                console.log('Restart pressed');
            },
            
            onVideoEnded: function (event) {
                var jVideoPlayer = $('.video-player');
                var jVideo       = jVideoPlayer.find('video')[0];
                
                jVideo.webkitExitFullscreen();
                
                jVideoPlayer.find('.transports-controls').hide();
                jVideoPlayer.removeClass('fullscreen');
                
                this.ownOrientation(false);
                // if(typeof(screen !== 'undefined')) {
                //     screen.lockOrientation('portrait');
                // }
            },
            
            cleanup: function() {
                this.ownOrientation(false);
                // if(typeof(screen !== 'undefined')) {
                //     screen.lockOrientation('portrait');
                // }
            }
        });
        
        return VideoControlsView;
    }
);
