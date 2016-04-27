/**
 * Created by ahaith on 02/11/2015.
 */
define([
        'backbone',
        'underscore'
        ],
        
        function(
            Backbone,
            _
        ) {
        
        var LodestoneModel = Backbone.Model.extend({
            defaults: {
                state: 'start',      // 'start' | 'winding' | 'adding' | 'fallen' | 'ended'
                height: 0,           // 0.0 .. 1.0
                maxWeight: 160,      //
                maxHeight: 100,
                availableWeights: {
                    '40': {
                        weight: 40,
                        image: 'objects/lodestone/weight40.png',
                        cradleImage: 'objects/lodestone/weight40-in-cradle.png',
                        label: '40lb',
                        height: 20,
                        width: 100
                    },
                    '20': {
                        weight: 20,
                        image: 'objects/lodestone/weight20.png',
                        cradleImage: 'objects/lodestone/weight20-in-cradle.png',
                        label: '20lb',
                        height: 10,
                        width: 50
                    },
                    '5': {
                        weight: 5,
                        image: 'objects/lodestone/weight5.png',
                        cradleImage: 'objects/lodestone/weight5-in-cradle.png',
                        label: '5lb',
                        height: 10,
                        width: 12
                    }
                },
                instructions: {
                    'start': 'Tap on the winding keys to begin',
                    'winding': 'Turn the key to raise the lodestone',
                    'adding': 'Tap a weight to add it to the lodestone',
                    'fallen': 'The lodestone could hold up to 160lbs of weight',
                    'failed': 'You have added as many weights as you can'
                }
            },
            
            initialize: function() {
                this.set({loadedWeights : []});
            },
            
            getTotalWeight: function() {
                var total = 0;
                _.each(this.attributes.loadedWeights, function(item, index) {
                    total += item.weight;
                });
                return total;
            },

            getTotalHeight: function() {
                return _.reduce(this.attributes.loadedWeights, function(h, item) {
                    return h + item.height;
                }, 0);
            },
            
            hasExceededLimit: function() {
                return this.getTotalWeight() > this.attributes.maxWeight;
            }
        });
        
        return LodestoneModel;
    }
);
