define(["backbone", "hbs!app/templates/found_item"],
    function(Backbone, itemFoundTemplate) {

    var ItemFoundView = Backbone.View.extend({
        template: itemFoundTemplate,

        serialize: function() {

        },

        initialize: function(params) {
            this.item = params.item;
            this.nextURL = params.nextURL
        }
    });

    return ItemFoundView;

});