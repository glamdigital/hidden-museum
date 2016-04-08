/**
 * Created by ahaith on 20/10/2015.
 */
define(["backbone"], function(Backbone) {

    var BlackboardModel = Backbone.Model.extend({
        defaults: {
        },
        parse: function (response) {
          if (response.landscape == "TRUE") {
            response.landscape = true;
          } else {
            response.landscape = false;
          }
          return response;
        }
    });

    return BlackboardModel;
});
