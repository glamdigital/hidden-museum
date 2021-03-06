/**
 * Created by ahaith on 20/10/2015.
 */
define([
        "backbone",
        "hbs!app/templates/interactive/sextantReading"
    ],
    
    function (Backbone, sextantReadingTemplate) {
        SEXTANT_RADIUS= 480;
        SEXTANT_THICKNESS = 45;
        SEXTANT_RADIUS_TABLET= 1200;
        SEXTANT_THICKNESS_TABLET = 60;
        SEXTANT_ANGLE_RANGE = Math.PI * 60/360;
        
        SEXTANT_MARK_HEIGHT = 8;
        SEXTANT_MAJOR_MARK_HEIGHT = 16;

        SEXTANT_VERTICAL_ADJUSTMENT = 10;
        
        var SextantReadingView = Backbone.View.extend({
            initialize: function () {
                this.listenTo(this.stateModel, "change", this.render);
            },
            
            afterRender: function () {
                //redraw the arm on the canvas
                var canvas = this.$el[0];
                
                if (canvas.clientWidth>=768) {
                  this.sextant_radius = SEXTANT_RADIUS_TABLET;
                  this.sextant_thickness = SEXTANT_THICKNESS_TABLET;
                  canvas.width = canvas.clientWidth;
                  canvas.height = canvas.clientHeight;
                } else {
                  this.sextant_radius = SEXTANT_RADIUS;
                  this.sextant_thickness = SEXTANT_THICKNESS;
                }

                var ctx = canvas.getContext('2d');
                
                var pivotX = canvas.width/2;
                var pivotY = canvas.height/2 - this.sextant_radius - SEXTANT_VERTICAL_ADJUSTMENT;
                
                ctx.setTransform(1,0,0, 1,0,0);
                
                //draw the arm in the background
                ctx.strokeStyle="#000000";
                ctx.lineWidth=this.sextant_thickness;
                
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.beginPath();
                ctx.arc(pivotX, pivotY, this.sextant_radius, 0.5*Math.PI - SEXTANT_ANGLE_RANGE, 0.5*Math.PI + SEXTANT_ANGLE_RANGE);
                ctx.stroke();
                
                //render reading mark
                ctx.beginPath();
                ctx.translate(canvas.width/2, canvas.height/2);
                ctx.moveTo(0, -this.sextant_thickness/2);
                ctx.lineTo(-SEXTANT_MARK_HEIGHT, -this.sextant_thickness/2 - SEXTANT_MARK_HEIGHT);
                ctx.lineTo(SEXTANT_MARK_HEIGHT, -this.sextant_thickness/2 - SEXTANT_MARK_HEIGHT);
                ctx.closePath();
                ctx.fillStyle = '#ff0000';
                ctx.fill();
                
                //render numbers -60 to +60;
                var i;
                for (i = -60; i <= 60; i += 1)
                {
                    ctx.setTransform(1,0,0, 1,0,0);
                    ctx.translate(canvas.width/2, canvas.height/2 - SEXTANT_VERTICAL_ADJUSTMENT);
                    
                    this.drawNumber(i, ctx);
                }
            },
            
            //draws a number at its appropriate position
            drawNumber: function (num, ctx) {
                //console.log("drawing number:", num);
                var angle = (num + this.stateModel.attributes.angle/2) * Math.PI/180  ;
                ctx.translate(0, -this.sextant_radius);
                ctx.rotate(-angle);
                ctx.translate(0, this.sextant_radius);
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                
                var height = (num%5 === 0) ? SEXTANT_MAJOR_MARK_HEIGHT : SEXTANT_MARK_HEIGHT;
                
                //draw number
                if (num%10 === 0) {
                    height = SEXTANT_MARK_HEIGHT;
                    ctx.font="24px Arial";
                    ctx.fillStyle="#FFFFFF";
                    ctx.fillText(-num*2, 0, 0);
                }
                
                //draw notches
                ctx.beginPath();
                ctx.moveTo(0, -this.sextant_thickness/2);
                ctx.lineTo(0, -this.sextant_thickness/2 + height);
                ctx.lineWidth = 3;
                ctx.strokeStyle = "#FFFFFF";
                ctx.stroke();
            }
        });
        
        return SextantReadingView;
    }
);
