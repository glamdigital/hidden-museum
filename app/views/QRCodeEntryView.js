/**
 * Created by ahaith on 09/06/15.
 */
/**
 * Created by ahaith on 08/06/15.
 */
define(["backbone", "jquery", "hbs!app/templates/code_entry"],
    function(Backbone, $, topicTemplate) {

        var QRCodeEntryView = Backbone.View.extend({
            template: topicTemplate,

            serialize: function() {
                //serialize trail, topic and items
                var out = {};
                out.trail = this.trail.toJSON();
                out.topic = this.topic.toJSON();
                out.items = this.items.toJSON();
                return out;
            },

            initialize: function(params) {
                this.trail = params.trail;
                this.topic = params.topic;
                this.items = this.topic.getItemsForTrail(this.trail.attributes.slug);
            },

			events: {
				"keyup #code":"onInputNumber"
			},

	        onInputNumber:function(params) {
		        var input = $('#code').val();
		        //retrieve any item match this code
		        var item = this.topic.getItems().findWhere({unlock_code:input});
		        if(item) {
			        //go to the page for the item
			        Backbone.history.navigate('#/item/' + item.attributes.slug);
		        }
	        }

        });

        return QRCodeEntryView;

    });