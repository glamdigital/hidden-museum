define(["backbone", "app/collections/TopicsCollection"], function(Backbone, TopicsCollection) {

  // Get all topics. Each Trail will build its own collection of topics which belong to it.
  window.allTopics = new TopicsCollection();

  var Trail = Backbone.Model.extend({
    initialize: function () {
      //get all the topics which include this trail in their list of trails
      this.topics = new TopicsCollection( window.allTopics.filter( function(topic) {
        return topic.attributes.trails.indexOf(this.attributes.slug) >= 0;
      }, this) );
    },

    //return a TopicsCollection featuring all topics for this trail
    getTopics: function () {
      return this.topics;
    },

    parse: function(response) {
        var t = response;
        t.slug = response.id;
        //t.title = response.title;
        //t.description = response.description;
        //t.shareURL = response.shareURL;
        //t.video = response.video;
        t.fixed_order = response.fixed_order=="true" || response.fixed_order=="TRUE";

	    t.isTrail = response.is_trail == "TRUE";

	    //for topic view, whether items should be hidden by default
	    t.hideByDefault = response.hide_items_by_default == "TRUE";

	    t.showImgAfterVideo = response.show_img_after_video == "TRUE";

	    t.useQRCodes = response.use_qr_codes == "TRUE";

        //read in all possible entry point beacon IDs to an array.
        t.entryPointBeaconIDs = [];
        var foundEmptyEntryPoint = false;
        var j=1;
        while(!foundEmptyEntryPoint) {
          var entryPointKey = "entryPointBeaconID" + j;
          if(response[entryPointKey]) {
            t.entryPointBeaconIDs.push(response[entryPointKey]);
          } else {
            foundEmptyEntryPoint = true;
          }
          j++;
        }

        return t;
    }

  },
  {
    //Class property stores all topics
    loadTopics: function(callback) {
      window.allTopics.fetch({success: function(coll, resp, opt) {
        console.log("fetched all topics");
          //var floorTracker = new FloorTracking(coll);
          if(callback) { callback(coll); }
      }
      });
    }
  }
  );

  return Trail;

});
