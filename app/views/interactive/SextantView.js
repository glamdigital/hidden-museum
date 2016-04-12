define([
        "backbone",
        "app/models/interactive/SextantModel",
        "app/views/interactive/SextantReadingView",
        "hbs!app/templates/interactive/sextant",
        "app/mixins/overlay",
        'hbs!app/templates/overlay_interactive_inner',
        "moment",
    ],
    
    function (
        Backbone, 
        SextantModel/*UNUSED*/, 
        SextantReadingView, 
        sextantTemplate, 
        overlayMixin, 
        interactiveInnerTemplate, 
        moment,
        ft /* We need to require FullTilt, but it ends up as a global object */) {
        
        //sextant arm
        ARM_PIVOT = {x:0.0, y:-0.36};  //rotation centre for the arm as proportion of width, from geometric centre
        
        SKY_BACKGROUND_SCROLL_RATE = 1000/90;
        SKY_BACKGROUND_OFFSET = 555;
        MIN_ANGLE = -20;
        DEFAULT_HORIZON = -10;
        MIN_CAPTURE_SUN_ANGLE = 25;
        
        DIAGRAM_PREROTATE_PAUSE = 500;
        DIAGRAM_PREFADE_PAUSE = 600;
        DIAGRAM_FADE = 1500;
        
        LOG_DATA = false;
        
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
                this.hasSetHorizon = false;
                this.currentDeviceOrientation = {alpha:0, beta:0, gamma:0};
                this.startingDeviceOrientation = {alpha:0, beta:0, gamma:0};
                this.angle = 0;
                this.instructions = ["<p>Hold the phone straight up in front of you and tilt it until the red line is level with the sea horizon.</p><p>Then press the 'Set Horizon' button.</p>",
                    "<ol><li>Mimic movement of the sextant arm by tilting the camera upwards</li><li>Watch for the reflected image of the sun</li><li>Line sun up with the horizon line</li><li>Press the 'Angle of the Sun' button</li></ol>",
                    "<p>You have measured that the noon sun is NN.Ndeg above the horizon.</p>But to calculate latitude from this reading navigators would need to look up the angle in a reference book called an almanac.</p><p>Press the 'Find Latitude' button to simulate looking in the almanac.</p>"];
                this.instructionsColors = ['url(img/parchment-tan.jpg)', 'url(img/parchment-tan-dark.jpg)', 'url(img/parchment-tan.jpg)'];
                var tapEnabled = true; //enable tap take /picture
                var dragEnabled = false; //enable preview box drag across the screen
                var toBack = true; //send preview box to the back of the webview
                var rect = {x: 0, y: 175, width: 380, height:280};
                
                if (typeof cordova !== 'undefined') {
                    cordova.plugins.camerapreview.startCamera(rect, "back", tapEnabled, dragEnabled, toBack);
                }
                
                $('#content').css("background-color", "transparent");
                this.startingDeviceOrientation = { beta: 90 + DEFAULT_HORIZON };
                this.startTrackingOrientation();
                
                this.overlayInitialize({ displayOnArrival: true });
                this.overlaySetTemplate(interactiveInnerTemplate, this.model.toJSON());
                
                
                //calculate the midday sun height for today's date
                this.sunElevation = this.calculateSunElevation();
                
                getSunElevation = this.calculateSunElevation;
            },
                        
            afterRender: function () {
                this.setup();
                
                //create the view for the reading
                this.readingView = new SextantReadingView({
                    el: '#sextant-reading',
                    stateModel: this.stateModel
                });
                this.readingView.render();
            },
            
            setup: function () {
                this.displayInstructions(0);
                setSextantArmAngle(0);
                this.stateModel.set({angle: 0});
                this.hideMessage();
                this.showHorizonIndicator();
                this.angle = 0;
                $(window).on('deviceorientation', this, _.bind(this.deviceOrientationHandler, this));
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
                        this.horizonOrientation = this.currentDeviceOrientation;
                        
                        this.displayInstructions();
                        break;
                    
                    case 1:
                        this.step = 2;
                        this.stopTrackingOrientation(ev);
                        $('#main-button').hide();
                        this.showDiagram();
                        this.hideHorizonIndicator();
                        $('#captured-image').css("background-image", "none");
                        $target.text("Calculate Latitude");
                        break;
                        
                    case 2:
                        this.step = 3;
                        // this.hideDiagram();
                        this.showMessage();
                    
                    case 3:
                        this.step = 0;
                        Backbone.history.navigate('#/interact/' + this.item.attributes.slug + '/' + this.item.attributes.type + '/1');
                        break;
                }
            },
            
            startTrackingOrientation: function (ev) {
                //this.startingDeviceOrientation = null;
                this.isTrackingOrientation = true;
            },
            
            stopTrackingOrientation: function (ev) {
                this.isTrackingOrientation = false;
                $(window).off('deviceorientation', _.bind(this.deviceOrientationHandler, this));
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
            
            updateOrientationIndicator: function() {
                if(this.hasSetHorizon) {
                    this.angle = this.currentDeviceOrientation.beta - this.horizonOrientation.beta;
                    
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
                
                //setSextantArmAngle(this.angle);
                //this.setLatitudeIndicator($('#value-indicator')[0], "Latitude", this.angle);
                
                var skyAngle = this.currentDeviceOrientation.beta - this.startingDeviceOrientation.beta;
                
                if(skyAngle < MIN_ANGLE) {
                    skyAngle = MIN_ANGLE;
                }
                
                var skyOffsetY = skyAngle * SKY_BACKGROUND_SCROLL_RATE + SKY_BACKGROUND_OFFSET;
                $('#sky').css('background-position-y', skyOffsetY + 'px');
                
                
                
                var sunRelAng = (this.sunElevation * Math.PI/180) - skyAngle;
                var sunHeight = sunRelAng * SKY_BACKGROUND_SCROLL_RATE + SKY_BACKGROUND_OFFSET;
                
                if(LOG_DATA) {
                    console.log('skyAngle: ', skyAngle);
                    console.log('sunAngle: ', this.sunElevation);
                    console.log('sunHeight: ', sunHeight);
                }
                
                $('#sun').css('bottom', sunHeight + 'px');
                
                //Attempt to scan left/right a little. Doesn't work well, as roll adds to gamma.
                // If we can use something like FullTilt to transform the orientations so that they are based around
                // device being upright, rather than device being flat, this may be worth reinstating.
                // Applying such a transform would also hopefully alleviate the 'pop' at alpha ~= 90 when the device is rolled slightly

                //var skyOffsetX = this.currentDeviceOrientation.gamma * SKY_BACKGROUND_SCROLL_RATE + 500;
                //$('#sky').css('background-position-x', skyOffsetX + 'px');
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
            
            showDiagram: function () {
                $('canvas#sextant-reading').css('background-image', this.instructionsColors[this.step]); 
                $('#message').show();
                
                
                EYE_X = 0.8;
                MIRROR_1_X = 0.36;
                MIRROR_1_Y = 0.5;
                MIRROR_2_X = 0.48;
                MIRROR_2_Y = 0.41;
                // EYE_X = 1;
                // MIRROR_1_X = 0.3;
                // MIRROR_1_Y = 0.5;
                // MIRROR_2_X = 0.48;
                // MIRROR_2_Y = 0.25;
                
                var angle = 0;
                var delay = DIAGRAM_PREROTATE_PAUSE;
                
                var $canvas = $('#sextant-lines'); 
                var canvas = $canvas[0];
                canvas.width = $canvas.width();
                canvas.height = $canvas.height();
                
                var sunDist = 150;
                var sunAngleMeasuredRad = this.stateModel.attributes.angle * Math.PI/180;
                
                this.animateTimeout = setInterval(function () {
                    
                    
                    
                    //update line on the canvas
                    var canvas = $('#sextant-lines')[0];
                    var eyex = EYE_X * canvas.width;
                    var mirror1x = MIRROR_1_X * canvas.width;
                    var mirror1y = eyey = MIRROR_1_Y * canvas.height;
                    var mirror2x = MIRROR_2_X * canvas.width;
                    var mirror2y = MIRROR_2_Y * canvas.height;
                    
                    var sunAngleRad = angle * Math.PI/180;
                    var dirX = mirror2x - (sunDist-15) * Math.cos(sunAngleRad);
                    var dirY = mirror2y - (sunDist-15) * Math.sin(sunAngleRad);
                    
                    var ctx = canvas.getContext('2d');
                    
                    
                    
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                    

                    //lines
                    ctx.beginPath();
                    ctx.moveTo(eyex, mirror1y);
                    ctx.lineTo(mirror1x, mirror1y);
                    ctx.lineTo(mirror2x, mirror2y);
                    ctx.lineTo(dirX, dirY);
                                        
                    // ctx.strokeStyle.width = 5;
                    ctx.strokeStyle="#ff0000";
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
                    
                    
                    
                    
                    if(delay > 0) { delay -= 10; }
                    
                    else if(angle <= this.stateModel.attributes.angle) {
                        angle += 0.5;
                        setSextantArmAngle(angle);
                        // console.log('new angle = ', angle);
                        
                    } else {
                        setTimeout(function () {
                            // $('.sextant-diagram').fadeTo(DIAGRAM_FADE, 0.2, this.showMessage.bind(this));
                        }.bind(this), DIAGRAM_PREFADE_PAUSE);
                        // clearInterval(this.animateTimeout);
                    }
                }.bind(this), 100);
            },
            
            showMessage: function () {
                //$('#message')[0].innerHTML = "<p>The angle you measured was "  + this.angle.toPrecision(4).toString() + "&deg;. If the object you lined up had been the Pole Star, the angle would be the same as your latitude. The Pole Star is 90&deg; above the horizon at the North Pole, which has a latitude of 90&deg; North. The star appears right on the horizon at the equator, at 0&deg;. Oxford is 51.7&deg; North. Usually navigators measured the Sun and other stars and calculated latitude using reference books called almanacs.</p><p>To line up the object with the horizon you tilted the phone. On a sextant you'd move the main arm to tilt a mirror.</p>";
                //$('#message')[0].innerHTML = "<p>The angle you measured was " + this.angle.toPrecision(4).toString() + "&deg;. Navigators could use this measurement to calculate their latitude, or north/south position, often by looking it up in a book called an almanac. The North Pole is 90&deg North and the equator is 0&deg. Oxford's latitude is 51.7&deg North." +
                //"<br><br>To line up the object with the horizon you tilted the phone. On a sextant the object and horizon are lined up by moving the main arm to tilt the mirror.</p>";
                $('#message-text')[0].innerHTML = "<p>You have measured that the noon sun is " + this.stateModel.attributes.angle.toPrecision(3).toString() + "&deg; above the horizon. You could also measure other known celestial objects, such as the Pole Star.</p><p>To calculate latitude from this measurement, navigators would consult a reference book called an almanac.</p><p>Press the 'Calculate Latitude' button to simulate this calculation.</p>";
                $('#main-button').hide();
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
                                
                //declination
                //declination = -23.44 * cos[ 36/365 * (N+10)]
                
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
                if (typeof cordova !== "undefined") {
                    cordova.plugins.camerapreview.stopCamera();
                }
                
                this.stopTrackingOrientation(null);
                
                this.overlayCleanup();
            }
        });
        
        _.extend(SextantView.prototype, overlayMixin);
        
        return SextantView;
    }
);
