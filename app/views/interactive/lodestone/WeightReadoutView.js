/**
 * Created by ahaith on 03/11/2015.
 */
define(['backbone', 'hbs!app/templates/interactive/weight_readout'], function(Backbone, weightReadoutTemplate) {

    var WeightReadoutView = Backbone.View.extend({
        template: weightReadoutTemplate,
    });

    return WeightReadoutView;

});