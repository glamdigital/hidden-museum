require.config({
  // baseUrl: "./app",
  shim: {

  },
  paths: {
    almond: "app/libs/almond/almond",
    backbone: "app/libs/backbone/backbone",
    fastclick: "app/libs/fastclick/lib/fastclick",
    handlebars: "app/libs/handlebars/handlebars",
    jquery: "app/libs/jquery/dist/jquery",
    requirejs: "app/libs/requirejs/require",
    underscore: "app/libs/underscore/underscore",
    layoutmanager: "app/libs/layoutmanager/backbone.layoutmanager",
    hbs: "app/libs/require-handlebars-plugin/hbs",
    jasmine: "app/libs/jasmine/lib/jasmine-core",
    move: "app/libs/movejs/move",
    fulltilt: "app/libs/fulltilt/dist/fulltilt",
    moment: "app/libs/momentjs/moment",
    victor: "app/libs/victor/build/victor",
    three: "app/libs/three.js/three"
  },
  packages: [

  ],
  //config for the 'require-handlebars-plugin'
  hbs: { // optional
    helpers: true,            // default: true
    i18n: false,              // default: false
    templateExtension: 'handlebars', // default: 'hbs'
    partialsUrl: ''           // default: ''
  }
});

require(['app/main']);
