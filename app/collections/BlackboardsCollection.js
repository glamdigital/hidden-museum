define([
  "backbone",
  "app/models/interactive/BlackboardModel"
], function(
  Backbone,
  BlackboardModel
){

  var BlackboardsCollection = Backbone.Collection.extend({
    url:"app/data/blackboards.json",
    model: BlackboardModel
  });

  return BlackboardsCollection;

});
