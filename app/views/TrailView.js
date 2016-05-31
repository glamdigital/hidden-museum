define([
        "backbone",
        "underscore",
        "app/models/Trail",
        "hbs!app/templates/trail",
        "app/preloadImages",
        "app/mixins/overlay"
    ], function(
      Backbone,
      _,
      Trail,
      trail,
      preloadImages,
      overlayMixin
        ) {
          
        var TrailView = Backbone.View.extend({
            
            template: trail,
            
            initialize: function(params) {
                this.trails = params.trails;
                this.selectedTrail = params.selectedTrail;
                this.listenTo(Backbone, 'changed_floor', this.changedFloor);
                
                //beacon data
                this.beaconsDict = {
                };
                
                //store the index for each object within its own gallery
                this.trails.each(_.bind(function(trail) {
                    var topics = trail.topics;
                    topics.each(_.bind(function(topic, index) {
                           topic.set({galleryIndex: index+1});
                        var eventID = 'beaconRange:' + topic.attributes.beaconID;
                        this.listenTo(Backbone, eventID, this.didRangeBeacon);
                        this.beaconsDict[topic.attributes.beaconID.toString()] = topic;
                    }, this));
                }, this));
                
                this.overlayInitialize();
            },
            
            cleanup: function () {
                this.overlayCleanup();
            },
            
            afterRender: function() {
                //position the map markers
                this.trails.each(function (trail) {
                    var $trailMap = $('#floorplan-' + trail.attributes.slug);
                    $trailMap.height(360/750 * $('.content').width() + 4);

                    //position markers
                    trail.topics.each(function (topic) {
                        var $marker = $('#map-marker-' + topic.attributes.slug);
                        var top = $trailMap.height() * topic.attributes.mapY;
                        $marker.css('top', top + 'px');
                        var left = $trailMap.width() * topic.attributes.mapX;
                        $marker.css('left', left + 'px');
                    });
                });
                this.doAccordianMagic(0);
                this.adjustHeights();
                preloadImages.preload("trail");
            },

            adjustHeights: function() {
                var contentHeight = $('.content').height();
                var trailTitle = $('.trail-title').outerHeight();
                var trailFloorplan = 360/750 * $('.content').width();
                var itemHeight = (contentHeight - trailFloorplan - 3*trailTitle);
                $("#upper_gallery .topic-list-item").outerHeight(itemHeight / 2 - 1);
                $("#entrance_gallery .topic-list-item").outerHeight(itemHeight / 2 - 1);
                $("#basement_gallery .topic-list-item").outerHeight(itemHeight / 3 - 1);
            },
            
            serialize: function() {
                var out = {};
                out.trails = this.trails.toJSON();
                for (var i=0; i< this.trails.length; i++) {
                    var topicsJSON = this.trails.models[i].getTopics().toJSON();
                    out.trails[i]['topics'] = topicsJSON;
                if(this.trails.at(i).id == window.session.currentTrail.id) {
                    out.trails[i].current = true;
                } else {
                    out.trails[i].current = false;
                }
                }
                out.trail_slug = this.selectedTrail.attributes.slug;
                return out;
            },
            
            events: {
                "click .trail-title" : "onSelectTrail",
            },
            
            onSelectTrail: function(ev) {
                var $target = $(ev.target).parent();
                var slug = $target.attr('id');
                var selectedTrail = this.trails.findWhere({'id':slug});
                if (selectedTrail != this.selectedTrail) {
                    this.selectedTrail = selectedTrail;
                    this.doAccordianMagic(200);
                }
                $(".active-fa").html("<i class='fa fa-chevron-right'></i>");
                $("#"+this.selectedTrail.get("id")+" .active-fa").html("<i class='fa fa-chevron-down'></i>");
                window.session.currentTrail = selectedTrail;
            },
            
            doAccordianMagic: function(duration) {
                var $selectedTrailDiv = $('#'+this.selectedTrail.attributes.slug);
                var $siblingsToClose = $selectedTrailDiv.siblings()
                if (duration > 0) {
                    $siblingsToClose = $selectedTrailDiv.siblings('.open');
                }
                $selectedTrailDiv.addClass('open').children('.trail-content').slideDown(duration);
                $siblingsToClose.removeClass('open').children('.trail-content').slideUp(duration);
        },
        
        didRangeBeacon: function(data) {
            //look in topics
            var topic = this.beaconsDict[data.major.toString()];
            if(typeof(topic) !== 'undefined') {
                if(data.proximity == 'ProximityNear' || data.proximity == 'ProximityImmediate') {
                    //find relevant elements and add classes
                    $('#map-marker-' + topic.attributes.slug).addClass('nearby');
                    $('#index-marker-' + topic.attributes.slug).addClass('nearby');
                } else {
                    $('#map-marker-' + topic.attributes.slug).removeClass('nearby');
                    $('#index-marker-' + topic.attributes.slug).removeClass('nearby');
                }
            }
        },
        
        changedFloor: function(data) {
            $('h2.trail-title').removeClass('current');
            $('#trail-title-' + data).addClass('current');
            }
        });
        
        _.extend(TrailView.prototype, overlayMixin);
        
        return TrailView;
    }
);
