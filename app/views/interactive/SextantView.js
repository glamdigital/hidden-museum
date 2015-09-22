define(["backbone", "hbs!app/templates/interactive/sextant"],
    function(Backbone, sextantTemplate) {

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
            this.isTrackingOrientation = false;
            this.currentDeviceOrientation = {alpha:0, beta:0, gamma:0};
            this.startingDeviceOrientation = {alpha:0, beta:0, gamma:0};
            this.instructions = ["<ol><li>hold the phone at arm's length</li><li>line up the bottom of the window across the room with the line on the screen</li><li>press the start button</li></ol>", "<p>Now, raise the camera until the fire alarm is aligned with the window sill and press Stop</p>"];
            var tapEnabled = true; //enable tap take picture
            var dragEnabled = false; //enable preview box drag across the screen
            var toBack = true; //send preview box to the back of the webview
            var rect = {x: 0, y: 175, width: 380, height:280};
            cordova.plugins.camerapreview.startCamera(rect, "back", tapEnabled, dragEnabled, toBack);
            $('#content').css("background-color", "transparent");       
        },
        toggleButtonHandler: function(ev) {
            var $target = $(ev.target);
            if (!this.isTrackingOrientation) {
                //set the starting position to the currentPosition                             
                $target.text("stop");
                this.takeHorizonImage(ev);
                this.startTrackingOrientation(ev);
                this.displayInstructions(1);
            }
            else {
                this.stopTrackingOrientation(ev);
                this.displayInstructions(0);
                $target.text("start");
            }
        },
        startTrackingOrientation: function(ev) {
            this.startingDeviceOrientation = null;
            $(window).on('deviceorientation', this, this.deviceOrientationHandler); 
            this.isTrackingOrientation = true;
        },
        stopTrackingOrientation: function(ev) {
            this.isTrackingOrientation = false;
            $(window).off('deviceorientation', this.deviceOrientationHandler);
        },
        deviceOrientationHandler: function(ev) {
            var sextantView = ev.data;
            if (!sextantView.startingDeviceOrientation) {
                sextantView.startingDeviceOrientation = ev.originalEvent;
            }
            sextantView.currentDeviceOrientation = ev.originalEvent;
            sextantView.updateOrientationIndicator();
        },
        updateOrientationIndicator: function() {
            var $valueIndicator = $('#value-indicator')[0];
            var angle = this.currentDeviceOrientation.beta - this.startingDeviceOrientation.beta;
            var $valueIndicatorOffset = $($valueIndicator).offset();
            var $parent = $('#value-indicator')[0].offsetParent;
            var $parentOffset = $($parent).offset();
            $valueIndicator.innerHTML = "latitude: " + angle.toPrecision(7).toString() + "&deg;";
            $($valueIndicator).offset({left: $valueIndicatorOffset.left, top: $parentOffset.top + $($parent).height() - $($parent).height()*angle/100});
        },
        takeHorizonImage: function(ev) {
            cordova.plugins.camerapreview.setOnPictureTakenHandler(function(result){
                $('#captured-image').css("background", "url("+result[1]+")");
             });
            cordova.plugins.camerapreview.takePicture({maxWidth:640, maxHeight:640});

        },
        displayInstructions: function(i) {
            $("#instructions")[0].innerHTML = this.instructions[i];
        }
    });

    return SextantView;

});