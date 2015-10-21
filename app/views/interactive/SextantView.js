define([
        "backbone",
        "app/models/interactive/SextantModel",
        "app/views/interactive/SextantReadingView",
        "hbs!app/templates/interactive/sextant",
    ],
    function(Backbone, SextantModel, SextantReadingView, sextantTemplate) {

        //sextant arm
        armPivot = {x:0.0, y:-0.36};  //rotation centre for the arm as proportion of width, from geometric centre

	    spinAngle = 0;

        SKY_BACKGROUND_SCROLL_RATE = 1000/90;
        SKY_BACKGROUND_OFFSET = 555;
        MIN_ANGLE = -20;

	    setSextantArmAngle = function (deg) {
            var armAngle = deg/2
		    var rad = armAngle * Math.PI / 180;
		    var r00 = Math.cos(rad);
		    var r11 = r00;
		    var r01 = -Math.sin(rad);
		    var r10 = -1 * r01;
		    var width = $('#sextant-arm').width();
		    var x = armPivot.x * width;
		    var y = armPivot.y * width;
		    var tx = x - r00*x - r01*y;
		    var ty = y - r10*x -r11*y;

		    var matrix = "matrix(" + r00 + "," + r10 + "," + r01 + "," + r11 + "," + tx + "," + ty + ")";
		    $('#sextant-arm').css("transform", matrix);
	    };

	    spinSextantArm = function(angle) {
		    spinAngle += 0.5;
		    setSextantArmAngle(spinAngle);
		    setTimeout(spinSextantArm, 2);
	    };

    var SextantView = Backbone.View.extend({
        template: sextantTemplate,

        events: {
          "click .toggle": "toggleButtonHandler"
        },

        serialize: function() {
            var out = {};
            out.instructions = this.instructions[0];
            return out;
        },

        initialize: function(params) {
            this.item = params.item;
            this.step = 0;
            this.isTrackingOrientation = false;
            this.hasSetHorizon = false;
            this.currentDeviceOrientation = {alpha:0, beta:0, gamma:0};
            this.startingDeviceOrientation = {alpha:0, beta:0, gamma:0};
            this.angle = 0;
            this.instructions = ["<ol><li>Hold the phone straight up in front of you so the red line is level with with the sea horizon</li><li>Press the 'Set Horizon' button</li></ol>",
                "<ol><li>Slowly tilt the camera towards the ceiling and watch for an image of the sun</li><li>Line up the sun with the horizon line</li><li>Press the 'Capture the Angle of the Sun' button</li></ol>",
                "<p>This mimics a reading of the Pole Star, where the angle is the same as your latitude. For the Sun or other bodies you would need an almanac to get a latitude from the angle</p>"];
            this.instructionsColors = ['url(img/parchment-tan.jpg)', 'url(img/parchment-green.jpg)', 'url(img/parchment-red.jpg)'];
            var tapEnabled = true; //enable tap take picture
            var dragEnabled = false; //enable preview box drag across the screen
            var toBack = true; //send preview box to the back of the webview
            var rect = {x: 0, y: 175, width: 380, height:280};
	        if(typeof(cordova) !== 'undefined') {
		        cordova.plugins.camerapreview.startCamera(rect, "back", tapEnabled, dragEnabled, toBack);
	        }
            $('#content').css("background-color", "transparent");
            this.startingDeviceOrientation = { beta: 90 };
            this.startTrackingOrientation();
        },
        afterRender: function() {
            this.setup();

            //create the view for the reading
            this.readingView = new SextantReadingView({
                el: '#sextant-reading',
                model: this.model
            });
            this.readingView.render();

        },
        setup: function() {        
            this.displayInstructions(0);
            setSextantArmAngle(0);
            this.model.set({angle: 0});
            this.hideMessage();
            this.showHorizonIndicator();
            this.angle = 0;       
            $(window).on('deviceorientation', this, _.bind(this.deviceOrientationHandler, this));
        },
        toggleButtonHandler: function(ev) {
            var $target = $(ev.target);
            switch (this.step) {
                case 0: {
                    this.step = 1;                           
                    $target.text("Set Angle of Sun");
                    this.takeHorizonImage(ev);
                    this.hasSetHorizon = true;
                    //this.startTrackingOrientation(ev);
                    //grab the current orientation as the initial orientation
                    //this.startingDeviceOrientation = this.currentDeviceOrientation;
                    this.horizonOrientation = this.currentDeviceOrientation;

                    this.displayInstructions();
                    break;
                }        
                case 1: {
                    this.step = 2;
                    this.stopTrackingOrientation(ev);
                    this.showMessage();
                    this.hideHorizonIndicator();
                    $('#captured-image').css("background-image", "none");
                    $target.text("Calculate Latitude");
                    break;
                }
                case 2: {
                    this.step = 0;
                    Backbone.history.navigate('#/interact/' + this.item.attributes.slug + "/1");
                }
            }
        },
        startTrackingOrientation: function(ev) {           
            //this.startingDeviceOrientation = null;
            this.isTrackingOrientation = true;            
        },
        stopTrackingOrientation: function(ev) {
            this.isTrackingOrientation = false;
            $(window).off('deviceorientation', _.bind(this.deviceOrientationHandler, this));
        },
        deviceOrientationHandler: function(ev) {
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

                //set the angle on the model
                this.model.set({angle: this.angle});
            }

 	        //setSextantArmAngle(this.angle);
            //this.setLatitudeIndicator($('#value-indicator')[0], "Latitude", this.angle);

            var skyAngle = this.currentDeviceOrientation.beta - this.startingDeviceOrientation.beta;
            var skyOffsetY = skyAngle * SKY_BACKGROUND_SCROLL_RATE + SKY_BACKGROUND_OFFSET;
            $('#sky').css('background-position-y', skyOffsetY + 'px');


            //Attempt to scan left/right a little. Doesn't work well, as roll adds to gamma.
            // If we can use something like FullTilt to transform the orientations so that they are based around
            // device being upright, rather than device being flat, this may be worth reinstating.
            // Applying such a transform would also hopefully alleviate the 'pop' at alpha ~= 90 when the device is rolled slightly

            //var skyOffsetX = this.currentDeviceOrientation.gamma * SKY_BACKGROUND_SCROLL_RATE + 500;
            //$('#sky').css('background-position-x', skyOffsetX + 'px');
        },
        showHorizonIndicator: function() {
             $('#alignment-indicator').show();
        },
        hideHorizonIndicator: function() {
             $('#alignment-indicator').hide();
        },
        takeHorizonImage: function(ev) {
		//capture the screen, rather than taking an actual photo, since this is much faster.
	          if(typeof(navigator.screenshot) !== 'undefined') {
		          navigator.screenshot.save(function (error, res) {
			          if (error) {
				          console.error(error);
			          } else {
				          console.log('ok', res.filePath);
				          $('#captured-image').css("background", "url(" + res.filePath + ")");
				          $('#captured-image').css("background-size", "380px");
				          $('#captured-image').css("background-position-y", "-185px");
			          }
		          });
	          }
        },
        displayInstructions: function() {
            var $instructionsDiv = $('#instructions')[0];
            $instructionsDiv.innerHTML = this.instructions[this.step];
            $($instructionsDiv).css('background-image', this.instructionsColors[this.step]); 
        },
        showMessage: function() {
            $('#message').show();
            //$('#message')[0].innerHTML = "<p>The angle you measured was "  + this.angle.toPrecision(4).toString() + "&deg;. If the object you lined up had been the Pole Star, the angle would be the same as your latitude. The Pole Star is 90&deg; above the horizon at the North Pole, which has a latitude of 90&deg; North. The star appears right on the horizon at the equator, at 0&deg;. Oxford is 51.7&deg; North. Usually navigators measured the Sun and other stars and calculated latitude using reference books called almanacs.</p><p>To line up the object with the horizon you tilted the phone. On a sextant you'd move the main arm to tilt a mirror.</p>";
            //$('#message')[0].innerHTML = "<p>The angle you measured was " + this.angle.toPrecision(4).toString() + "&deg;. Navigators could use this measurement to calculate their latitude, or north/south position, often by looking it up in a book called an almanac. The North Pole is 90&deg North and the equator is 0&deg. Oxford's latitude is 51.7&deg North." +
            //"<br><br>To line up the object with the horizon you tilted the phone. On a sextant the object and horizon are lined up by moving the main arm to tilt the mirror.</p>";
            $('#message')[0].innerHTML = "<p>You have measured that the noon sun is " + this.model.getLatitude().toPrecision(5).toString() + "&deg; above the horizon. You could also measure other known celestial objects, such as the Pole Star</p><p>To calculate latitude from this measurement, navigators would consult a reference book called an almanac.</p><p>Press the 'Calculate latitude' button to get simulate this calculation.</p>"
        },
        hideMessage: function() {
            var $messageDiv = $('#message')[0];
            $('#message').hide();
        },
	    cleanup: function() {
		    if (typeof(cordova) != "undefined") {
                cordova.plugins.camerapreview.stopCamera();
            }
	    },

    });

    return SextantView;

});