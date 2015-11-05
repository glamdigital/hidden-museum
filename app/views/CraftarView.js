define(['backbone', 'hbs!app/templates/craftar'], function(Backbone, craftarTemplate) {
    
    var CraftarView = Backbone.View.extend({
        template: craftarTemplate,
        
        serialize: function() {
            return {};
        },
        
        initialize: function(params) {
            console.log('Verifying craftar environment');
            console.log('window.CraftAR exists:                           ' + !!window.CraftAR);
            if (window.CraftAR) {
                console.log('window.CraftAR.startView() exists:               ' + !!window.CraftAR.startView);
                console.log('window.CraftAR.startView() is a function:        ' + (typeof window.CraftAR.startView === 'function'));
            }
            
            console.log('window.craftarjs exists:                         ' + !!window.craftarjs);
            if (window.craftarjs) {
                console.log('window.craftarjs.setToken() exists:              ' + !!window.craftarjs.setToken);
                console.log('window.craftarjs.setToken() is a function:       ' + (typeof window.craftarjs.setToken === 'function'));
                console.log('window.craftarjs.setAutomaticAR() exists:        ' + !!window.craftarjs.setAutomaticAR);
                console.log('window.craftarjs.setAutomaticAR() is a function: ' + (typeof window.craftarjs.setAutomaticAR === 'function'));
            }
        },
        
        events: {
            'click .foo': 'onFoo'
        },
        
        onFoo: function (event) {
            event.preventDefault();
            
            console.log('Foo!');
            
            if (window.CraftAR) {
                console.log('Calling window.CraftAR.startView()');
                
                window.CraftAR.startView(
                    function onSuccess() {
                        // This never gets callled....?
                        console.log('window.CraftAR.startView() reports success');
                    },
                    
                    function onError(error) {
                        console.log('window.CraftAR.startView() reports error');
                        console.log(error);
                    },
                    
                    { loadUrl: 'ar_overlay.html' }
                );
            
            }
            
            // //window.craftarjs.setToken("catchoomcooldemo");
            // if (window.craftarjs) {
            //     console.log('Calling window.craftarjs.setToken()');
            //     window.craftarjs.setToken('6e59b1f447764e9d99c85b5534112e40');
            // }
            
            // if (window.craftarjs) {
            //     console.log('Calling window.craftarjs.restartCamera()');
            //     window.craftarjs.restartCamera();
            // }
            
            // if (window.craftarjs) {
            //     console.log('Calling window.craftarjs.startFinding()');
            //     window.craftarjs.startFinding();
            // }
            
            // if (window.craftarjs) {
            //     console.log('Calling window.craftarjs.setAutomaticAR()');
            //     window.craftarjs.setAutomaticAR(true);
            // }
        }
    });
    
    return CraftarView;
});
