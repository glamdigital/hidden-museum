define(["backbone", "hbs!app/templates/interactive/sextant"],
    function(Backbone, sextantTemplate) {

        //sextant arm
        armPivot = {x:0.0, y:-0.36};  //rotation centre for the arm as proportion of width, from geometric centre

	    spinAngle = 0;

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
            this.step = 0;
            this.isTrackingOrientation = false;
            this.currentDeviceOrientation = {alpha:0, beta:0, gamma:0};
            this.startingDeviceOrientation = {alpha:0, beta:0, gamma:0};
            this.instructions = ["<ol><li>Face the centre of the room</li><li>Hold the phone straight up in front of you so the red line is like the horizon</li><li>Press the Start button</li></ol>", 
                "<p>Now, tilt the camera toward the ceiling until the fire alarm nearest you is aligned with the red line and press the button again</p>",
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
        },
        afterRender: function() {
            this.setup();
        },
        setup: function() {
            $('#captured-image').css("background-image", "none");
            this.displayInstructions(0);
            setSextantArmAngle(0);
            this.setLatitudeIndicator($('#value-indicator')[0], "Latitude", 0);
            this.hideLatitudeIndicator(); 
            this.hideReferenceLatitude()       
            $(window).on('deviceorientation', this, this.deviceOrientationHandler);
        },
        toggleButtonHandler: function(ev) {
            var $target = $(ev.target);
            switch (this.step) {
                case 0: {
                    this.step = 1;                           
                    $target.text("Stop");
                    this.takeHorizonImage(ev);
                    this.showLatitudeIndicator();
                    this.startTrackingOrientation(ev);
                    this.displayInstructions();
                    break;
                }        
                case 1: {
                    this.step = 2;
                    this.stopTrackingOrientation(ev);
                    this.displayInstructions();
                    this.setLatitudeIndicatorText($('#value-indicator')[0], "");
                    this.showReferenceLatitude();
                    this.setLatitudeIndicator($('#reference-indicator')[0],"Oxford", 51.7519);
                    $target.text("Reset");
                    break;
                }
                case 2: {
                    this.step = 0;
                    this.setup();
                    this.displayInstructions();
                    this.hideReferenceLatitude();
                    $target.text("Start");
                }
            }
        },
        startTrackingOrientation: function(ev) {           
            this.startingDeviceOrientation = null;
            this.isTrackingOrientation = true;            
        },
        stopTrackingOrientation: function(ev) {
            this.isTrackingOrientation = false;
            $(window).off('deviceorientation', this.deviceOrientationHandler);
        },
        deviceOrientationHandler: function(ev) {
            var sextantView = ev.data;
            if (sextantView.isTrackingOrientation == true) {               
                if (sextantView.startingDeviceOrientation == null) {
                    sextantView.startingDeviceOrientation = ev.originalEvent;
                }
                sextantView.currentDeviceOrientation = ev.originalEvent;
                sextantView.updateOrientationIndicator();
            }
        },
        updateOrientationIndicator: function() {            
            var angle = this.currentDeviceOrientation.beta - this.startingDeviceOrientation.beta;
 	        setSextantArmAngle(angle);
            this.setLatitudeIndicator($('#value-indicator')[0], "Latitude", angle);
        },
        showLatitudeIndicator: function() {
            $('#value-indicator').show();
        },
        hideLatitudeIndicator: function() {
            $('#value-indicator').hide();
        },
        setLatitudeIndicator: function($indicator, label, angle) {
 
            var $parent = $($indicator).parent();
            var parentHeight = 180;//$($parent).height();
            var parentTop = $($parent).offset().top;
            // convert from degrees to radians
            var latRad = angle*Math.PI/180;

            // get y value
            var mercN = Math.log(Math.tan((Math.PI/4)+(latRad/2)));

            //adjustment factor due to the map ending at ~80deg north
            var topProportion = 0.81;

            var y  = parentHeight - parentHeight*mercN/(Math.PI * topProportion);
            this.setLatitudeIndicatorText($indicator, label + ": " + angle.toPrecision(5).toString() + "&deg; North");
            $($indicator).offset({left: $($indicator).offset().left, top: parentTop + y});
        },
        setLatitudeIndicatorText: function($indicator, text) {
            $indicator.innerHTML = text;
        },
        showReferenceLatitude: function() {
             $('#reference-indicator').show();
        },
        hideReferenceLatitude: function() {
             $('#reference-indicator').hide();
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
            var instructionsDiv = $('#instructions')[0];
            instructionsDiv.innerHTML = this.instructions[this.step];
            $(instructionsDiv).css('background-image', this.instructionsColors[this.step]); 
        },
	    cleanup: function() {
		    cordova.plugins.camerapreview.stopCamera();
	    },

    });

    return SextantView;

});