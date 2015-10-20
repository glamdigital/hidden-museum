/**
 * Created by ahaith on 20/10/2015.
 */
define(["backbone", "app/models/interactive/SextantModel", "hbs!app/templates/interactive/sextantReading"], function(Backbone, SextantModel, sextantReadingTemplate) {

    SEXTANT_RADIUS= 500;
    SEXTANT_THICKNESS = 50;
    SEXTANT_ANGLE_RANGE = Math.PI * 40/360;

    SEXTANT_MARK_HEIGHT = 10;
    SEXTANT_MAJOR_MARK_HEIGHT = 20;

    var SextantReadingView = Backbone.View.extend({

        initialize: function() {
            this.listenTo(this.model, "change", this.render);
        },

        afterRender: function() {
            //redraw the arm on the canvas
            var canvas = this.$el[0];
            var ctx = canvas.getContext('2d');

            var pivotX = canvas.width/2;
            var pivotY = canvas.height/2 - SEXTANT_RADIUS;

            ctx.setTransform(1,0,0, 1,0,0);

            //draw the arm in the background
            ctx.strokeStyle="#000000";
            ctx.lineWidth=SEXTANT_THICKNESS;

            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.beginPath();
            ctx.arc(pivotX, pivotY, SEXTANT_RADIUS, 0.5*Math.PI - SEXTANT_ANGLE_RANGE, 0.5*Math.PI + SEXTANT_ANGLE_RANGE);
            ctx.stroke();

            //render reading mark
            ctx.beginPath();
            ctx.translate(canvas.width/2, canvas.height/2);
            ctx.moveTo(0, -SEXTANT_THICKNESS/2);
            ctx.lineTo(-SEXTANT_MARK_HEIGHT, -SEXTANT_THICKNESS/2 - SEXTANT_MARK_HEIGHT);
            ctx.lineTo(SEXTANT_MARK_HEIGHT, -SEXTANT_THICKNESS/2 - SEXTANT_MARK_HEIGHT);
            ctx.closePath();
            ctx.fillStyle = '#ff0000';
            ctx.fill();


            //render numbers -60 to +60;
            for(var i=-60; i<=60; i+=1)
            {
                ctx.setTransform(1,0,0, 1,0,0);
                ctx.translate(canvas.width/2, canvas.height/2);


                this.drawNumber(i, ctx);
            }

        },

        //draws a number at its appropriate position
        drawNumber: function(num, ctx) {

            //console.log("drawing number:", num);
            var angle = (num + this.model.attributes.angle/2) * Math.PI/180  ;
            ctx.translate(0, -SEXTANT_RADIUS);
            ctx.rotate(-angle);
            ctx.translate(0, SEXTANT_RADIUS);
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';

            var height = (num%5 == 0) ? SEXTANT_MAJOR_MARK_HEIGHT : SEXTANT_MARK_HEIGHT;

            //draw number
            if(num%10 == 0) {
                height = SEXTANT_MARK_HEIGHT;
                ctx.font="30px Arial";
                ctx.fillStyle="#FFFFFF";
                ctx.fillText(num, 0, 0);
            }

            //draw notches
            ctx.beginPath();
            ctx.moveTo(0, -SEXTANT_THICKNESS/2);
            ctx.lineTo(0, -SEXTANT_THICKNESS/2 + height);
            ctx.lineWidth = 3;
            ctx.strokeStyle = "#FFFFFF";
            ctx.stroke();
        }
    });

    return SextantReadingView;

});