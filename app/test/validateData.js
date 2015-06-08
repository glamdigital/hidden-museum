define(["backbone", "app/collections/TrailsCollection", "app/collections/TopicsCollection", "app/collections/ItemsCollection", "app/collections/QuestionsCollection"],
    function(Backbone, TrailsCollection, TopicsCollection, ItemsCollection, QuestionsCollection) {

    var allTrails = new TrailsCollection();
    var allTopics = new TopicsCollection();
    var allItems = new ItemsCollection();
    var allQuestions = new QuestionsCollection();

    var runDataValidation = {
      validateData: function() {
        allTrails.fetch( {success: function(trailsColl, resp, opt) {
            allTopics.fetch( {success: function(topicsColl, resp, opt) {
              allItems.fetch( {success: function(itemsColl, resp, opt) {
                allQuestions.fetch( {success: function(questionsColl, resp, opt) {

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

                      _.each(trailItems, function(item) {
                        console.log("     Item: " + item.attributes.title + "(" + item.attributes.slug + ")");
                        //Assert length questions === 1
                        //get the questions which are applicable to the current trail.
                        var trailQuestions = _.filter(item.questions, function(question) {
                          return question.attributes.trails.indexOf(trail.attributes.slug) >= 0;
                        }, this);
                        if(trailQuestions.length === 1) {
                          console.log("       1 question found for this item on this trail");
                        } else if(trailQuestions.length === 0) {
                          console.error("       No questions found for this item on this trail");
                        } else {
                          console.error("       Too many questions found for this item on this trail");
                        }
                      }, this);
                  }, this);
                }, this);
                }});
              }});
            }});
        }} );
      },
    };

  return runDataValidation;

});
