define(["backbone", "app/collections/ItemsCollection"], function(Backbone, ItemsCollection) {

  //Get all items. Each topic will build its own list of items.
  window.allItems = new ItemsCollection();

  var Topic = Backbone.Model.extend({
    initialize: function () {
      //filter those items which are valid for this topic
      var topicItems = window.allItems.filter(function(item) {
        var itemHasCorrectTopic = (item.attributes.topic === this.attributes.slug);
        return itemHasCorrectTopic;
      }, this);
      this.items = new ItemsCollection(topicItems);
    },

    parse: function (response) {
      var t = response;
      t.slug = response.id;
      //t.title = response.title;
      //  t.description = response.description;
      t.trails = [response.gallery];
        t.entryPointBeaconIDs = [];

      //read in the list of trails into a single array. The trails are parameters of id trail[n]
      //var foundEmpty = false;
      //var i=1;
      //while(!foundEmpty) {
      //  var trailKey = "trail" + i;
      //  if(response[trailKey]) {
      //     t.trails.push(response[trailKey]);
      //  } else {
      //    foundEmpty = true;
      //  }
      //  i++;
      //}

        //read in all possible entry point beacon IDs to an array.
        var foundEmptyEntryPoint = false;
        var j=1;
        while(!foundEmptyEntryPoint) {
            var entryPointKey = "entryPointBeaconId" + j;
            if(response[entryPointKey]) {
                t.entryPointBeaconIDs.push(response[entryPointKey]);
            } else {
                foundEmptyEntryPoint = true;
            }
            j++;
        }

        var fixed_order=false;
        if(response.fixed_order=="true" || response.fixed_order=="TRUE") {
            fixed_order=true;
        }
	    t.fixed_order = fixed_order;

      return t;
    },

    getItems: function() {
      return this.items;
    },

    //return a collection of items for this topic on the given trail
    getItemsForTrail: function(trailSlug) {
        var trailItems = this.items.filter(function(item) {
           return item.attributes.trails.indexOf(trailSlug) >= 0;
        });
        return new ItemsCollection(trailItems);
    }

  },
  {
    //class property of all items
    loadItems: function(callback) {
      window.allItems.fetch({success: function(coll, resp, opt) {
        console.log("fetched all items for topic");
          if(callback) { callback(); }
      }
      });
    }
  }
  );

  return Topic;

});
