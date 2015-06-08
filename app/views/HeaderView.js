define(['backbone', 'hbs!app/templates/header'], function(Backbone, headerTemplate) {

    var HeaderView = Backbone.View.extend({
        template: headerTemplate,

        serialize: function() {
            var out = {};
            out.prevURL = this.prevURL;
            out.showPrevURL = this.prevURL !== null;
            out.nextURL = this.nextURL;
            out.showNextURL = this.nextURL !== null;
            out.logoURL = this.logoURL;
            out.showLogoURL = this.logoURL !== null;
            return out;
        },

        initialize: function(params) {
            this.prevURL = params.prevURL;
            this.nextURL = params.nextURL;
            this.logoURL = params.logoURL;
        },

        setPrevURL: function(url) {
            this.prevURL = url;
        },
        setLogoURL: function(url) {
            this.logoURL = url;
        },
        setNextURL: function(url) {
            this.nextURL = url;
        }
    });

    return HeaderView;
});