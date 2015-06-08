define(["backbone", "jquery", "hbs!app/templates/dashboard", "app/location"], function(Backbone, $, dashboardTemplate, Location) {

    var DashboardView = Backbone.View.extend({

        template: dashboardTemplate,

        initialize: function (params) {
            this.beacons = params;
            this.ready = false;
            //set some default values for the min and max
            this.minRSSI = -100;
            this.maxRSSI = -25;

            this.minAccuracy = 0;
            this.maxAccuracy = 5;


        },

        serialize: function() {
            return { beaconId: this.beaconId};
        },

        afterRender: function() {

            //update labels
            $('#rssi').find('.min').html(this.minRSSI);
            $('#rssi').find('.max').html(this.maxRSSI);

            var $acc = $('#accuracy.meter');
            var $accuracies = $('#accuracies');
            var $rssi = $('#rssi.meter');
            var $rssis = $('#rssis');
            $acc.find('.min').html(this.minAccuracy);
            $acc.find('.max').html(this.maxAccuracy);

            for(var i=0; i<this.beacons.length; i++) {
                beaconId = this.beacons[i].beaconId;

                //this.eventIds.push(eventId);
                //subscribe to event
                var eventId = 'beaconRange:' + beaconId;
                this.listenTo(Backbone, eventId, this.didRangeBeacon);
                //duplicate the rssi and accuracy elements
                var newacc = $acc.clone();
                newacc.addClass('' + beaconId);
                newacc.prepend(this.beacons[i].name);
                newacc.appendTo($accuracies);
                var newrssi = $rssi.clone();
                newrssi.addClass('' + beaconId);
                newrssi.prepend(this.beacons[i].name);
                newrssi.appendTo($rssis);
            }

            $acc.hide();
            $rssi.hide();
            this.ready=true;
        },

        events: {
            "click .meter" : "simulateRange"
        },

        simulateRange: function () {
            var randomAccuracy = this.minAccuracy + Math.random() * (this.maxAccuracy - this.minAccuracy);
            var randomRSSI = this.minRSSI + Math.random() * (this.maxRSSI - this.minRSSI);
            var randomProximity = randomAccuracy > 40 ? "FarProximity" : randomAccuracy > 10 ? "NearProximity" : "ImmediateProximity";
            Backbone.trigger('beaconRange:45790', {proximity: randomProximity, rssi: randomRSSI, accuracy: randomAccuracy, major:45790});
        },

        didRangeBeacon: function(data) {
            if(!this.ready) {
                return;
            }
            //update the bars on the screen

            //rssi
            var $rssi = $('#rssi.' + data.major);
            if($rssi.length < 1) { alert("Didn't find RSSI element for " + data.major);}
            var fill = 0;
            if(data.rssi > 0) {
                fill = 1 - (this.maxRSSI - data.rssi) / (this.maxRSSI - this.minRSSI);
            }
            $rssi.find(".fillBar").css("width", fill*100 + "%");
            $rssi.find(".value").html(data.rssi);

            //accuracy
            var $accuracy = $('#accuracy.' + data.major);
            var fill2 = 0;
            if (data.accuracy > -1) {
                fill2 = 1 - (this.maxAccuracy - data.accuracy) / (this.maxAccuracy - this.minAccuracy);
            }
            $accuracy.find(".fillBar").css("width", fill*100 + "%");
            $accuracy.find(".value").html(data.accuracy);

            switch(data.proximity) {
                case "ProximityImmediate":
                    $('.' + data.major + ' .fillBar').addClass("immediate").removeClass("far").removeClass("near");
                    break;
                case "ProximityNear":
                    $('.' + data.major + ' .fillBar').addClass("near").removeClass("immediate").removeClass("far");
                    break;
                case "ProximityFar":
                    $('.' + data.major + ' .fillBar').addClass("far").removeClass("immediate").removeClass("near");
                    break;
            }
        }
    });

    return DashboardView;

});
