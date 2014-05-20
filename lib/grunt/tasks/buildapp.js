var q = require('q');
var qfs = require('q-fs');
var path = require('path');
var shell = require('shelljs');
var utils = require('../utils.js');

module.exports = function(grunt) {  
  grunt.registerTask('buildapp', 'create app', function(){
       
    var config = grunt.config(this.name);
    var done = this.async();
    var promises = [];
    var cmd;
    var version = utils.getVersion();
    
    if(grunt.file.exists(config.buildDir)) {
        grunt.file.delete(config.buildDir, {force: true});
    }
    
    grunt.file.mkdir(config.buildDir);
    
    var includeRegex = /<\!--\s*@include\s*(.*?)\s*-->/g;
    var baseRegex = /<\s*base\s*href\s*=\s*['"]{0,1}(.+)['"]{0,1}.*?>/;      
    
    cmd = '(cd \'' + qfs.absolute('.') + '\';cp -R app ' + config.buildDir + '/prod;cp -R app ' + config.buildDir + '/dev;)';
    shell.exec(cmd, {silent: false});
    
    var correctBaseUri = "<script type='text/javascript'>(function(){var el=document.getElementsByTagName('base')[0];if(el)el.setAttribute('href', el.href);})();</script>\n";
    
    q.all(promises).done(function(){
    
        var modulesDir = config.buildDir + '/prod/' + config.modulesDir;
        var docRootDir = path.dirname(modulesDir);
        var partialsDir = docRootDir + '/' + config.partialsDir;

        utils.buildModules({
            main: config.modules,
            lib: config.lib,
            components: config.components,
            buildDir: modulesDir,
            partialsDir: partialsDir,
            separateCss: config.separateCss,
            includeTemplates: config.includeTemplates
        }, function(){
            grunt.file.expand([config.buildDir + '/prod/**/{*.html,index.php,tpl/*.php}','!**/' + config.partialsDir + '/*']).forEach(function(file){
                var content = grunt.file.read(file);
                
                var contentProd = content;
                var contentDev = content;
                var includes = content.match(includeRegex);
                var dirRelative;
              
                if(includes) {
                    var fileDir = path.dirname(file);
                    var linkPartials = fileDir + '/' + config.partialsDir;    
                }                             
                
                grunt.util._.forEach(includes, function(include){              
                    includeRegex.lastIndex = 0;
                    var moduleName = includeRegex.exec(include)[1];
                    var moduleDir = modulesDir + '/' + moduleName;                   
                    var includeScripts = '';
                    var includeCss = '';
                    var prefixFile = '';
                    grunt.file.expand(moduleDir + '/components.*.js').forEach(function(file){
                        includeScripts += '<script type="text/javascript" src="'+ prefixFile + file.replace(docRootDir + '/', '') +'"></script>';
                    });
                    grunt.file.expand(moduleDir + '/*.css').forEach(function(file){
                        includeCss += '<link rel="stylesheet" href="'+ prefixFile + file.replace(docRootDir + '/', '') +'" type="text/css">';
                    });
                    grunt.file.expand(moduleDir + '/*.min.js').forEach(function(file){
                        includeScripts += '<script type="text/javascript" src="'+ prefixFile + file.replace(docRootDir + '/', '') +'"></script>';
                    });

                    contentProd = contentProd.replace(include, includeCss + includeScripts);
                    
                    // ***
                    
                    var componentJS = '';
                    var componentCSS = '';
                    var assets = '';
                    grunt.file.expand(moduleDir + '/*.map','!'+moduleDir + '/*.js.map').forEach(function(file){
                      var map = JSON.parse(grunt.file.read(file));
                      grunt.util._.forEach(map.js.concat(map.css), function(files){
                        grunt.util._.forEach(files.files, function(file){
                            file = file
                                .replace(/build\/components/g, 'lib');
                            if(file.indexOf('.js') > 0){
                                componentJS += '<script type="text/javascript" src="'+ file +'"></script>\n';
                            } else {
                                componentCSS += '<link rel="stylesheet" href="'+ file +'" type="text/css" />\n';
                            }
                            
                        });            
                      }); 
                      if(map.assets){
                         assets = '<script type="text/javascript">window._assets = (window._assets || []).concat('+ JSON.stringify(map.assets) +')</script>';
                      }                     
                    });                
                    
                    var scssCompiledFile = 'build/.css/' + moduleName + '.css';
                    if(grunt.file.exists(scssCompiledFile)) {
                        componentCSS += '<link rel="stylesheet" href="scss/css/'+ moduleName + '.css" type="text/css" />\n';
                    }
                    
                    contentDev = contentDev.replace(include, componentCSS + componentJS + assets);                   
                });
                
                
                grunt.file.write(file, utils.minHTML(contentProd));
                grunt.file.write(file.replace('/prod/','/dev/'), contentDev);
                
            });
            
            var docRootDevDir = docRootDir.replace('/prod/','/dev/');

            qfs.symbolicLink(docRootDevDir + '/favicon.ico', qfs.absolute(docRootDir + '/favicon.ico'), 'dir');
            qfs.symbolicLink(docRootDevDir + '/src', qfs.absolute('src'), 'dir');
            qfs.symbolicLink(docRootDevDir + '/assets', qfs.absolute('assets'), 'dir');
            grunt.file.mkdir(docRootDevDir + '/scss/');
            qfs.symbolicLink(docRootDevDir + '/scss/css', qfs.absolute('build/.css'), 'dir');
            qfs.symbolicLink(docRootDevDir + '/lib', qfs.absolute('build/components'), 'dir');
            qfs.symbolicLink(docRootDevDir + '/' + config.partialsDir, qfs.absolute(partialsDir), 'dir');            
            
            qfs.symbolicLink(docRootDir + '/favicon.ico', qfs.absolute('favicon.ico'), 'file');
            qfs.symbolicLink(config.buildDir + '/docs', '../docs', 'dir'); 
            
            grunt.file.write(config.buildDir + '/prod/_rev', version.hash);
            grunt.file.write(config.buildDir + '/prod/.production', '');
            
            cmd = '(cd \'' + qfs.absolute('.') + '\'; cp -R assets ' + docRootDir + '/assets;)';
            shell.exec(cmd, {silent: false});
            grunt.log.ok('app created.\n\nПриложение доступно из папки ' + qfs.absolute(config.buildDir));
            done();

        });
        
    });
  
    
  });
}
