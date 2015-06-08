define([], function() {

var log_to_dom_enabled = false;

    if(log_to_dom_enabled) {
        //change the background colour of the nav menu, so logs are visible
        var sheet= document.styleSheets[0];
        sheet.insertRule('.nav-menu { background-color: white}', 10);
    }

    var Logging = {
        logToDom: function (message) {
            if (log_to_dom_enabled) {
                console.log("Logging to dom");
                var e = document.createElement('label');
                e.innerText = message;

                var br = document.createElement('br');
                var br2 = document.createElement('br');
                document.body.appendChild(e);
                document.body.appendChild(br);
                document.body.appendChild(br2);

                //window.scrollTo(0, window.document.height);
            }
        }
    };

  return Logging;

});