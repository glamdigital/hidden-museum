define(["backbone", "hbs!app/templates/finished"], function(Backbone, finishedTemplate) {

  var FinishedView = Backbone.View.extend({

    template: finishedTemplate,

      initialize: function(params) {
        this.trail = params.trail;
        this.instagramIsInstalled = false;
          var ig = typeof(Instagram);
          if(typeof(Instagram) !== "undefined") {
              Instagram.isInstalled(function (err, installed) {
                  if (installed) {
                      console.log("Instagram is", installed); // installed app version on Android
                      this.instagramIsInstalled = true;
                  } else {
                      console.log("Instagram is not installed");
                  }
              }.bind(this));
          }
      },

      serialize: function() {
          var out = {};
          out.trail = this.trail.toJSON();
          return out;
      },

      afterRender: function() {
          var canvas = $('#insta')[0];
          var ctx = canvas.getContext('2d');
          this.dataURL = null;
          var img = new Image;
          img.crossOrigin = 'Anonymous';
          img.onload = function() {
              canvas.height = img.height;
              canvas.width = img.width;
              ctx.drawImage(img, 0,0);
              this.dataURL = canvas.toDataURL('image/png');
              canvas = null;
          };
          img.src = this.trail.attributes.share_image;
      },
      events: {
          "click #share-facebook": "onClickFacebook",
          "click #share-twitter": "onClickTwitter",
          "click #share-instagram": "onClickInstagram"
      },
      onClickFacebook: function(event) {
          var is_iOS = navigator.userAgent.match(/(iPhone|iPod|iPad)/);
          // iOS 7+ has a nice system message if an account isn't configured, so always attempt the share
          var alertNotAvailable = is_iOS? null : function () { navigator.notification.alert("Please check that you have the Twitter app installed", null, "Not available", "OK"); };

          window.plugins.socialsharing.shareViaFacebook(this.buildShareMessage(), this.trail.attributes.shareURL, null, null, alertNotAvailable);
      },
      onClickTwitter: function(event) {
          var is_iOS = navigator.userAgent.match(/(iPhone|iPod|iPad)/);
          // iOS 7+ has a nice system message if an account isn't configured, so always attempt the share
          var alertNotAvailable = is_iOS? null : function () { navigator.notification.alert("Please check that you have the Twitter app installed", null, "Not available", "OK"); };

          window.plugins.socialsharing.shareViaTwitter(this.buildShareMessage(), this.trail.attributes.shareURL, null, null, alertNotAvailable);
      },
      onClickInstagram: function(event) {
          if(this.instagramIsInstalled) {
              Instagram.share('insta', this.buildShareMessage(), function (err) {
                  if (err) {
                      console.log("not shared");
                  } else {
                      console.log("shared");
                  }
              });
          }
          else {
              console.log("Unable to share as Instagram is not installed");
              alert("Instagram is not installed on your device. Please install and try again.");
              //TODO check whether installed when user tries again.
          }
      },
      buildShareMessage: function() {
          return this.trail.attributes.share_message;
      }

  });

  return FinishedView;

});
