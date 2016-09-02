//Assuming each 'component'/'topic' has a finite set of unique entry points
//we can keep track of where the user is.
//This module retrieves beacon IDs from all 'topics'(/components) and

define([
        'app/logging',
        'backbone',
        'underscore',
        'app/models/Trail',
        'app/views/UserPromptView'
    ],
    
    function (Logging, Backbone, _, Trail, UserPromptView) {
        var FloorTracking = Backbone.Model.extend(
            {
                initialize : function () {
                    //subscribe to relevant beacon events
                    window.allTrails.each(_.bind(function(trail) {
                        for (var i = 0; i<trail.attributes.entryPointBeaconIDs.length; i++) {
                            var beaconID = trail.attributes.entryPointBeaconIDs[i]
                            var eventId = 'beaconRange:' + beaconID;
                            this.listenTo(Backbone, eventId, _.bind(this.beaconRanged, this));
                            this.beaconsDict[beaconID.toString()] = trail;
                        }
                    }, this));
                    this.promptToSwitch = false;
                    this.promptsSuppressed = false;
                },
                
                beaconRanged: function (data) {
                    //if we're near to a beacon that's different than the current one
                    if (data.proximity === "ProximityNear") {
                        if (window.session.currentPhysicalTrail === null || window.session.currentPhysicalTrail.attributes.entryPointBeaconIDs.indexOf(data.major.toString()) < 0) {
                            //This is a new floor. update current floor and emit a message
                            window.session.currentPhysicalTrail = this.beaconsDict[data.major.toString()];
                            Backbone.trigger('changed_floor', window.session.currentPhysicalTrail.attributes.slug);
                            if (this.promptToSwitch && !this.promptsSuppressed) {
                                this.suppressPrompts();
                                this.promptToSwitchFloor();
                            }
                        }
                    }
                },
                
                promptToSwitchFloor: function (floorSlug) {
                    var title = "Entering " + window.session.currentPhysicalTrail.attributes.title;
                    var message = "Switch to this area?";
                    
                    //create the alert view
                    var view = new UserPromptView({
                        el: $('#prompt'),
                        title: title,
                        subtitle: message,
                        yes_string: 'OK',
                        no_string: 'Not Now',
                        yesCallback: this.switchFloor.bind(this),
                        noCallback: this.unsuppressPromptsWithDelay.bind(this),
                        vibrate: 500
                    });
                    
                    view.render();
                },
                
                switchFloor: function () {
                    Backbone.history.navigate('#/trail/' + window.session.currentPhysicalTrail.attributes.slug);
                    this.unsuppressPromptsWithDelay(5000);
                },
                
                //suppress prompts - don't bother the user with them if they've recently seen one.
                suppressPrompts: function () {
                    this.promptsSuppressed = true;
                },
                
                unsuppressPromptsWithDelay: function (delay) {
                    //default to 3s
                    if (!delay) { delay = 3000; }
                    setTimeout(this.unsuppressPrompts.bind(this), delay);
                },
                
                unsuppressPrompts: function () {
                    this.promptsSuppressed = false;
                },
                
                beaconsDict: {}
            },
            
            {
                //Class attribute enabled flag. Can be enabled/disabled by views
                promptToSwitch: true
            }
        );
        
        return FloorTracking;
    }
);
