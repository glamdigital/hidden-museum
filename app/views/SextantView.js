define(["backbone", "hbs!app/templates/image_capture"],
    function(Backbone, imageCaptureTemplate) {

    var SextantView = Backbone.View.extend({
        template: imageCaptureTemplate,

        events: {
          "click .start-tracking": "toggleTrackingOrientation"
        },

        serialize: function() {

        },

        initialize: function(params) {
            this.isTrackingOrientation = false;
            this.currentDeviceOrientation = {alpha:0, beta:0, gamma:0};
            this.startingDeviceOrientation = {alpha:0, beta:0, gamma:0};         
        },
        toggleTrackingOrientation: function(ev) {
            var $target = $(ev.target);
            if (!this.isTrackingOrientation) {
                //set the starting position to the currentPosition
                this.startingDeviceOrientation = null;
                this.isTrackingOrientation = true;
                $(window).on('deviceorientation', this, this.deviceOrientationHandler);               
                $target.text("stop");
            }
            else {
                this.isTrackingOrientation = false;
                $(window).off('deviceorientation', this.deviceOrientationHandler);
                $target.text("start");
            }
        },
        deviceOrientationHandler: function(ev) {

            var sextantView = ev.data;
            if (!sextantView.startingDeviceOrientation) {
                sextantView.startingDeviceOrientation = ev.originalEvent;
            }
            sextantView.currentDeviceOrientation = ev.originalEvent;
            var angle = sextantView.currentDeviceOrientation.beta - sextantView.startingDeviceOrientation.beta;
            var $valueIndicator = $('#value-indicator')[0];
            var $valueIndicatorOffset = $($valueIndicator).offset();
            var $parent = $('#value-indicator')[0].offsetParent;
            var $parentOffset = $($parent).offset();
             
            $valueIndicator.innerHTML = "latitude: " + angle.toPrecision(7).toString() + "&deg;";
            $($valueIndicator).offset({left: $valueIndicatorOffset.left, top: $parentOffset.top + $($parent).height() - $($parent).height()*angle/100});       
        }
    });

    return SextantView;

});