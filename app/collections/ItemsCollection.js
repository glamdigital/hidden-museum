define(["backbone", "app/models/Item"], function(Backbone, Item){

  var ItemsCollection = Backbone.Collection.extend({
    url:"app/data/items.json",
    model: Item
  });

  return ItemsCollection;

});
