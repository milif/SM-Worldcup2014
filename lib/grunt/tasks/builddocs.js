var spawn = require('child_process').spawn;
var qfs = require('q-fs');
var utils = require('../utils.js');

module.exports = function(grunt) {  
  grunt.registerTask('builddocs', 'create docs', function(){
    
    if(grunt.file.exists('build/docs')) {
        grunt.file.delete('build/docs', {force: true});
    }

    var done = this.async();
    
    var repo = utils.getRepository();

    var docs  = spawn('node', ['docs/src/gen-docs.js']);
    docs.stdout.pipe(process.stdout);
    docs.stderr.pipe(process.stderr);
    docs.on('exit', function(code){
      if(code !== 0) grunt.fail.warn('Error creating docs');
      
      var repoUrlForGit = repo.url.replace().replace('.git', '');
      
      grunt.file.expand('build/docs/partials/**/*.html').forEach(function(file){
        grunt.file.write(file, grunt.file.read(file)
            .replace(/http:\/\/github.com\/angular\/angular.js/g, repoUrlForGit)
            .replace(/tree\/.*?\//g, 'tree/master/')
            .replace(/api\/ng\./g,'api/')
            .replace(/<a href="api\/\w+.*?:[\w-_]+\.\w+">(.*?)<\/a>/g,'$1')
            .replace(/<a href="api\/\w+\/.*?">(.*?)<\/a>/g,'$1')
        );
      });      
      
      qfs.symbolicLink('build/docs/appExample', '../../docs/appExample', 'dir');
      qfs.symbolicLink('build/docs/lib', '../components', 'dir');
      qfs.symbolicLink('build/docs/src', '../../src', 'dir');
      qfs.symbolicLink('build/docs/resource', '../../docs/resource', 'dir');
      qfs.symbolicLink('build/docs/asset', '../../asset', 'dir');
      qfs.symbolicLink('build/docs/patch', '../../../patch', 'dir');
      qfs.symbolicLink('build/docs/pull', '../../pulls', 'dir');  
      
        

      utils.buildModules(grunt.config('builddocs'), function(){
          var appExampleMap = JSON.parse(grunt.file.read(grunt.file.expand('build/docs/modules/appExample/*.map','!build/docs/modules/appExample/*.min.js.map')[0]));
          
          var componentJS = '';
          var componentCSS = '';
          
          grunt.util._.forEach(appExampleMap.js, function(files){
            grunt.util._.forEach(files.files, function(file){
                file = file
                    .replace(/build\/components/g, 'lib')
                    .replace(/docs\//g, '');
                if(file.indexOf('.js') > 0){
                    componentJS += "addTag('script', {docsdep: true, src: '" + file + "'}, sync);\n";
                } else {
                    componentCSS += "addTag('link', {docsdep: true, rel: 'stylesheet', href: '" + file + "', type: 'text/css'});";
                }
                
            });            
          });  
          grunt.file.expand('build/docs/index*.html').forEach(function(file){
            grunt.file.write(file, 
                grunt.file.read(file)
                    .replace('{deps}', componentCSS + componentJS)
            );
          });   
          
          grunt.log.ok('docs created.\n\nСайт документации доступен из папки ' + qfs.absolute('build/docs'));
          done();           
      });        

    });
  });
}
