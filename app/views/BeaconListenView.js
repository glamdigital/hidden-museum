/**
 * Created by ahaith on 08/06/15.
 */
define(["backbone", "app/views/UserPromptView", "hbs!app/templates/beacon_listen"],
    function(Backbone, UserPromptView, topicTemplate) {

        var BeaconListenView = Backbone.View.extend({
            template: topicTemplate,

            serialize: function() {
                //serialize trail, topic and items
                var out = {};
                out.trail = this.trail.toJSON();
                out.topic = this.topic.toJSON();
                out.items = this.items.toJSON();
                return out;
            },

            initialize: function(params) {
                this.trail = params.trail;
                this.topic = params.topic;
                this.items = this.topic.getItemsForTrail(this.trail.attributes.slug);

                this.beaconsDict = {};
                //listen for events
                for(var i=0; i<this.items.length; i++) {
                    var item = this.items.at(i);
                    var eventID = 'beaconRange:' + item.attributes.beaconMajor;
                    this.listenTo(Backbone, eventID, this.didRangeBeacon);
                    console.log("listening for event: " + eventID);
                    this.beaconsDict[item.attributes.beaconMajor.toString()] = item;
                }
            },

            didRangeBeacon: function(data) {
                var item = this.beaconsDict[data.major.toString()];
                if(item==undefined) {
                    alert("undefined beacon in dict from data: " + data);
                    return;
                }
                if(data.proximity === 'ProximityImmediate' || data.proximity == 'ProximityNear')
                {
                    ////vibrate if this is a transition to near
                    //if(navigator.notification && !$itemListentry.hasClass('nearby')) {
                    //    navigator.notification.vibrate(500);
                    //}

                    //Add popup offering to go to the page
					var promptView = new UserPromptView({
						title: "Object detected",
						subtitle: item.attributes.title,
						no_string: "Not now",
						yes_string: "View object",
						noCallback: function() {
							console.log("User chose no");
						},
						yesCallback: function () {
							Backbone.history.navigate("#/found/" + item.attributes.slug);
						},
						vibrate: 500,
						el: $('#prompt')
					});
	                promptView.render();
                }
            }

        });

        return BeaconListenView;

    });