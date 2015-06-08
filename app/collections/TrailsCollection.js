define(["backbone", "app/models/Trail"], function(Backbone, Trail) {

  var TrailsCollection = Backbone.Collection.extend({
      url:"app/data/trails.json",
      model: Trail
  });

  return TrailsCollection;

});
