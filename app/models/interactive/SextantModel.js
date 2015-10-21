/**
 * Created by ahaith on 20/10/2015.
 */
define(["backbone", "moment"], function(Backbone, moment) {

    LAT_CALCULATION_DATE = '2015-06-20'; //summer solstice

    var SextantModel = Backbone.Model.extend({
        defaults: {
            angle: 45,
            mode: 'sun',
        },

        getLatitude: function() {
            if( this.attributes.mode == 'sun') {
                //Calculation based on information here http://astronavigationdemystified.com/latitude-from-the-midday-sun/

                //calculated declination - angle up to the sun as a function of time of year
                var refDate = moment();
                //var refDate = moment(LAT_CALCULATION_DATE);

                var year = refDate.year();

                //this is based on the spring equinox being 21st March (it was in 2015). Future years may be inaccurate.
                var solstice = moment(year + "-03-21");
                var daysSinceSpringEquinox= refDate.diff(solstice, 'days');

                //calculate approximate declination of sun on this date
                var declination = 23.45 * Math.sin( 2*Math.PI * daysSinceSpringEquinox/365.25 );

                //assume that the latitude is greater than the declination
                // therefore lat = DEC + (90 - ALT)

                var latitude = declination + (90 - this.attributes.angle);

                return latitude;

            }
            else if ( this.attributes.mode == 'pole star') {
                //latitude is just the angle measured by the sextant
                return this.attributes.angle;
            }
        }

    });

    return SextantModel;
});