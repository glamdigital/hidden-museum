/*global module:false*/

    var plugins = [
        'cordova-plugin-device',
        'com.darktalker.cordova.screenshot',
        'https://github.com/ox-it/cordova-plugin-camera-preview.git',    //com.mbppower.camerapreview
        'cordova-plugin-ble-central',
        'cordova-plugin-camera',
        'cordova-plugin-file',
        'cordova-plugin-media',
        // 'cordova-plugin-screen-orientation',     //no longer using, vuforia interferes with it
        'cordova-plugin-statusbar',
        'cordova-plugin-vibration',
        'https://github.com/ox-it/cordova-plugin-vuforia',
        'cordova-plugin-google-analytics'
        //add further plugins here
    ]
    
    var platforms = [
        'ios',
        // 'android@3.7.1'
        //add further platforms here
    ]

module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    // Metadata.
    meta: {
      version: '0.1.0'
    },
    banner: '/*! PROJECT_NAME - v<%= meta.version %> - ' +
      '<%= grunt.template.today("yyyy-mm-dd") %>\n' +
      '* http://PROJECT_WEBSITE/\n' +
      '* Copyright (c) <%= grunt.template.today("yyyy") %> ' +
      'YOUR_NAME; Licensed MIT */\n',
    // Task configuration.
    compass: {
      dist: {
        options: {
          config: 'config.rb'
        }
      }
    },
    concat: {
      options: {
        banner: '<%= banner %>',
        stripBanners: true
      },
      dist: {
        src: ['lib/FILE_NAME.js'],
        dest: 'dist/FILE_NAME.js'
      }
    },
    uglify: {
      options: {
        banner: '<%= banner %>'
      },
      dist: {
        src: '<%= concat.dist.dest %>',
        dest: 'dist/FILE_NAME.min.js'
      }
    },
    jshint: {
      options: {
        curly: true,
        eqeqeq: true,
        immed: true,
        latedef: true,
        newcap: true,
        noarg: true,
        sub: true,
        undef: true,
        unused: true,
        boss: true,
        eqnull: true,
        browser: true,
        globals: {
          jQuery: true
        }
      },
      gruntfile: {
        src: 'Gruntfile.js'
      },
      lib_test: {
        src: ['lib/**/*.js', 'test/**/*.js']
      }
    },
    qunit: {
      files: ['test/**/*.html']
    },
    concurrent: {
      options: {
        logConcurrentOutput: true
      },
      startServerWatch: {
        tasks: ["wait:develRunAndroid", "wait:develRunIos","shell:hcpserver", "watch:styles", "watch:appfiles"]
      }
    },
    wait: {
      develRunAndroid: {      
          options: {
              delay: 6000,
              after : function() {
                  grunt.task.run('develrun:android');
              }
          }
      },
      develRunIos: {      
          // options: {
          //     delay: 2000,
          //     after : function() {
          //         grunt.task.run('develrun:ios');
          //     }
          // }
      }
    },
    watchfiles: {
        all: [
            // 'www/{,*/}*.html',
            // 'www/js/{,*/,*/}*.js',
            // 'www/css/{,*/}*.css',
            // 'www/img/{,*/}*.{png,jpg,jpeg,gif,webp,svg}',
          'sass/*.scss'
        ]
    },

    watch: {
      gruntfile: {
        files: '<%= jshint.gruntfile.src %>',
        tasks: ['jshint:gruntfile']
      },
      lib_test: {
        files: '<%= jshint.lib_test.src %>',
        tasks: ['jshint:lib_test', 'qunit']
      },
      appfiles: {
        files: [
            'app/**/*',
            'css/*',
        ],
        tasks: ['copy:devel']
      },
      styles: {
        files: ['<%=watchfiles.all %>'],
        tasks: ['compass']
      }
    },
    "phonegap-build": {
      options: {
        appId: 1274129
      },
      release: {
        options: {
          archive: "app.zip",
        }
      }
    },
    compress: {
      release: {
        options: {
          archive: "app.zip",
          mode: "zip",
        },
        files: [
          {
            expand: true,
            cwd: '',
            src: [
              'img/**',
              'app/data/**',
              'audio/**',
	          'video/**',
              'css/**',
              'app/built.js',
              'config.xml',
              ],
            dest:'',
            filter:'isFile'
          },
          {
            expand: true,
            src: [
              'index-built.html',
            ],
            rename: function(dest,src) { return 'index.html'; }
          }
        ]
      }
    },
    requirejs: {
      //release: {
        compile: {
          options: {
            mainConfigFile: "require.config.js",
            name: "app/libs/almond/almond.js", // assumes a production build using almond
            out: "app/built.js",
            include: ['app/main'],
            // optimize: 'none',
          }
        }
      //}
    },
    convert: {
      options: {
        explicitArray: false,
      },
      trails: {
        src: ['HiddenMuseumData/HiddenMuseumData - Trails.csv'],
        dest: 'app/data/trails.json'
      },
      topics: {
        src: ['HiddenMuseumData/HiddenMuseumData - Components.csv'],
        dest: 'app/data/topics.json'
      },
      items: {
        src: ['HiddenMuseumData/HiddenMuseumData - Items.csv'],
        dest: 'app/data/items.json'
      },
      trails: {
        src: ['HiddenMuseumData/HiddenMuseumData - Galleries.csv'],
        dest: 'app/data/galleries.json'
      },
      topics: {
        src: ['HiddenMuseumData/HiddenMuseumData - Objects.csv'],
        dest: 'app/data/objects.json'
      },
      items: {
        src: ['HiddenMuseumData/HiddenMuseumData - Content.csv'],
        dest: 'app/data/contentitems.json'
      },
      blackboards: {
        src: ['HiddenMuseumData/HiddenMuseumData - Blackboards.csv'],
        dest: 'app/data/blackboards.json'
      },
    },
    jasmine: {
        testTask: {
            src: ['app/models/*.js', 'app/collections/*.js', 'app/views/*.js', 'app/location.js', 'app/main.js', 'app/router.js'],
            options: {
                specs: ['app/test/specs/*Specs.js'],
                template: require('grunt-template-jasmine-requirejs'),
                //host: 'http://127.0.0.1:8088/',
                templateOptions: {
                    requireConfigFile: './require.config.js'
                }
            }
        }
    },
	  clean: ["www"],
	  cordovacli: {
		  options: {
			  path: 'app'
		  },
		  ios: {
			  options: {
				  command: 'build',
				  platforms: ['ios']
			  }
		  },
		  android: {
			  options: {
				  command: 'build',
				  platforms: ['android']
			  }
		  },
		  android_e: {
			  options: {
				  command: 'emulate',
				  platforms: ['android'],
				  args: ['--target', 'Nexus5']
			  }
		  },
		  ios_e: {
			  options: {
				  command: 'emulate',
				  platforms: ['ios']
			  }
		  },
		  android_r: {
			  options: {
				  command: 'run',
				  platforms: ['android']
			  }
		  },
		  ios_r: {
			  options: {
				  command: 'run',
				  platforms: ['ios']
			  }
		  },
          add_plugins: {
              options: {
                command: 'plugin',
                action: 'add',  
                plugins: plugins,
            }
          },
          add_platforms: {
              options: {
                  command: 'platform',
                  action: 'add',
                  platforms: platforms
              }
          }
          
          
	  },
    shell: {
      hcpserver: {
        command: 'cordova-hcp server',
        options: {
          stderr: true,
          stdout: true
        }
      },
    },
	  copy: {
        main: {
            files: [
                {   expand: true,
                    src: ["app/built.js",
                        "app/data/**",
                        "img/**",
	                    "audio/**",
	                    "video/**",
                        "css/**",
                        "fonts/**",
                        "targets/**"
                        ],
                    dest: "www" },
                {   src: ["index-built.html"],
                    dest: "www/index.html" },
                {
  		            src: ["app/libs/font-awesome/css/font-awesome.min.css"],
  		            dest: "www/css/font-awesome.min.css"
	              },
                {
  		            src: ["app/libs/owl.carousel/dist/assets/owl.carousel.min.css"],
  		            dest: "www/css/owl.carousel.min.css"
	              },
                {
  		            src: ["app/libs/owl.carousel/dist/assets/owl.theme.default.css"],
  		            dest: "www/css/owl.theme.default.css"
	              },
                {
	                expand: true,
	                flatten: true,
		            src: ["app/libs/font-awesome/fonts/*"],
		            dest: "www/fonts"
	            }
            ]
        },
        devel: {
          files: [
            {   expand: true,
                src: ["app/**",
                    "img/**",
                    "audio/**",
                    "video/**",
                    "css/**",
                    "fonts/**",
                    "targets/**"
                    ],
                dest: "www" },
            {   src: ["require.config.js"],
                dest: "www/require.config.js" },
            {   src: ["index.html"],
                dest: "www/index.html" }
          ]
        }
    },
  });

  // These plugins provide necessary tasks.
  //grunt.loadNpmTasks('grunt-contrib-concat');
  //grunt.loadNpmTasks('grunt-contrib-uglify');
  //grunt.loadNpmTasks('grunt-contrib-qunit');
  //grunt.loadNpmTasks('grunt-contrib-jshint');
  //grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-compass');
  grunt.loadNpmTasks('grunt-phonegap-build');
  grunt.loadNpmTasks('grunt-contrib-compress');
  grunt.loadNpmTasks('grunt-contrib-requirejs');
  grunt.loadNpmTasks('grunt-convert');
  grunt.loadNpmTasks('grunt-contrib-jasmine');
  grunt.loadNpmTasks('grunt-cordovacli');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-concurrent');
  grunt.loadNpmTasks('grunt-shell');
  grunt.loadNpmTasks('grunt-wait');
  grunt.loadNpmTasks('grunt-contrib-watch');


  grunt.registerTask('package', 'Process all source files and zip to app.zip', ['requirejs', 'compass', 'compress']);

  // push - push the build to phonegap with the auth token provided as an argument
  // e.g. grunt push:<PhoneGapToken>
  grunt.registerTask('push', 'Push app.zip to phonegap cloud build. Supply auth token as argument', function(token) {
    if(!token) { grunt.log.error("Please specify auth token as an argument.  grunt push:<token>");}
    grunt.config.set('phonegap-build.options.user', { token: token });
    grunt.task.run('phonegap-build');
  });
  grunt.registerTask('packageLocal', 'prepares for local build by compiling js/css and copying assets across', ['requirejs', 'compass', 'clean', 'copy:main']);

	//grunt localbuild:<ios|android>
  grunt.registerTask('localbuild', "Runs the appropriate pre-build steps then invokes cordova's build command", function(arg) {
      if (!arg) { arg='ios'; }
      //use different package step for android
      //if(arg.indexOf('android') >=0 ) {
      //    grunt.task.run('packageLocalAndroid');
      //}
      //else {
          grunt.task.run('packageLocal');
      //}
      grunt.task.run('cordovacli:' + arg);
  });

  //grunt cloudbuild:<PhoneGapToken>
  grunt.registerTask('cloudbuild', 'Runs package then pushes to phonegap cloud build. Supply auth token as argument', function(token) {
    //package
    grunt.task.run('package');
    grunt.task.run('push:' + token);
  });

  grunt.registerTask('convertData', 'convert csv data to json format required by the app', ['convert:trails', 'convert:topics', 'convert:items', 'convert:blackboards']);

  grunt.registerTask('test', 'Run jasmine tests', ['jasmine']);
  
  grunt.registerTask('plugins', 'cordovacli:add_plugins');
  grunt.registerTask('platforms', 'cordovacli:add_platforms');
  grunt.registerTask('setup', ['cordovacli:add_platforms', 'cordovacli:add_plugins'] );


  grunt.registerTask('devel', "Copy app folder to www. Start the hot-push server. Watch for changes in the App folder", function(arg) {
     grunt.task.run('compass');
     grunt.task.run('clean');
     grunt.task.run('copy:devel');
     grunt.task.run('concurrent:startServerWatch');
  });

  grunt.registerTask('develrun', "Run the app on the device, listen to hot-push server for changes", function(arg) {
    if (!arg) { arg='android'; }
    grunt.task.run('cordovacli:'+ arg + '_r');
  });
  
  // to use the hot-code-push plugin
  // grunt devel-> compass, copy app and css files to www, start the server, start the clients
  // grunt develrun:android-> start android client
  // grunt develrun:ios-> start ios client

};
