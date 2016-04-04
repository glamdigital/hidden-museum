define(["backbone", "app/collections/TrailsCollection", "app/collections/TopicsCollection", "app/collections/ItemsCollection"],
    function(Backbone, TrailsCollection, TopicsCollection, ItemsCollection) {

    var allTrails = new TrailsCollection();
    var allTopics = new TopicsCollection();
    var allItems = new ItemsCollection();

    var runDataValidation = {
      validateData: function() {
        allTrails.fetch( {success: function(trailsColl, resp, opt) {
            allTopics.fetch( {success: function(topicsColl, resp, opt) {
              allItems.fetch( {success: function(itemsColl, resp, opt) {

                //check each trail has at least one topic
                console.log(trailsColl.length + " trails in total");
                console.log("Verifying trails have topics");
                trailsColl.forEach( function(trail) {
                  console.log("Trail: " + trail.attributes.title + " (" + trail.attributes.slug + ")");

                  //Assert topics > 0
                  if(trail.topics.length <= 0) {
                    console.error("No topics for trail: " + trail.attributes.title);
                  }

                  //check each item
                  trail.topics.each( function(topic) {
                      console.log("  Topic: " + topic.attributes.title + "(" + topic.attributes.slug + ")");
                      //Assert length items > 0
                      var trailItems = topic.items.filter( function(item) {
                        return item.attributes.trails.indexOf(trail.attributes.slug) >= 0;
                      }, this);
                      if(trailItems.length <= 0) {
                        console.error("No items for topic: " + topic.attributes.title + " on trail: " + trail.attributes.title);
                      }

                  }, this);
                }, this);
              }});
            }});
        }} );
      },
    };

  return runDataValidation;

});
