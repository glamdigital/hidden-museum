define([
        "backbone",
        "app/models/interactive/SextantModel",
        "app/views/interactive/SextantReadingView",
        "hbs!app/templates/interactive/sextant",
        "app/mixins/overlay",
        'hbs!app/templates/overlay_interactive_inner'
    ],
    
    function (Backbone, SextantModel/*UNUSED*/, SextantReadingView, sextantTemplate, overlayMixin, interactiveInnerTemplate, ft /* We need to require FullTilt, but it ends up as a global object */) {
        
        //sextant arm
        ARM_PIVOT = {x:0.0, y:-0.36};  //rotation centre for the arm as proportion of width, from geometric centre
        
        SKY_BACKGROUND_SCROLL_RATE = 1000/90;
        SKY_BACKGROUND_OFFSET = 555;
        MIN_ANGLE = -20;
        DEFAULT_HORIZON = -10;
        MIN_CAPTURE_SUN_ANGLE = 10;
        
        LOG_NEXT_EV = false;
        
        setSextantArmAngle = function (deg) {
            var armAngle = deg/2;
            var rad = armAngle * Math.PI / 180;
            var r00 = Math.cos(rad);
            var r11 = r00;
            var r01 = -Math.sin(rad);
            var r10 = -1 * r01;
            var width = $('#sextant-arm').width();
            var x = ARM_PIVOT.x * width;
            var y = ARM_PIVOT.y * width;
            var tx = x - r00*x - r01*y;
            var ty = y - r10*x -r11*y;
            
            var matrix = "matrix(" + r00 + "," + r10 + "," + r01 + "," + r11 + "," + tx + "," + ty + ")";
            $('#sextant-arm').css("transform", matrix);
        };
        
        var SextantView = Backbone.View.extend({
            template: sextantTemplate,
            
            events: {
              "click .toggle": "toggleButtonHandler"
            },
            
            serialize: function () {
                var out = {};
                out.instructions = this.instructions[0];
                return out;
            },
            
            initialize: function (params) {
                this.item = params.item;
                this.step = 0;
                this.isTrackingOrientation = false;
                this.isTrackingMotion = false;
                this.hasSetHorizon = false;
                this.currentDeviceOrientation = {alpha:0, beta:0, gamma:0};
                this.startingDeviceOrientation = {alpha:0, beta:0, gamma:0};
                this.angle = 0;
                this.instructions = ["<p>Hold the phone straight up in front of you and tilt it until the red line is level with the sea horizon.</p><p>Then press the 'Set Horizon' button.</p>",
                    "<ol><li>Mimic movement of the sextant arm by tilting the camera upwards</li><li>Watch for the reflected image of the sun</li><li>Line sun up with the horizon line</li><li>Press the 'Angle of the Sun' button</li></ol>",
                    "<p>You have measured that the noon sun is NN.Ndeg above the horizon.</p>But to calculate latitude from this reading navigators would need to look up the angle in a reference book called an almanac.</p><p>Press the 'Find Latitude' button to simulate looking in the almanac.</p>"];
                this.instructionsColors = ['url(img/parchment-tan.jpg)', 'url(img/parchment-tan-dark.jpg)', 'url(img/parchment-tan.jpg)'];
                
                $('#content').css("background-color", "transparent");
                this.startingDeviceOrientation = { beta: 90 + DEFAULT_HORIZON };
                this.startTrackingOrientation();
                
                this.overlayInitialize({ displayOnArrival: true });
                this.overlaySetTemplate(interactiveInnerTemplate, this.model.toJSON());
            },
            
            afterRender: function () {
                this.setup();
                
                //create the view for the reading
                this.readingView = new SextantReadingView({
                    el: '#sextant-reading',
                    stateModel: this.stateModel
                });
                this.readingView.render();
                
                
                //initialise camera preview
                if (typeof cordova !== 'undefined') {
                    var tapEnabled = true; //enable tap take /picture
                    var dragEnabled = false; //enable preview box drag across the screen
                    var toBack = true; //send preview box to the back of the webview
                    var $viewfinder = $('#viewfinder');
                    var rect = {
                        x: 0, 
                        y: $viewfinder.offset().top, 
                        width: $viewfinder.width(), 
                        height: $viewfinder.height()
                    };
                    cordova.plugins.camerapreview.startCamera(rect, "back", tapEnabled, dragEnabled, toBack);
                }
            },
            
            setup: function () {
                this.displayInstructions(0);
                setSextantArmAngle(0);
                this.stateModel.set({angle: 0});
                this.hideMessage();
                this.showHorizonIndicator();
                this.angle = 0;
                $(window).on('deviceorientation', this, _.bind(this.deviceOrientationHandler, this));
                $(window).on('devicemotion', this, _.bind(this.deviceMotionHandler, this));
            },
            
            toggleButtonHandler: function (ev) {
                var $target = $(ev.target);
                
                switch (this.step) {
                    case 0:
                        this.step = 1;
                        $target.text("Angle of the Sun");
                        $target.hide();
                        this.takeHorizonImage(ev);
                        this.hasSetHorizon = true;
                        //this.startTrackingOrientation(ev);
                        //grab the current orientation as the initial orientation
                        //this.startingDeviceOrientation = this.currentDeviceOrientation;
                        // this.horizonOrientation = this.currentDeviceOrientation;
                        this.horizonDeviceAngle = this.currentDeviceAngle;
                        
                        this.displayInstructions();
                        break;
                    
                    case 1:
                        this.step = 2;
                        this.stopTrackingOrientation(ev);
                        this.showMessage();
                        this.hideHorizonIndicator();
                        $('#captured-image').css("background-image", "none");
                        $target.text("Calculate Latitude");
                        break;
                    
                    case 2:
                        this.step = 0;
                        Backbone.history.navigate('#/interact/' + this.item.attributes.slug + '/' + this.item.attributes.type + '/1');
                        break;
                }
            },
            
            startTrackingOrientation: function (ev) {
                //this.startingDeviceOrientation = null;
                // this.isTrackingOrientation = true;
                this.isTrackingMotion = true;
            },
            
            stopTrackingOrientation: function (ev) {
                this.isTrackingOrientation = false;
                this.isTrackingMotion = false;
                $(window).off('deviceorientation', _.bind(this.deviceOrientationHandler, this));
                $(window).off('devicemotion', _.bind(this.deviceMotionHandler, this));
            },
            
            deviceOrientationHandler: function (ev) {
                if (this.isTrackingOrientation == true) {
                    if (this.startingDeviceOrientation == null) {
                        this.startingDeviceOrientation = ev.originalEvent;
                    }
                    
                    this.currentDeviceOrientation = ev.originalEvent;
                    // if(LOG_NEXT_EV) {
                    //     console.log(ev.originalEvent);
                    //     LOG_NEXT_EV = false;
                    // }
                    this.updateOrientationIndicator();
                }
            },
            
            deviceMotionHandler: function (ev) {
                if (this.isTrackingMotion == true) {
                    if (this.startingDeviceMotion = null) {
                        this.startingDeviceMotion = ev.originalEvent;
                    }
                    
                    this.currentDeviceMotion = ev.originalEvent;
                    // if(LOG_NEXT_EV) {
                    //     console.log(ev.originalEvent);
                    //     LOG_NEXT_EV = false;
                    // }
                    
                    this.updateOrientationFromMotion();
                    this.updateOrientationIndicator();
                }
            },
                        
            updateOrientationIndicator: function() {
                if(this.hasSetHorizon) {
                    // this.angle = this.currentDeviceOrientation.beta - this.horizonOrientation.beta;
                    this.angle = this.currentDeviceAngle - this.horizonDeviceAngle;
                    
                    
                    //limit to 82 degrees north as this is the furthest the map can show.
                    if (this.angle > 82) {
                        this.angle = 82;
                    }
                    else if (this.angle < MIN_ANGLE) {
                        this.angle = MIN_ANGLE;
                    }
                    
                    //set the angle on the state model
                    this.stateModel.set({angle: this.angle});
                    
                    if (this.angle > MIN_CAPTURE_SUN_ANGLE) {
                        $button = $('#controls').find('.button');
                        $button.show();
                    }
                }
                
                var skyAngle = this.currentDeviceAngle;
                
                if(skyAngle < MIN_ANGLE) {
                    skyAngle = MIN_ANGLE;
                }
                
                var skyOffsetY = skyAngle * SKY_BACKGROUND_SCROLL_RATE + SKY_BACKGROUND_OFFSET;
                $('#sky').css('background-position-y', skyOffsetY + 'px');
                
                //Attempt to scan left/right a little. Doesn't work well, as roll adds to gamma.
                // If we can use something like FullTilt to transform the orientations so that they are based around
                // device being upright, rather than device being flat, this may be worth reinstating.
                // Applying such a transform would also hopefully alleviate the 'pop' at alpha ~= 90 when the device is rolled slightly

                //var skyOffsetX = this.currentDeviceOrientation.gamma * SKY_BACKGROUND_SCROLL_RATE + 500;
                //$('#sky').css('background-position-x', skyOffsetX + 'px');
            },
            
            updateOrientationFromMotion: function () {
                var gravity = {
                    x: this.currentDeviceMotion.accelerationIncludingGravity.x - this.currentDeviceMotion.acceleration.x,
                    y: this.currentDeviceMotion.accelerationIncludingGravity.y - this.currentDeviceMotion.acceleration.y,
                    z: this.currentDeviceMotion.accelerationIncludingGravity.z - this.currentDeviceMotion.acceleration.z,
                };
                
                var gDotY = gravity.z / Math.sqrt(gravity.x * gravity.x + gravity.y * gravity.y + gravity.z * gravity.z);
                var angleRad = Math.acos(gDotY);
                
                angleRad = Math.PI - angleRad;
                                
                var angleDeg = angleRad * 180/Math.PI;
                
                if(LOG_NEXT_EV) {
                    // console.log(ev.originalEvent);
                    console.log('angle: ', angleDeg);
                    LOG_NEXT_EV = false;
                }
                
                
                this.currentDeviceAngle = angleDeg;
            },
            
            showHorizonIndicator: function () {
                 $('#alignment-indicator').show();
            },
            
            hideHorizonIndicator: function () {
                 $('#alignment-indicator').hide();
            },
            
            takeHorizonImage: function (ev) {
            //capture the screen, rather than taking an actual photo, since this is much faster.
                if (typeof navigator.screenshot !== 'undefined') {
                    navigator.screenshot.save(function (error, res) {
                        if (error) {
                            console.error(error);
                        } else {
                            console.log('screenshot ok', res.filePath);
                            $('#captured-image').css("background", "url(" + res.filePath + ")");
                            
                            // Must equal the display width exactly otherwise scaling will blur the image
                            // and it will be impossible to set the position-y offset correctly.
                            $('#captured-image').css("background-size", "375px");
                            
                            $('#captured-image').css("background-position-y", "-203px");
                        }
                    });
                }
            },
            
            displayInstructions: function () {
                var $instructionsDiv = $('#instructions')[0];
                $instructionsDiv.innerHTML = this.instructions[this.step];
                $($instructionsDiv).css('background-image', this.instructionsColors[this.step]);
                $('canvas#sextant-reading').css('background-image', this.instructionsColors[this.step]); 
            },
            
            showMessage: function () {
                $('#message').show();
                //$('#message')[0].innerHTML = "<p>The angle you measured was "  + this.angle.toPrecision(4).toString() + "&deg;. If the object you lined up had been the Pole Star, the angle would be the same as your latitude. The Pole Star is 90&deg; above the horizon at the North Pole, which has a latitude of 90&deg; North. The star appears right on the horizon at the equator, at 0&deg;. Oxford is 51.7&deg; North. Usually navigators measured the Sun and other stars and calculated latitude using reference books called almanacs.</p><p>To line up the object with the horizon you tilted the phone. On a sextant you'd move the main arm to tilt a mirror.</p>";
                //$('#message')[0].innerHTML = "<p>The angle you measured was " + this.angle.toPrecision(4).toString() + "&deg;. Navigators could use this measurement to calculate their latitude, or north/south position, often by looking it up in a book called an almanac. The North Pole is 90&deg North and the equator is 0&deg. Oxford's latitude is 51.7&deg North." +
                //"<br><br>To line up the object with the horizon you tilted the phone. On a sextant the object and horizon are lined up by moving the main arm to tilt the mirror.</p>";
                $('#message')[0].innerHTML = "<p>You have measured that the noon sun is " + this.stateModel.attributes.angle.toPrecision(3).toString() + "&deg; above the horizon. You could also measure other known celestial objects, such as the Pole Star.</p><p>To calculate latitude from this measurement, navigators would consult a reference book called an almanac.</p><p>Press the 'Calculate Latitude' button to simulate this calculation.</p>";
                $('canvas#sextant-reading').css('background-image', this.instructionsColors[this.step]); 
            },
            
            hideMessage: function () {
                var $messageDiv = $('#message')[0];
                $('#message').hide();
            },
            
            cleanup: function () {
                if (typeof cordova !== "undefined") {
                    cordova.plugins.camerapreview.stopCamera();
                }
                
                this.overlayCleanup();
            }
        });
        
        _.extend(SextantView.prototype, overlayMixin);
        
        return SextantView;
    }
);
