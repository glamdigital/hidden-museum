/**
 * Created by ahaith on 20/10/2015.
 */
define(["backbone", "app/models/interactive/SextantModel", "hbs!app/templates/interactive/sextantReading"], function(Backbone, SextantModel, sextantReadingTemplate) {

    SEXTANT_RADIUS= 500;
    SEXTANT_THICKNESS = 50;
    SEXTANT_ANGLE_RANGE = Math.PI * 40/360;

    var SextantReadingView = Backbone.View.extend({

        initialize: function() {
            this.listenTo(this.model, "change", this.render);
        },

        afterRender: function() {
            //redraw the arm on the canvas
            var ctx = this.$el[0].getContext('2d');

            var pivotX = this.$el.width()/2;
            var pivotY = this.$el.height()/2 - SEXTANT_RADIUS;

            //draw the arm in the background
            ctx.strokeStyle="#000000";
            ctx.lineWidth=SEXTANT_THICKNESS;

            ctx.clearRect(0, 0, this.$el.width(), this.$el.height());
            ctx.beginPath();
            ctx.arc(pivotX, pivotY, SEXTANT_RADIUS, 0.5*Math.PI - SEXTANT_ANGLE_RANGE, 0.5*Math.PI + SEXTANT_ANGLE_RANGE);
            ctx.stroke();
        }
    });

    return SextantReadingView;

});