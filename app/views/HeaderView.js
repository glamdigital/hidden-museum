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
        
        afterRender: function () {
            //set height of 'content' div.
            var headerHeight = $('#prheader').outerHeight();
            $('.content').height($(window).height() - headerHeight);
        },
        
        initialize: function(params) {
            this.prevURL = params.prevURL;
            this.nextURL = params.nextURL;
            this.logoURL = params.logoURL;
            document.addEventListener("backbutton", function() {
              var fragment = Backbone.history.getFragment();
              if (fragment == "trails" || fragment =="") {
                // if we currently are in the starting view
                navigator.app.exitApp();
              } else {
                if ($(".back-link").length) {
                  // if there is a back button
                  Backbone.history.navigate($(".back-link").attr("href"));
                } else {
                  // if this is a video or interactive view
                  return false;
                }
              }
            }.bind(this), false);

        },
        
        events: {
            'click .nav-button.header-info': 'emitNavInfo'
        },
        
        setPrevURL: function(url) {
            this.prevURL = url;
        },
        setLogoURL: function(url) {
            this.logoURL = url;
        },
        setNextURL: function(url) {
            this.nextURL = url;
        },
        
        emitNavInfo: function (event) {
            event.preventDefault();
            
            // No arguments for the nav_info event as navigation header not responsible
            // for state whereas subscribers to the event are.
            Backbone.trigger('nav_info');
        }
    });
    
    return HeaderView;
});
