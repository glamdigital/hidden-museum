define(["backbone", "underscore", "app/collections/QuestionsCollection"], function(Backbone, _, QuestionsCollection) {


  var Item = Backbone.Model.extend({

    initialize: function() {
    },

    parse: function(response) {

      var item = response;
      item.slug = response.id;
      //item.title = response.title;
      //item.description = response.description;
      item.topic = response.component;
      //item.location = response.location;
      //item.image = response.image;
      //item.hint_image = response.hint_image;
      //item.audio = response.audio;
      //item.hint = response.hint;
      //item.beaconMajor = response.beaconMajor;
      //item.beaconHint = response.beaconHint;

      item.trails = [];
      //read in the list of trails into a single array. The trails are parameters of id trail[n]
      var foundEmpty = false;
      var i=1;
      while(!foundEmpty) {
        var trailKey = "trail" + i;
        if(response[trailKey]) {
           item.trails.push(response[trailKey]);
        } else {
          foundEmpty = true;
        }
        i++;
      }
      return item;
    }

  }
  );
  return Item;

});
