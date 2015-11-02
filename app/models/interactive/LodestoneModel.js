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
                loadedWeights: [],
                availableWeights: [
                    {
                        weight: 10,
                        img: '',
                        height: 10,
                        width: 50,
                    },
                    {
                        weight: 20,
                        img: '',
                        height: 10,
                        width: 100,
                    },
                ]
            }
        });

        return LodestoneModel;

    }
);