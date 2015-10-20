/**
 * Created by ahaith on 20/10/2015.
 */
define(["backbone"], function(Backbone) {
    var SextantModel = Backbone.Model.extend({
        defaults: {
            angle: 0,
            mode: 'sun',
        },

        getLatitude: function() {
            if( mode == 'sun') {
                //code goes here
            }
            else if ( mode == 'pole star') {
                //latitude is just the angle measured by the sextant
                return angle;
            }
        }

    });

    return SextantModel;
});