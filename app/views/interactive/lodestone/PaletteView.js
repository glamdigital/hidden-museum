/**
 * Created by ahaith on 02/11/2015.
 */
define([
        'backbone',
        'hbs!app/templates/interactive/palette',
        ],
    function(
        Backbone,
        paletteTemplate
    ) {

        var PaletteView = Backbone.View.extend({
            template: paletteTemplate,

            initialize: function(params) {
                this.choices = params.choices;
            },

            serialize: function() {
                return {choices:this.choices};
            },

            events: {
                'click .palette-choice': 'onClickChoice'
            },

            onClickChoice: function(ev) {
                $target = $(ev.target).parents('.palette-choice');
                var choiceID = $target.attr('choice-key');
                var choice = this.choices[choiceID];
                this.trigger('choice-clicked', choice);
            }
        });

        return PaletteView;
    }
);