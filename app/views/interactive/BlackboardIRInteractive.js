/**
 * Created by ahaith on 30/10/2015.
 */
define([
    'backbone',
    'underscore',
    'hbs!app/templates/interactive/bb_ir',
    'app/mixins/overlay',
    'hbs!app/templates/overlay_interactive_inner',
], function(
    Backbone,
    _,
    bb_irTemplate,
    overlayMixin,
    interactiveInnerTemplate
) {

    var IRInteractView = Backbone.View.extend({
        template: bb_irTemplate,

        intialize: function(params) {
            this.overlayInitialize({ displayOnArrival: true});
            this.overlaySetTemplate(interactiveInnerTemplate, this.model.toJSON());
        },

        afterRender: function() {

        },

        cleanup: function() {
            this.overlayCleanup();
        }
    });

    _.extend(IRInteractView.prototype, overlayMixin);

    return IRInteractView;

})