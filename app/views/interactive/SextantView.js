define([
        "backbone",
        "app/models/interactive/SextantModel",
        "app/views/interactive/SextantReadingView",
        "hbs!app/templates/interactive/sextant",
        "app/mixins/overlay",
        'hbs!app/templates/overlay_interactive_inner',
        'app/media',
        "moment",
    ],
    
    function (
        Backbone, 
        SextantModel/*UNUSED*/, 
        SextantReadingView, 
        sextantTemplate, 
        overlayMixin, 
        interactiveInnerTemplate, 
        mediaUtil,
        moment,
        ft /* We need to require FullTilt, but it ends up as a global object */) {
        
        //sextant arm
        ARM_PIVOT = {x:0.0, y:-0.3};  //rotation centre for the arm as proportion of width, from geometric centre
        
        SKY_BACKGROUND_SCROLL_RATE = 1000/90;
        SKY_BACKGROUND_OFFSET_TABLET = 1220;
        SKY_BACKGROUND_OFFSET = 555;
        MIN_ANGLE = -33;
        DEFAULT_HORIZON = -10;
        MIN_CAPTURE_SUN_ANGLE = 10;
        
        LOG_NEXT_EV = false;
        
        DIAGRAM_PREROTATE_PAUSE = 700;
        DIAGRAM_ROTATE_TIME = 3;    //in seconds
        DIAGRAM_PREFADE_PAUSE = 600;
        DIAGRAM_FADE = 1500;
        
        LOG_DATA = false;
        DRAW_RAYS = true;
        MOVE_ARM = false;
        
        SKY_OFFSET_SCALE = 1;
        SKY_OFFSET_0 = 150;
        
        SUN_OFFSET = 0;
        DRAW_SKY = true;
        SUN_X = 0;
        SUN_Y = 0;
        
        setSextantArmAngle = function (a) {
            var setImageAngle = function (deg, selector) {
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
                
                $(selector).css('-webkit-transition', '-webkit-transform ' + DIAGRAM_ROTATE_TIME + 's ease-in-out')
                $(selector).css("transform", matrix);
            }
            
            setImageAngle(a, '#sextant-arm');
            setImageAngle(2*a, '#sextant-ray');
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
                this.lowPassResults = 0;
                this.deviceInitialMotionZPositive = null;
                this.step = 0;
                this.isTrackingOrientation = false;
                this.isTrackingMotion = false;
                this.hasSetHorizon = false;
                this.currentDeviceOrientation = {alpha:0, beta:0, gamma:0};
                this.startingDeviceOrientation = {alpha:0, beta:0, gamma:0};
                this.angle = 0;
                this.instructions = [
                    "<p>Hold the phone straight up in front of you and tilt it until the red line is level with the sea horizon. Then press the 'Set Horizon' button.</p>",
                    
                    "<ol>" + 
                    "<li>Mimic movement of the sextant arm by tilting the camera upwards</li>" +
                     
                    "<li>Watch for the reflected sun image</li>" + 
                    
                    "<li>Line sun up with the horizon line</li>" + 
                    "<li>Press the 'Angle of the Sun' button</li>" + 
                    "</ol>",
                    
                    "<p>You have measured that the noon sun is NN.N&deg above the horizon.</p><p>But to calculate latitude from this reading, navigators would need to look up the angle in a reference book called an almanac.</p><p>Press the 'Find Latitude' button to simulate looking in the almanac.</p>"];
                
                this.instructionsColors = ['url(img/objects/sextant/parchment-tan.jpg)', 'url(img/objects/sextant/parchment-tan-dark.jpg)', 'url(img/objects/sextant/parchment-tan.jpg)'];
                
                $('#content').css("background-color", "transparent");
                this.startingDeviceOrientation = { beta: 90 + DEFAULT_HORIZON };
                this.startTrackingOrientation();
                
                this.overlayInitialize({ displayOnArrival: true });
                this.overlaySetTemplate(interactiveInnerTemplate, this.model.toJSON());
                
                
                //calculate the midday sun height for today's date
                this.sunElevation = this.calculateSunElevation();
                
                this.scrollSky = true;
                
                getSunElevation = this.calculateSunElevation;
                $("body").addClass("transparent-background");
                
                //sounds
                this.moveSound = mediaUtil.createAudioObj('audio/sextant/sextant_move.mp3');
                this.clickSound = mediaUtil.createAudioObj('audio/sextant/click.mp3');
                this.oceanSound = mediaUtil.createAudioObj('audio/sextant/ocean.mp3');
                this.turnPageSound = mediaUtil.createAudioObj('audio/sextant/turn_page.mp3');
            },
                        
            afterRender: function () {
                this.oceanSound.play();
                this.oceanInterval = setInterval(function() {
                  this.oceanSound.play();
                }.bind(this), 60000);

                if (this.$el[0].clientWidth >= 768) {
                  this.sky_background_offset = SKY_BACKGROUND_OFFSET_TABLET;
                } else {
                  this.sky_background_offset = SKY_BACKGROUND_OFFSET;
                }
                
                this.setup();
                
                //create the view for the reading
                this.readingView = new SextantReadingView({
                    el: '#sextant-reading',
                    stateModel: this.stateModel
                });
                this.readingView.render();
                
                //set up the canvas clip path
                var $canvas = $('#sky-canvas');
                var c = $canvas[0];
                c.width = $canvas.width();
                c.height = $canvas.height();
                
                var ctx = c.getContext('2d');
                ctx.arc(c.width/2, c.height/2, (c.height-30)/2, 0, 2*Math.PI);
                ctx.closePath();
                ctx.clip();
                               
                //initialise camera preview
                if (typeof cordova !== 'undefined') {
                    var tapEnabled = true; //enable tap take /picture
                    var dragEnabled = false; //enable preview box drag across the screen
                    var toBack = true; //send preview box to the back of the webview
                    var $viewfinder = $('#viewfinder');
                    if(device && device.platform.toLowerCase() === "android") {
                      var contentHeight = $("#content").outerHeight();
                      var sumHeight = $("#instructions").outerHeight() + $("#viewfinder").outerHeight();
                      sumHeight += $("#feedback").outerHeight() + $("#controls").outerHeight();
                      // in some android devices there is a gap between the viewfinder and the feedback div
                      // the instructions div becomes bigger in these devices
                      if (sumHeight < contentHeight) {
                        $("#instructions").outerHeight($("#instructions").outerHeight() + contentHeight - sumHeight);
                        $("#instructions").css({"font-size": "1em"});
                      }
                      // for android devices the position of the mask is relative to the screen's top-left
                      // so we have to calculate the top value of the mask
                      var yMaskPos = $("#prheader").height() + $("#instructions").height() + 110;
                    }
                    CameraPreview.startCamera({
                      x: 0, 
                      y: $viewfinder.offset().top, 
                      width: $viewfinder.width(), 
                      height: $viewfinder.height(),
                      camera: "back",
                      tapPhoto: true,
                      previewDrag: true,
                      toBack: true
                    });
                }
            },
            
            setup: function () {
                this.displayInstructions(0);
                setSextantArmAngle(0);
                this.stateModel.set({angle: 0});
                this.hideMessage();
                this.showHorizonIndicator();
                this.angle = 0;
                
                //don't use jquery to bind motion event. It doesn't seem to work on moto g
                window.ondevicemotion = this.deviceMotionHandler.bind(this);
            },
            
            toggleButtonHandler: function (ev) {
                var $target = $(ev.target);
              
                switch (this.step) {
                    case 0:
                        this.clickSound.play();
                        this.step = 1;
                        $target.text("Angle of the Sun");
                        if (typeof cordova !== 'undefined') {
                            $target.css('visibility', 'hidden');
                        }
                        this.takeHorizonImage(ev);
                        this.hasSetHorizon = true;
                        //grab the current orientation as the initial orientation
                        this.horizonDeviceAngle = this.currentDeviceAngle;
                        
                        this.displayInstructions();
                        break;
                    
                    case 1:
                        this.clickSound.play();
                        this.step = 2;
                        this.stopTrackingOrientation(ev);
                        $('#main-button').css('visibility', 'hidden');
                        this.showDiagram();
                        this.hideHorizonIndicator();
                        $('#captured-image').css("background-image", "none");
                        $target.text("Find Latitude");
                        break;
                        
                    case 2:
                        this.turnPageSound.setTime(0);
                        this.turnPageSound.play();
                          this.step = 3;
                          this.showMessage();
                    case 3:
                        setTimeout(function () {
                          this.step = 0;
                          Backbone.history.navigate('#/interact/' + this.item.attributes.slug + '/' + this.item.attributes.type + '/1');
                        }.bind(this), 522);
                        break;
                }
            },
            
            startTrackingOrientation: function (ev) {
                 this.isTrackingMotion = true;
            },
            
            stopTrackingOrientation: function (ev) {
                this.isTrackingOrientation = false;
                this.isTrackingMotion = false;
                window.ondevicemotion = null;
            },
            
            deviceOrientationHandler: function (ev) {
                if (this.isTrackingOrientation == true) {
                    if (this.startingDeviceOrientation == null) {
                        this.startingDeviceOrientation = ev.originalEvent;
                    }
                    
                    this.currentDeviceOrientation = ev.originalEvent;
                    this.updateOrientationIndicator();
                }
            },
            
            deviceMotionHandler: function (ev) {
                if(ev.originalEvent) { ev = ev.originalEvent; }
                if (this.isTrackingMotion == true) {
                    if (this.startingDeviceMotion = null) {
                        this.startingDeviceMotion = ev;
                    }
                    
                    this.currentDeviceMotion = ev;                    
                    this.updateOrientationFromMotion();
                    this.updateOrientationIndicator();
                }
            },
                        
            updateOrientationIndicator: function() {
                if(this.hasSetHorizon) {
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
                        $button.css('visibility', 'visible');
                    }
                }
                
                var skyAngle = this.currentDeviceAngle;
                
                if(skyAngle < MIN_ANGLE) {
                    skyAngle = MIN_ANGLE;
                }
                
                if(this.scrollSky) {
                    var skyOffsetY = skyAngle * SKY_BACKGROUND_SCROLL_RATE + this.sky_background_offset;
                    // on android devices the left part of the captured image is transparent
                    // so the left part of the sky should stop moving 
                    
                    var $canvas = $('#sky-canvas');
                    var c = $canvas[0];
                    var ctx = c.getContext('2d');
                    var img = $('#sky-img')[0];
                    
                    var skyYPos = -img.height + SKY_OFFSET_0 + skyOffsetY*SKY_OFFSET_SCALE;
                    
                    if(DRAW_SKY) {
                        if (this.step == 0) {
                            //clear whole screen and draw full sea
                            ctx.clearRect(0,0, c.width, c.height);
                            ctx.drawImage(img, 0, skyYPos);
                        } else {
                            // clear and draw right half only
                            ctx.clearRect(c.width/2, 0, c.width, c.height);
                            ctx.drawImage(img, 
                                          c.width/2, 0, 
                                          c.width/2, img.height, 
                                          c.width/2, skyYPos,
                                          c.width/2, img.height);
                        }
                    }
                    
                    var sunRelAng = this.sunElevation - skyAngle;
                    var sunHeight = sunRelAng * SKY_BACKGROUND_SCROLL_RATE + $('#sun').height()/2;
                    
                    if(LOG_DATA) {
                        console.log('skyAngle: ', skyAngle);
                        console.log('sunAngle: ', this.sunElevation);
                        console.log('sunHeight: ', sunHeight);
                    }
                    
                    var sunimg = $('#sun-img')[0];
                    
                    sunYPos = SUN_OFFSET - SKY_OFFSET_SCALE * sunHeight;
                    console.log('sunrelang', sunRelAng);
                    console.log('sunYPos', sunYPos);
                    
                    if(SUN_X == 0) {
                        SUN_X = c.width * 0.5;
                    }
                    
                    ctx.drawImage(sunimg, SUN_X, SUN_Y || sunYPos);
                    
                }
                
                //Attempt to scan left/right a little. Doesn't work well, as roll adds to gamma.
                // If we can use something like FullTilt to transform the orientations so that they are based around
                // device being upright, rather than device being flat, this may be worth reinstating.
                // Applying such a transform would also hopefully alleviate the 'pop' at alpha ~= 90 when the device is rolled slightly
            },
            
            updateOrientationFromMotion: function () {
                var gravity = {
                    x: this.currentDeviceMotion.accelerationIncludingGravity.x - this.currentDeviceMotion.acceleration.x,
                    y: this.currentDeviceMotion.accelerationIncludingGravity.y - this.currentDeviceMotion.acceleration.y,
                    z: this.currentDeviceMotion.accelerationIncludingGravity.z - this.currentDeviceMotion.acceleration.z,
                };
                // on (most?) android devices the gravity.z value is positive when holding the device face up
                // check the gravity.z when the values are read for the first time, if it is positive it will be inverted
                
                if(typeof(device) !== 'undefined' && device.platform.toLowerCase() === "android") {
                  if (this.deviceInitialMotionZPositive == null) {
                    this.deviceInitialMotionZPositive = (gravity.z > 0) ? true : false ;
                  }
                  if(this.deviceInitialMotionZPositive) {
                    gravity.z = -1 * gravity.z;
                  }
                }
                var gDotY = gravity.z / Math.sqrt(gravity.x * gravity.x + gravity.y * gravity.y + gravity.z * gravity.z);
                var angleRad = Math.acos(gDotY);
                
                angleRad = Math.PI - angleRad;
                                
                var angleDeg = angleRad * 180/Math.PI;
                this.lowPassResults = (.1 * angleDeg) + (.9 * this.lowPassResults);
                if(LOG_NEXT_EV) {
                    console.log('gravity: ', gravity);
                    console.log('angle: ', angleDeg);
                    LOG_NEXT_EV = false;
                }
                
                this.currentDeviceAngle = this.lowPassResults - 90;
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
                    navigator.screenshot.URI(function(error,res){
                        if (error) {
                            console.error(error);
                        } else {
                            console.log('screenshot ok', res.filePath);
                            if(device && device.platform.toLowerCase() === "android") {
                              // if the device is android the screenshot doesn't include camera preview
                              // instead this area is black, so it is converted to transparent
                              res.URI = this.imageBlackToTransparent(res.URI);
                            } 
                            $('#captured-image').css("background", "url(" + res.URI + ")");
                            // Must equal the display width exactly otherwise scaling will blur the image
                            // and it will be impossible to set the position-y offset correctly.
                            $('#captured-image').css("background-size", $(window).width() + "px");
                            var offset = -$('#captured-image').offset().top;
                            $('#captured-image').css("background-position-y", offset + "px");
                            $('#alignment-indicator').hide();
                            
                            //suspend scrolling for a moment, so that the rendering can catch up and show the screenshot.
                            this.scrollSky = false;
                            setTimeout(function () {
                                this.scrollSky = true;
                            }.bind(this), 500);
                        }
                    }.bind(this));
                }
                
                //now further clip the canvas to only draw the right hand side
                var $canvas = $('#sky-canvas');
                var c = $canvas[0];
                var ctx = c.getContext('2d');
                ctx.rect(c.width/2, 0, c.width/2, c.height);
                ctx.clip();
            },
            
            imageBlackToTransparent: function (uri) {
                var img = new Image;
                img.src = uri;
                var canvas = document.createElement("canvas");
                var ctx = canvas.getContext("2d");
                var originalPixels = null;
                var currentPixels = null;
                canvas.width = img.width;
                canvas.height = img.height;
                ctx.drawImage(img, 0, 0, img.naturalWidth, img.naturalHeight, 0, 0, img.width, img.height);
                originalPixels = ctx.getImageData(0, 0, img.width, img.height);
                currentPixels = ctx.getImageData(0, 0, img.width, img.height);
                for(var i = 0, l = originalPixels.data.length; i < l; i += 4) {
                  // if r,g,b values are all low then the color is close to black-> make it transparent
                  if ((currentPixels.data[i] < 50) && (currentPixels.data[i + 1] < 50) && (currentPixels.data[i + 2] < 50)) {
                    currentPixels.data[i + 3] = 0;
                  }
                }
                ctx.putImageData(currentPixels, 0, 0);
                return canvas.toDataURL("image/png");
            },
            
            displayInstructions: function () {
                var $instructionsDiv = $('#instructions')[0];
                $instructionsDiv.innerHTML = this.instructions[this.step];
                $($instructionsDiv).css('background-image', this.instructionsColors[this.step]);
                $('canvas#sextant-reading').css('background-image', this.instructionsColors[this.step]); 
            },
            
            showDiagram: function () {
                $('canvas#sextant-reading').css('background-image', this.instructionsColors[this.step]); 
                $('#message').show();
                
                var screenHeight = window.windowHeight;
                var feedbackTop = $('#feedback').offset().top;
                var messageTop = $('#message').offset().top;
                var padding = 5;
                var messageHeight = feedbackTop - messageTop - 2*padding;
                $('#message').height(messageHeight);
                
                //show animation on desktop
                if (typeof cordova == 'undefined') {
                    this.stateModel.set({angle:45});
                }
                
                EYE_X = 0.65;
                MIRROR_1_X = 0.433;
                MIRROR_1_Y = 0.64;
                MIRROR_2_X = 0.5;
                MIRROR_2_Y = 0.57;

                //set up the dimensions and position of the canvas, so that the drawn lines correspond with the image correctly
                var $canvas = $('#sextant-lines'); 
                var $frameImg = $('#sextant-frame');
                var frameHeight = $frameImg.height();
                var frameWidth = $frameImg.width();
                var frameTop = parseInt($frameImg.css('top'));
                var frameLeft = 0;
                
                //make the canvas 3x the width and double the height of the image
                var canvasHeight = frameHeight*2;
                $canvas.height(canvasHeight);
                $canvas.css('top', frameTop - frameHeight + 'px');
                
                var canvasWidth = frameWidth*3;
                $canvas.width(canvasWidth);
                $canvas.css('left', frameLeft - frameWidth + 'px');
                
                var canvas = $canvas[0];
                canvas.width = canvasWidth;
                canvas.height = canvasHeight;
                
                
                
                this.drawDiagramGeometry();
                
                
                this.animateTimeout = setInterval(function () {
                    this.moveSound.play();
                    setSextantArmAngle(this.stateModel.attributes.angle);
                                        
                    this.fadeTimeout = setTimeout(function () {
                        $('.sextant-diagram').fadeTo(DIAGRAM_FADE, 0.2, this.showMessage.bind(this));
                        clearInterval(this.soundTimeout);
                    }.bind(this), DIAGRAM_PREFADE_PAUSE + 1000 * DIAGRAM_ROTATE_TIME);
                    clearInterval(this.animateTimeout);
                }.bind(this), DIAGRAM_PREROTATE_PAUSE);
            },
            
            //draw the non-moving parts of the image:
            // - eye
            // - sun
            // - rays as far as the second mirror
            drawDiagramGeometry: function () {
                var canvas = $('#sextant-lines')[0];
                var ctx = canvas.getContext('2d');

                ctx.clearRect(0, 0, canvas.width, canvas.height);
                
                var sunDist = 150;
                var sunAngleMeasuredRad = this.stateModel.attributes.angle * Math.PI/180;

                var eyex = EYE_X * canvas.width;
                var mirror1x = MIRROR_1_X * canvas.width;
                var mirror1y = eyey = MIRROR_1_Y * canvas.height;
                var mirror2x = MIRROR_2_X * canvas.width;
                var mirror2y = MIRROR_2_Y * canvas.height;
                
                var dirX = mirror2x - (sunDist-25) * Math.cos(sunAngleMeasuredRad);
                var dirY = mirror2y - (sunDist-25) * Math.sin(sunAngleMeasuredRad);

                //lines
                ctx.beginPath();
                ctx.moveTo(eyex, mirror1y);
                ctx.lineTo(mirror1x, mirror1y);
                ctx.lineTo(mirror2x, mirror2y);
                ctx.strokeStyle="#aa0000";
                ctx.lineWidth = 1;
                ctx.stroke();
                
                //sun
                ctx.beginPath();
                var sunX = mirror2x - sunDist * Math.cos(sunAngleMeasuredRad);
                var sunY = mirror2y - sunDist * Math.sin(sunAngleMeasuredRad);
                ctx.arc(sunX, sunY, 10, 0, Math.PI*2);
                ctx.strokeStyle = "#000000";
                ctx.lineWidth = 3;
                ctx.stroke();
                
                
                //rays
                ctx.beginPath();
                var numRays = 9;
                var innerRad = 15;
                var outerRad = 20;
                
                for(var i =0; i<numRays; i++) {
                    var theta = i*2*Math.PI/(numRays);
                    ctx.moveTo(sunX + innerRad*Math.cos(theta), sunY + innerRad*Math.sin(theta));
                    ctx.lineTo(sunX + outerRad*Math.cos(theta), sunY + outerRad*Math.sin(theta));
                }
                ctx.stroke();
                
                //eye
                ctx.beginPath();
                var eyeWidth = 20;
                var eyeOffset = 50;
                var eyeAngle = 30 * Math.PI/180;
                var eyePupilAngle = 10 * Math.PI/180;
                var pupilRadius = 10;
                //'lids'
                
                var eyeOriginX = eyex + eyeOffset;
                ctx.moveTo(eyeOriginX, eyey);
                ctx.lineTo(eyeOriginX - eyeWidth*1.4*Math.cos(eyeAngle), eyey - eyeWidth*1.4*Math.sin(eyeAngle));
                ctx.moveTo(eyeOriginX, eyey);
                ctx.lineTo(eyeOriginX - eyeWidth*1.4*Math.cos(eyeAngle), eyey + eyeWidth*1.4*Math.sin(eyeAngle));
                ctx.lineWidth = 2;
                ctx.stroke();
                
                //cornea
                ctx.beginPath();
                ctx.arc(eyeOriginX, eyey, eyeWidth, Math.PI-eyeAngle, Math.PI+eyeAngle);
                ctx.stroke();
            },
            
            showMessage: function () {
                
                //set height of message div                
                $('#message-text')[0].innerHTML = this.instructions[2].replace("NN.N", this.stateModel.attributes.angle.toPrecision(3).toString());                
                $('#main-button').css('visibility', 'visible');

            },
            
            hideMessage: function () {
                var $messageDiv = $('#message')[0];
                $('#message').hide();
            },
            
            calculateSunElevation: function (params) {
                // cos(solarZenith) = sin(solarElevation) = sin(latitude)*sin(declination) + cos(latitude)*cos(declination)*cos(hour angle)
                // at noon, solar hour angle is 0, so we have simply:
                //      cos(solarZenith) = sin(solarElevation) = sin(latitude)*sin(declination) + cos(latitude)*cos(declination)
                
                params = params || {};
                
                //latitude in oxford
                var latitudeDeg = params.lat || 51.7520;
                var latitudeRad = latitudeDeg * Math.PI / 180;
                
                //get days since jan the first
                var today = params.date || moment();
                var days = today.dayOfYear();
                
                console.log('day of year: ', days);
                
                var declinationDeg = -23.44 * Math.cos( (2 * Math.PI /365) * (days + 10) );
                var declinationRad = declinationDeg * Math.PI / 180;
                
                console.log('declination: ', declinationDeg);
                
                var sinLat = Math.sin(latitudeRad);
                var cosLat = Math.cos(latitudeRad);
                var sinDec = Math.sin(declinationRad);
                var cosDec = Math.cos(declinationRad);
                var sinElevation = sinLat * sinDec + cosLat * cosDec;
                var solarElevationRad = Math.asin(sinElevation);
                
                
                
                var solarElevationDeg = solarElevationRad * 180 / Math.PI;
                
                console.log('elevation: ', solarElevationDeg);
                
                return solarElevationDeg;
                
            },
            
            cleanup: function () {
                this.moveSound.cleanup();
                this.clickSound.cleanup();
                this.oceanSound.cleanup();
                this.turnPageSound.cleanup();
                clearInterval(this.oceanInterval);
                $("body").removeClass("transparent-background");

                if (typeof cordova !== "undefined") {
                    // cordova.plugins.camerapreview.stopCamera();
                    CameraPreview.stopCamera();
                    
                }
                
                this.stopTrackingOrientation(null);
                
                this.overlayCleanup();
                
                clearInterval(this.animateTimeout);
                clearTimeout(this.fadeTimeout);
            }
        });
        
        _.extend(SextantView.prototype, overlayMixin);
        
        return SextantView;
    }
);
