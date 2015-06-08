define(["backbone", "hbs!app/templates/topic"],
    function(Backbone, topicTemplate) {

        var TopicView = Backbone.View.extend({
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

                this.beaconsDict = {}
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
                var $itemListEntry = $('#item-'+item.attributes.slug);
                if($itemListEntry.length == 0) {
                    alert("No item list entries found for item")
                }
                if(data.proximity === 'ProximityImmediate' || data.proximity == 'ProximityNear')
                {
                    ////vibrate if this is a transition to near
                    if(navigator.notification && !$itemListentry.hasClass('nearby')) {
                        navigator.notification.vibrate(500);
                    }

                    //add class to item to make bg cycle
                    $itemListEntry.addClass('nearby');
                }
                else {
                    //remove class which makes bg cycle
                    $itemListEntry.removeClass('nearby');
                }
            }

        });

        return TopicView;

    });