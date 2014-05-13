var util = require('./lib/grunt/utils.js');

module.exports = function(grunt) {

  var VERSION = util.getVersion();

  //grunt plugins
  grunt.loadNpmTasks('grunt-shell');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadTasks('lib/grunt/tasks');

  //config
  grunt.initConfig({
  
    VERSION: VERSION,
    
    init: {
        bower: {
            'angular': 'angularjs/build',
            'jquery': 'jquery'
        }
    },    
    buildapp: {
        modules: [
            {  
                name: 'stmwcIndex', // Package name 
                module: 'stmwc', // Module name
                include: [        // Include module components:
                    'directive:stmwcLayoutPage',
                    'directive:stmwcLayoutSidebar',
                    'directive:stmwcToolbar',
                    'directive:stmwcPreload',
                    'directive:stmwcBets',
                    'directive:stmwcPromoSportexpress'
                ],
                includeAsset: true,
                includeTemplates: [
                    '*'
                ]
            }
        ],
        lib: ['src/**/*.+(js|html)'],
        components: ['build/components'],
        buildDir: 'build/app',
        modulesDir: 'www/modules',
        partialsDir: 'partials',
        separateCss: true
    },
    
    builddocs:{
        main: ['appExample'],
        lib: ['docs/appExample/**/*.+(js|html)', 'src/**/*.+(js|html)'],
        components: ['build/components'],
        buildDir: 'build/docs/modules',
        partialsDir: 'build/docs/partials'
    },
    shell: {
      init: {
        command: 'bower install && bundle install --path .gems/',
        options: {
            stdout: true
        }        
      },
      angular: {
        command: '(cd bower_components/angularjs; npm install; grunt)',
        options: {
            stdout: true
        }        
      }
    }    
  });

  //alias tasks
  grunt.registerTask('package', ['shell', 'init', 'docs', 'app']);
  grunt.registerTask('app', ['buildapp']);
  grunt.registerTask('docs', ['builddocs']);
  grunt.registerTask('default', ['package']);
};
