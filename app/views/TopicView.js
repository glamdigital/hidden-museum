define([
        "backbone",
        "underscore",
        "app/views/AudioControlsView",
        "app/mixins/overlay",
        "app/preloadImages",
        "hbs!app/templates/topic"
    ],
    
    function (
            Backbone,
            _,
            AudioControlsView,
            overlayMixin,
            preloadImages,
            topicTemplate
        ) {
        
        var TopicView = Backbone.View.extend({
            template: topicTemplate,
            
            serialize: function () {
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
            
            initialize: function (params) {
                //this.trail = params.trail;
                this.topic = params.topic;
                this.items = this.topic.items;
                this.audio_items = new Backbone.Collection(this.items.where({type: 'audio'}));
                this.interact_items = new Backbone.Collection(this.items.filter(function (item) { return item.attributes.type !== 'audio'; }));
                
                this.overlayInitialize();
            },
            
            afterRender: function () {
                //create the audio players
                this.audio_items.each(_.bind(function (item, i, list) {
                    var $audioContainer =$('#audio-' + item.attributes.id);
                    var audioView = new AudioControlsView({
                        audio: item.attributes.audio,
                        caption: item.attributes.title,
                        duration: item.attributes.audio_duration,
                        el: $audioContainer
                    });
                    audioView.render();
                    this.audioViews.push( audioView );
                },this));
                var $marker = $('.map-marker');
                var $map = $('.map-container-div');
                
                var top = $map.height() * this.topic.get("mapY")+15;
                $marker.css('top', top + 'px');
                var left = $map.width() * this.topic.get("mapX")+12;
                $marker.css('left', left + 'px');
                preloadImages.preload(this.topic.get("slug"));
            },
            
            cleanup: function () {
                this.overlayCleanup();
            },
            
            events: {
                "click .show-map-button": "showMap",
                "click .header": "showImage",
                "click .overlay-image": "hideOverlays"
            },
            
            hideOverlays: function (event) {
                event.preventDefault();
                $('.object-map').hide();
                $('.object-full-image').hide();
            },
            
            showMap: function (event) {
                event.preventDefault();
                $('.object-map').show();
            },
            
            showImage: function (event) {
                event.preventDefault();
                $('.object-full-image').show();
            },
        });
        
        _.extend(TopicView.prototype, overlayMixin);
        
        return TopicView;
    }
);
