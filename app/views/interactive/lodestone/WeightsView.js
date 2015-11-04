/**
 * Created by ahaith on 02/11/2015.
 */
define([
        'backbone',
        'hbs!app/templates/interactive/weights'
    ],
    
    function (
        Backbone,
        weightsTemplate
    ) {
        var WeightsView = Backbone.View.extend({
            template: weightsTemplate,
            
            initialize: function (params) {
            },
            
            serialize: function () {
                return this.model.toJSON();
            }
        });
        
        return WeightsView;
    }
);
