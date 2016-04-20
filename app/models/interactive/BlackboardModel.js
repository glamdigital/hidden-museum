/**
 * Created by ahaith on 20/10/2015.
 */
define(["backbone"], function(Backbone) {

    var BlackboardModel = Backbone.Model.extend({
        defaults: {
        },
        
        parse: function (data) {
            if(data.landscape == 'TRUE') { data.landscape = true;}
            else { data.landscape = false; }
            
            return data;
        }
    });

    return BlackboardModel;
});
