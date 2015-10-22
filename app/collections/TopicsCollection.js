define(["backbone", "app/models/Topic"], function(Backbone, Topic){

  var TopicsCollection = Backbone.Collection.extend({
    url:"app/data/objects.json",
    model: Topic
  });

  return TopicsCollection;

});
