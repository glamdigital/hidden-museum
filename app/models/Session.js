define(["backbone", "app/collections/ItemsCollection", "app/collections/TopicsCollection", "app/models/Trail"],
    function(Backbone, ItemsCollection, TopicsCollection, Trail) {

  var Session = Backbone.Model.extend({

    initialize: function(trail) {

      this.trail = trail;

      //initialise the visited/unvisited collections
      this.visitedItems = new ItemsCollection();
      this.unvisitedItems = new ItemsCollection();

      //get all topics for the trail
      this.topics = trail.getTopics();
        if(trail.attributes.fixed_order) {
            this.shuffledTopics = this.topics;
        } else {
            this.shuffledTopics = new TopicsCollection(this.topics.shuffle());
        }

      //get all items for the topic, shuffle and add to unvisited items
      for(var i=0; i<this.shuffledTopics.length; i++) {
          var topic = this.shuffledTopics.at(i);
          var items = topic.getItems().filter(function (item) {
              return item.attributes.trails.indexOf(this.trail.attributes.slug) >= 0;
          }, this);
          if(topic.attributes.fixed_order) {
              //if the topic is set to be in fixed order, then items will appear in the order they are in the imported json
              topic.shuffledItems = new ItemsCollection(items);
          }
          else {
              topic.shuffledItems = new ItemsCollection(_.shuffle(items));
          }
          for(var j=0; j<items.length; j++) {
          this.unvisitedItems.add(topic.shuffledItems.at(j));
        }
      }
    },

    hasNext: function() {
      //returns true if there is a next item
      return _.size(this.unvisitedItems);
    },

    getNextURL: function() {
      if(this.hasNext()) {
          //var item = this.unvisitedItems.at(0);

          //go to next item on the current topic
          var ct = this.getCurrentTopic();
          var currentTopicUnvisited = this.unvisitedItems.where({topic: ct.attributes.slug});
          if (currentTopicUnvisited.length > 0) {
              var item = currentTopicUnvisited[0];
              var URL = '#/item/' + item.attributes.slug;
              return URL;
          }
          else {
              //go to topic homepage of first unvisited item
              var firstUnvisited = this.unvisitedItems.at(0);
              var URL = '#/topic/' + firstUnvisited.attributes.topic;
              return URL;
          }

      }
      else {
        //finished
        return '#/finished/' + this.getCurrentTrail().attributes.slug;
      }
    },

    getItem: function(slug) {
      var item = this.unvisitedItems.findWhere({slug: slug});
      if (!item) {
        //try the visited items instead
        item = this.visitedItems.findWhere({slug: slug});
      }
      this.currentItem = item;
      this.currentTopic = Trail.allTopics.findWhere({slug: item.attributes.topic});
      return item;
    },

    getTopic: function(slug) {
      var topic = this.trail.getTopics().findWhere({slug:slug});
      this.currentTopic = topic;
      return topic;
    },

    getCurrentTopic: function() {
      return this.currentTopic ? this.currentTopic : this.topics.at(0);
    },

    getCurrentTrail: function() {
      return this.trail;
    },

    visitItem: function(slug) {
      //record the next item as having been visited
      var item = this.unvisitedItems.findWhere({slug: slug});
      this.unvisitedItems.remove(item);
      this.visitedItems.add(item);
    },

    getAllSessionTopicsAndItems: function() {
        var out = {
            title: this.trail.attributes.title,
            topics: []
        };

        this.shuffledTopics.each( function(topic) {
            var isCurrentTopic = this.currentTopic === topic;
            var topicDict = {
                title: topic.attributes.title,
                items: [],
                isCurrent: isCurrentTopic
            };
            //fill in items
            var items = topic.shuffledItems;
            items.each(function(item) {
                var isCurrentItem = this.currentItem === item;
                var isVisited = this.visitedItems.indexOf(item) >= 0;
                //TODO track whether an item has been found
                var itemDict = {
                    title: item.attributes.title,
                    slug: item.attributes.slug,
                    isCurrent: isCurrentItem,
                    isVisited: isVisited,
                    isFound: item.attributes.isFound,
                };
                topicDict.items.push(itemDict);
            }, this);
            out.topics.push(topicDict);
        }, this);

        return out;

    },

    // ItemsCollection of items the user has yet to visit
    unvisitedItems: null,

    // ItemsCollection of Items the user has already visited
    visitedItems: null,

  });

  return Session;

});
