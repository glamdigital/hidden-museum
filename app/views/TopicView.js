define([
            "backbone",
            "underscore",
            "app/views/AudioControlsView",
            "hbs!app/templates/topic"
        ],
    function(
            Backbone,
            _,
            AudioControlsView,
            topicTemplate
        ) {

        var TopicView = Backbone.View.extend({
            template: topicTemplate,

            serialize: function() {
                //serialize trail, topic and items
                var out = {};
                out.trail = window.session.currentTrail.toJSON();
                out.topic = this.topic.toJSON();
                //out.items = this.items.toJSON();
                out.audio_items = this.audio_items.toJSON();
                out.interact_items = this.interact_items.toJSON();
                this.audioViews = [];
                return out;
            },

            initialize: function(params) {
                //this.trail = params.trail;
                this.topic = params.topic;
                this.items = this.topic.items;
                this.audio_items = new Backbone.Collection(this.items.where({type: 'audio'}));
                this.interact_items = new Backbone.Collection(this.items.filter(function(item){ return item.attributes.type !== 'audio'; }));

                this.beaconsDict = {}
            },

	        afterRender: function() {
                //create the audio players
                this.audio_items.each(_.bind(function(item, i, list) {
                    var $audioContainer =$('#audio-' + item.attributes.id);
                    var audioView = new AudioControlsView({
                        audio: item.attributes.audio,
                        caption: item.attributes.title,
                        duration: item.attributes.audio_duration,
                        el: $audioContainer,
                    });
                    audioView.render();
                    this.audioViews.push( audioView );
                },this));
	        },

            events: {
                "click .show-map-button": "showMap",
                "click .close-map-overlay": "hideMap",
                "click .header": "showImage",
                "click .close-image-overlay": "hideImage"
            },

            showMap: function(ev) {
                ev.preventDefault();
                $('.object-map').show();
            },
            hideMap: function(ev) {
                ev.preventDefault();
                $('.object-map').hide();
            },

            showImage: function(ev) {
                ev.preventDefault();
                $('.object-full-image').show();
            },
            hideImage: function(ev) {
                ev.preventDefault();
                $('.object-full-image').hide();
            }
            //didRangeBeacon: function(data) {
            //    var item = this.beaconsDict[data.major.toString()];
            //    if(item==undefined) {
            //        alert("undefined beacon in dict from data: " + data);
            //        return;
            //    }
            //    var $itemListEntry = $('#item-'+item.attributes.slug);
            //    if($itemListEntry.length == 0) {
            //        alert("No item list entries found for item")
            //    }
            //    if(data.proximity === 'ProximityImmediate' || data.proximity == 'ProximityNear')
            //    {
            //        ////vibrate if this is a transition to near
            //        if(navigator.notification && !$itemListEntry.hasClass('nearby')) {
            //            navigator.notification.vibrate(500);
            //        }
            //
            //        //add class to item to make bg cycle
            //        $itemListEntry.addClass('nearby');
            //    }
            //    else {
            //        //remove class which makes bg cycle
            //        $itemListEntry.removeClass('nearby');
            //    }
            //}

        });

        return TopicView;

    });