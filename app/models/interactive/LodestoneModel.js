/**
 * Created by ahaith on 02/11/2015.
 */
define([
        'backbone',
        'underscore',
        ],
        function(
            Backbone,
            _
        ) {

        var LodestoneModel = Backbone.Model.extend({
            defaults: {
                state: 'winding',      // 'start' | 'winding' | 'adding' | 'fallen' | 'ended'
                height: 0,           // 0.0 .. 1.0
                maxWeight: 150,      //
                availableWeights: {
                    '40': {
                        weight: 40,
                        image: 'objects/lodestone/weight40.png',
                        cradleImage: 'objects/lodestone/weight40-in-cradle.png',
                        label: '40lb',
                        height: 10,
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
            hasExceededLimit: function() {
                return this.getTotalWeight() > this.attributes.maxWeight;
            }
        });

        return LodestoneModel;

    }
);