define(['backbone', 'jquery', 'hbs!app/templates/user_prompt'], function(Backbone, $, userPromptTemplate) {

    var UserPromptView = Backbone.View.extend({
        template: userPromptTemplate,

        initialize: function(params) {
            this.title = params.title;
            this.subtitle = params.subtitle;
            this.no_string = params.no_string;
            this.yes_string = params.yes_string;
            this.noCallback = params.noCallback;
            this.yesCallback = params.yesCallback;
            this.vibrate = params.vibrate;
            this.$el.show();
        },

        serialize: function() {
            var out = {}
            out.title = this.title;
            out.subtitle = this.subtitle;
            out.yes_string = this.yes_string;
            out.no_string = this.no_string;
            return out;
        },

        afterRender: function() {
            //position at base of screen
            var sHeight = $(window).height();
            var elementHeight = this.$el.outerHeight();
            var offset = sHeight - elementHeight;
            this.$el.css('top', '' + offset + 'px');
            if(this.vibrate && navigator.notification) {
                navigator.notification.vibrate(500);
            }
        },

        events: {
            "click .yes" : "onYes",
            "click .no" : "onNo"
        },

        onYes: function() {
            this.yesCallback();
            this.$el.hide();
        },

        onNo: function() {
            this.noCallback();
            this.$el.hide();
        }

    });

    return UserPromptView;
});