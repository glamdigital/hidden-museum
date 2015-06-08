define(["backbone", "app/models/Question"], function(Backbone, Question) {

  var QuestionsCollection = Backbone.Collection.extend({
    url: "app/data/questions.json",
    model: Question,
  });

  return QuestionsCollection;


});
