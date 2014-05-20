var fs = require('fs');
var path = require('path');
var crypto = require('crypto');
var qfs = require('q-fs');
var shell = require('shelljs');
var grunt = require('grunt');
var spawn = require('child_process').spawn;
var qfs = require('q-fs');

var version;
var package;

var utils = module.exports = {

  init: function() {
    shell.exec('npm install');
  },
  getPackage: function(){
    if(!package) {
        package = JSON.parse(fs.readFileSync('package.json', 'UTF-8'));
    }
    return package;
  },
  getName: function(){
    return this.getPackage().name;
  },
  getRepository: function(){
    var repo = this.getPackage().repository;  
    var match = repo.url.match(/\/\/([^\/]+)\/([^\/]+)\/(.*?)\.git/);   
    repo.name = match[3];
    repo.company = match[2];  
    return repo;
  },
  getVersion: function(){
    var package = this.getPackage();
    var match = package.version.match(/^([^\-]*)(-snapshot)?$/);
    var semver = match[1].split('.');
    var hash = shell.exec('git rev-parse --short HEAD', {silent: true}).output.replace('\n', '');

    var fullVersion = (match[1] + (match[2] ? '-' + hash : ''));
    var numVersion = semver[0] + '.' + semver[1] + '.' + semver[2];
    var version = {
      hash: hash,
      number: numVersion,
      full: fullVersion,
      major: semver[0],
      minor: semver[1],
      dot: semver[2],
      codename: package.codename,
      cdn: package.cdnVersion
    };

    return version;
  },
  
  wrapNG: function(src, name){
    src.unshift('components/angularjs/src/' + name + '.prefix');
    src.push('components/angularjs/src/' + name + '.suffix');
    return src;
  },

  addStyle: function(src, styles, minify){
    styles = styles.map(processCSS.bind(this)).join('\n');
    src += styles;
    return src;

    function processCSS(file){
      var css = fs.readFileSync(file).toString();
      if(minify){
        css = css
          .replace(/\r?\n/g, '')
          .replace(/\/\*.*?\*\//g, '')
          .replace(/:\s+/g, ':')
          .replace(/\s*\{\s*/g, '{')
          .replace(/\s*\}\s*/g, '}')
          .replace(/\s*\,\s*/g, ',')
          .replace(/\s*\;\s*/g, ';');
      }
      //escape for js
      css = css
        .replace(/\\/g, '\\\\')
        .replace(/'/g, "\\'")
        .replace(/\r?\n/g, '\\n');
      return "angular.element(document).find('head').append('<style type=\"text/css\">" + css + "</style>');";
    }
  },


  process: function(src, VERSION, strict){
    var processed = src
      .replace(/"NG_VERSION_FULL"/g, VERSION.full)
      .replace(/"NG_VERSION_MAJOR"/, VERSION.major)
      .replace(/"NG_VERSION_MINOR"/, VERSION.minor)
      .replace(/"NG_VERSION_DOT"/, VERSION.dot)
      .replace(/"NG_VERSION_CDN"/, VERSION.cdn)
      .replace(/"NG_VERSION_CODENAME"/, VERSION.codename);
    if (strict !== false) processed = this.singleStrict(processed, '\n\n', true);
    return processed;
  },


  build: function(config, fn){
    var files = grunt.file.expand(config.src);
    var styles = config.styles;
    //concat
    var src = files.map(function(filepath){
      return grunt.file.read(filepath);
    }).join(grunt.util.normalizelf('\n'));
    //process
    var processed = this['process' + config.process](src, grunt.config(config.process + '_VERSION'), config.strict);
    if (styles) processed = this.addStyle(processed, styles.css, styles.minify);
    //write
    grunt.file.write(config.dest, processed);
    grunt.log.ok('File ' + config.dest + ' created.');
    fn();
  },


  singleStrict: function(src, insert){
    return src
      .replace(/\s*("|')use strict("|');\s*/g, insert) // remove all file-specific strict mode flags
      .replace(/(\(function\([^)]*\)\s*\{)/, "$1'use strict';"); // add single strict mode flag
  },


  sourceMap: function(mapFile, fileContents) {
    // use the following once Chrome beta or stable supports the //# pragma
    // var sourceMapLine = '//# sourceMappingURL=' + mapFile + '\n';
    var sourceMapLine = '/*\n//@ sourceMappingURL=' + mapFile + '\n*/\n';
    return fileContents + sourceMapLine;
  },

  buildModules: function(config, done){
  
    var tempDir = path.dirname(config.buildDir) + '/_' + new Date().getTime();

    try {
        _build(tempDir, config, done);
    } catch (e) {
        grunt.file.delete(tempDir, {force: true});
        throw e;
    }  
  },
  minHTML: function(html){
    return html.replace(/\r?\n/g, '')
               .replace(/ {2,}/g,' ')
               .replace(/<!--.*?-->/g,'');
  },
  min: function(file, done) {
    var classPathSep = (process.platform === "win32") ? ';' : ':';
    var minFile = file.replace(/\.js$/, '.min.js');
    var mapFile = minFile + '.map';
    var mapFileName = mapFile.match(/[^\/]+$/)[0];
    var errorFileName = file.replace(/\.js$/, '-errors.json');
    shell.exec(
        'java ' +
            this.java32flags() + ' ' +
            '-Xmx2g ' +
            '-cp bower_components/angularjs/bower_components/closure-compiler/compiler.jar' + classPathSep +
            'bower_components/angularjs/bower_components/ng-closure-runner/ngcompiler.jar ' +
            // '-classpath ./components/closure-compiler/compiler.jar' + classPathSep +
            // './components/ng-closure-runner/ngcompiler.jar ' +
            'org.angularjs.closurerunner.NgClosureRunner ' +
            '--compilation_level SIMPLE_OPTIMIZATIONS ' +
            '--language_in ECMASCRIPT5_STRICT ' +
            '--minerr_pass ' +
            '--minerr_errors ' + errorFileName + ' ' +
            '--minerr_url http://docs.angularjs.org/minerr/ ' +
            '--source_map_format=V3 ' +
            '--create_source_map ' + mapFile + ' ' +
            '--js ' + file + ' ' +
            '--js_output_file ' + minFile,
      function(code) {
        if (code !== 0) grunt.fail.warn('Error minifying ' + file);

        // closure creates the source map relative to build/ folder, we need to strip those references
        var mapDir = mapFile.replace(/\/[^\/]+$/,"/"); 
        grunt.file.write(mapFile, grunt.file.read(mapFile).replace('"file":"' + mapDir, '"file":"').
                                                           replace('"sources":["' + mapDir,'"sources":["'));

        // move add use strict into the closure + add source map pragma
        grunt.file.write(minFile, this.sourceMap(mapFileName, this.singleStrict(grunt.file.read(minFile), '\n')));
        grunt.log.ok(file + ' minified into ' + minFile);
        done();
    }.bind(this));
  },


  //returns the 32-bit mode force flags for java compiler if supported, this makes the build much faster
  java32flags: function(){
    if (process.platform === "win32") return '';
    if (shell.exec('java -version -d32 2>&1', {silent: true}).code !== 0) return '';
    return ' -d32 -client';
  },


  //collects and combines error messages stripped out in minify step
  collectErrors: function (dir) {
    var combined = {
      id: 'ng',
      generated: new Date().toString(),
      errors: {}
    };
    grunt.file.expand(dir + '/**/*-errors.json').forEach(function (file) {
      var errors = grunt.file.readJSON(file),
        namespace;
      Object.keys(errors).forEach(function (prop) {
        if (typeof errors[prop] === 'object') {
          namespace = errors[prop];
          if (combined.errors[prop]) {
            Object.keys(namespace).forEach(function (code) {
              if (combined.errors[prop][code] && combined.errors[prop][code] !== namespace[code]) {
                grunt.warn('[collect-errors] Duplicate minErr codes don\'t match!');
              } else {
                combined.errors[prop][code] = namespace[code];
              }
            });
          } else {
            combined.errors[prop] = namespace;
          }
        } else {
          if (combined.errors[prop] && combined.errors[prop] !== errors[prop]) {
            grunt.warn('[collect-errors] Duplicate minErr codes don\'t match!');
          } else {
            combined.errors[prop] = errors[prop];
          }
        }
      });
    });
    grunt.file.write(dir + '/errors.json', JSON.stringify(combined));
    grunt.file.expand(dir + '/**/*-errors.json').forEach(grunt.file.delete);
  },

  parallelTask: function(name) {
    var args = [name, '--port=' + this.lastParallelTaskPort];

    if (grunt.option('browsers')) {
      args.push('--browsers=' + grunt.option('browsers'));
    }

    if (grunt.option('reporters')) {
      args.push('--reporters=' + grunt.option('reporters'));
    }

    this.lastParallelTaskPort++;


    return {grunt: true, args: args};
  },

  lastParallelTaskPort: 9876
};

// СБОРКА МОДУЛЕЙ

  function _build(tempDir, config, doneTask){
  
    var requireRegex = /@requires\s+([^\s\n]+)/g;
    var includeRegex = /@includes\s+([^\s\n]+)/g;
    var nameRegex = /@name\s+([^#\s]+)[\s\n]/g;
    var componentsDir = tempDir + '/components';
    
    grunt.file.mkdir(componentsDir);
    
    var buildScssDir = 'build/.scss';
    
    // Сборка библиотеки
    var libs = {};
    grunt.file.expand(config.lib).forEach(function(file){
        nameRegex.lastIndex = 0;
        requireRegex.lastIndex = 0;
        includeRegex.lastIndex = 0;
        var content = grunt.file.read(file);
        
        var names = [];
        var name;
        var module;
        var component;
        while(true){
            var name = nameRegex.exec(content);
            if(!name) break;
            var component = {
                name: name[1],
                index: nameRegex.lastIndex,
                requires: [],
                includes: []
            };
            names.push(component);
            module = /^(\w+)\./.exec(name[1]);
            if(module) component.requires.push('@requires ' + module[1] + '\n');
        }
        var indexTo;
        var require;
        var include;
        var endRequire = 0;
        var endInclude = 0;
        for(var i=0;i<names.length;i++){
            indexTo = names[i+1] ? names[i+1].index : content.length;
            if(require) names[i].requires.push(require[0]);
            if(include) names[i].includes.push(include[0]);
            while(!endRequire){
                require = requireRegex.exec(content);
                if(!require || requireRegex.lastIndex > indexTo) break;
                names[i].requires.push(require[0]);
            }
            while(!endInclude){
                include = includeRegex.exec(content);
                if(!include || includeRegex.lastIndex > indexTo) break;
                names[i].includes.push(include[0]);
            }
            endRequire = requireRegex.lastIndex == 0;
            endInclude = requireRegex.lastIndex == 0;
        }
        for(var i=0;i<names.length;i++){
            name = names[i];
            libs[name.name] = {
                _requires: name.requires,
                includes: name.includes,
                src: file,
                name: name.name            
            };
        }
    }); 
    var packageFileMap = {};
    var maps = {};
    var packageJsAddContent = {};
    grunt.util.async.forEach(config.main, function(main, done){
        
        // Выстраивание зависимостей        
        var stack = [];
        var files = [];
        var filesName = {};      
        
        if (typeof main == 'string'){
            main = {
                name: main,
                module: main,
                includes: [main]
            }
        }
        
        main.disable = main.disable || [];
        main.separateCss = main.separateCss || config.separateCss;
       
        grunt.util._.forEach(main.include, function(include){
            if(!main.module) main.module = main.name;
            var name = /\..*?:/.test(include) ? include : main.module + '.' + include;
            if(/\*$/.test(name)) {
                name = name.replace('*','');
                grunt.util._.forEach(libs, function(lib, libName){
                    if(libName.search(name) === 0) stack.push(lib);
                });
            } else {
                if(libs[name]) stack.push(libs[name]);
            }
        });
        if(libs[main.module]) stack.push(libs[main.module]);

        var current;
        var requireItem;
        while(stack.length > 0){     
            current = stack[stack.length - 1];           
            if(!current.requires) current.requires = current._requires.slice(0);
            if(current.requires.length > 0){
                requireItem = current.requires.shift();
                requireRegex.lastIndex = 0;
                addToStack(requireRegex.exec(requireItem)[1], current);
            } else {
                delete current.requires;
                stack.pop();
                if(current.includes.length > 0) {
                    for(var i=0;i<current.includes.length;i++){
                        includeRegex.lastIndex = 0;
                        addToStack(includeRegex.exec(current.includes[i])[1], current);
                    }
                }
                if(files.indexOf(current.src) < 0) {
                    filesName[current.src] = current.name;
                    files.push(current.src);
                }
            }        
        }
        function addToStack(require, current){
            if(require == '*') {
                addAllLibs(libs, current);
            } else if (/\.\*$/.test(require)){
                addRelativeLibs(libs, current, require);
            } else if (libs[require]){
                if(stack.indexOf(libs[require]) < 0) {
                    stack.push(libs[require]);
                }
            } else {
                var component = findComponent(require, config.components, libs, main.disable);
                if(files.indexOf(component) < 0) {
                    filesName[component] = require;                      
                    files.push(component);
                }
            }        
        }
        // Сборка файлов
        var minCssContent = '';
        var cssContent = '';
        var minJsContent = '';
        var jsContent = ''; 
        var jsAddContent = '';  
        var cssHash = '';
        var jsHash = ''; 
        var jsList = [];
        var cssList = [];
        var assetList = [];
        var minJsList = [];
        var minCssList = [];
        var partials = [];
        var partialsName = [];
        var scssFiles = [];
        var map = {
            js: [], css: []
        };
        var content;
        grunt.file.expand(files).forEach(function(file){
            if(file.indexOf('.html') > 0){
                partials.push(file);
            } else if(file.indexOf('.scss') > 0){
                scssFiles.push(file.replace('src/',''));
                //if(main.includeAsset) putAssetsFromSCSS(file, assetList);
            } else if(file.indexOf('.css') > 0){
                var minFile = file.replace('.css','.min.css');
                if(grunt.file.exists(minFile)) {
                    minCssContent += grunt.file.read(minFile);            
                    cssHash += minFile + fs.statSync(minFile).mtime.getTime();
                    minCssList.push(file);
                } else {
                    cssContent += grunt.file.read(file);
                    cssList.push(file);
                }
                if(main.includeAsset) putAssetsFromCSS(file, assetList);
            } else if(file.indexOf('.js') > 0) {
                var minFile = file.replace('.js','.min.js');
                if(grunt.file.exists(minFile)) {
                    minJsContent += grunt.file.read(minFile);
                    jsHash += minFile + fs.statSync(minFile).mtime.getTime();
                    minJsList.push(file);
                } else {
                    
                    content = grunt.file.read(file);
                    if(!/["']\s*use\s+strict\s*["']/.test(content)){
                        grunt.file.write(file, '"use strict";\n' + content);
                    }
                    jsContent += grunt.file.read(file).replace(/["']\s*use\s+strict\s*["']/g, '');
                    jsList.push(file);
                }
            }        
        });
        
        grunt.log.ok(" ");
        grunt.log.ok("Build:");
        grunt.util._.forEach(files, function(file){
            grunt.log.ok(file);
        });        
        
        // SCSS процессинг 
        var scssContentPack = '';
        if(!grunt.file.exists(buildScssDir)){
            grunt.file.mkdir(buildScssDir);
        }
        grunt.util._.forEach(scssFiles, function(file){
            scssContentPack += '@import "' + file + '";\n';
        });
        grunt.file.write(buildScssDir + '/' + main.name + ".scss", scssContentPack);
        
        // Линковка шаблонов и сбор их assets
        if(!grunt.file.exists(config.partialsDir)){
            grunt.file.mkdir(config.partialsDir);
        }
        grunt.util._.forEach(partials, function(file){
            if(main.includeAsset) putAssetsFromJS(file, assetList);
            partialsName.push(filesName[file]);
            qfs.symbolicLink(config.partialsDir + '/' + filesName[file], qfs.absolute(file), 'file');
        });
        grunt.file.write(config.partialsDir + '/.htaccess', '## Plunkr support ##\n<IfModule mod_headers.c>\n  Header add Access-Control-Allow-Origin "*"\n</IfModule>\n'
        );
        
        // Минимизация и обвертка CSS
        cssContent = makeCss(cssContent, main.separateCss);
        minCssContent = makeCss(minCssContent, main.separateCss);
        
        // Минимизация JS
        var libDir = tempDir + '/' + main.name;
        var version = utils.getVersion('package.json');
        grunt.file.mkdir(libDir);
        var file = libDir + '/v' + version.full + '-' + version.hash;
        
        packageFileMap[main.name] = file;
        
        if(main.separateCss){
            var hashJs = crypto.createHash('md5').update(jsHash).digest("hex");
            var hashCss = crypto.createHash('md5').update(cssHash).digest("hex");
            
            var componentFileJs = componentsDir + "/" + hashJs + ".js";
            var componentFileCss = componentsDir + "/" + hashCss + ".css";
            
            grunt.file.write(componentFileJs, minJsContent);
            if(minCssContent.length > 0) 
                grunt.file.write(componentFileCss, minCssContent);
            
            grunt.file.write(file + '.css', cssContent.replace(/assets\//g,'../../assets/'));

            qfs.symbolicLink(libDir + '/components.' + hashJs + '.js', '../components/' + path.basename(componentFileJs), 'dir');
            if(minCssContent.length > 0) 
                qfs.symbolicLink(libDir + '/components.' + hashCss + '.css', '../components/' + path.basename(componentFileCss), 'dir');
   
            map.css.push({
                'src': config.buildDir + componentFileCss.replace(tempDir, ''),
                'files': minCssList
            });
            map.css.push({
                'src': config.buildDir + file.replace(tempDir, '') + '.css',
                'files': cssList
            });
            map.js.push({
                'src': config.buildDir + componentFileJs.replace(tempDir, ''),
                'files': minJsList
            });
            map.js.push({
                'src': config.buildDir + file.replace(tempDir, '') + '.js',
                'files': jsList
            });            
            
        } else {
            var hash = crypto.createHash('md5').update(jsHash + cssHash).digest("hex");
            
            var componentFile = componentsDir + "/" + hash + ".js";
            
            jsAddContent += cssContent; 
            grunt.file.write(componentFile, minJsContent + minCssContent);            
            qfs.symbolicLink(libDir + '/components.' + hash + '.js', '../components/' + path.basename(componentFile), 'dir');
            
            map.js.push({
                'src': config.buildDir + componentFile.replace(tempDir, ''),
                'files': minJsList.concat(minCssList)
            });
            map.js.push({
                'src': config.buildDir + file.replace(tempDir, '') + '.js',
                'files': jsList.concat(cssList)
            });
        }
        
        var preloadedTemplates = [];
        var contentTemplates = '';
        var includePartials = [];
        grunt.util._.forEach(config.includeTemplates, function(files){
            includePartials.push(files.replace(/(^!{0,1})/, '$1' + config.partialsDir + '/'));
        });
        grunt.file.expand(includePartials).forEach(function(file){
            var tplCnt = grunt.file.read(file);
            var tplName = path.basename(file);      
            if(partialsName.indexOf(tplName) < 0) return;
            preloadedTemplates.push(tplName);
            contentTemplates += '<script type="text/ng-template" id="' + path.basename(config.partialsDir) + '/' + path.basename(file)+'">' + utils.minHTML(tplCnt) + '</script>';
        });            

        if(contentTemplates != '') {
            jsAddContent += ";angular.element("+ JSON.stringify(contentTemplates) +").appendTo('head');"
            map.preloadedTemplates = preloadedTemplates;
        }
        
        grunt.file.write(file + '.js', ';(function(){' + jsContent + '})();');
        
        map.assets = assetList;
        
        packageJsAddContent[main.name] = jsAddContent;
        maps[main.name] = map;
        
        utils.min(file + '.js', function(){
            done();
        });
       
    }, function(){
        //utils.collectErrors(config.buildDir);
        
        shell.exec('./compass compile', {silent: false});
        
        var file;
        var cssContent;
        var map;
        var compiledCssFile; 
        var jsAddContent;
        for(var packageName in packageFileMap){
            file = packageFileMap[packageName] + '.css';
            compiledCssFile = 'build/.css/' + packageName + '.css';
            cssContent = makeCss(grunt.file.read(compiledCssFile), true)
            grunt.file.write(file, 
                grunt.file.read(file) + cssContent
                
            );
            
            map = maps[packageName];
            
            putAssetsFromCSS(compiledCssFile, map.assets);
            grunt.file.write(packageFileMap[packageName] + '.map', JSON.stringify(map, null, 4));

            jsAddContent = packageJsAddContent[packageName];
            jsAddContent += ';window._assets = (window._assets || []).concat('+ JSON.stringify(map.assets) +');';
            
            grunt.file.write(packageFileMap[packageName] + '.js', grunt.file.read(packageFileMap[packageName] + '.js') + jsAddContent);
            grunt.file.write(packageFileMap[packageName] + '.min.js', grunt.file.read(packageFileMap[packageName] + '.min.js') + jsAddContent);

        }
        
        if(grunt.file.exists(config.buildDir)) {
            grunt.file.delete(config.buildDir, {force: true});
        }
        
        fs.renameSync(tempDir, config.buildDir);
        
        doneTask();
    });   
  
  }
  function addAllLibs(libs, toLib){
    var requires = [];
    grunt.util._.forEach(libs, function(lib, name){
        if(lib != toLib) requires.push('@requires ' + name + "\n");
    });
    toLib.requires = requires.concat(toLib.requires);
  }
  function addRelativeLibs(libs, toLib, require){
    var requires = [];
    
    require = require.replace('.*','');
  
    grunt.util._.forEach(libs, function(lib, name){
        if(lib != toLib && name.search(require) === 0 ) {
            requires.push('@requires ' + name + "\n");
        }
    });
    toLib.requires = requires.concat(toLib.requires);
  } 
  function makeCss(cssContent, isSeparate){
    cssContent = cssContent
      .replace(/\r?\n/g, '')
      .replace(/\/\*.*?\*\//g, '')
      .replace(/:\s+/g, ':')
      .replace(/\s*\{\s*/g, '{')
      .replace(/\s*\}\s*/g, '}')
      .replace(/\s*\,\s*/g, ',')
      .replace(/\s*\;\s*/g, ';');

    if(isSeparate) return cssContent;
    
    if(cssContent == "") return "";
    
    cssContent = cssContent
      .replace(/\\/g, '\\\\')
      .replace(/'/g, "\\'")
      .replace(/\r?\n/g, '\\n');
    
    return "angular.element(document).find('head').append('<style type=\"text/css\">" + cssContent + "</style>');";
  }
  function findComponent(name, components, libs, disable){  
    if(disable.indexOf(name) >= 0) return 'none';
    var relativeIndex = name.lastIndexOf(':');
    if(relativeIndex > 0){
        var relativeFile = name.substr(relativeIndex + 1);
        var relativeName = name.substr(0, relativeIndex);
        return libs[relativeName] ? path.dirname(libs[relativeName].src) + '/' +  relativeFile: null;
    } else {
        var component;
        grunt.util._.forEach(components, function(lib){    
            component = grunt.file.expand(lib + '/' + name);
            if(component.length > 0 ) return false;
        });
        return component[0];
    }   
  } 
  function putAssetsFromCSS(file, assets){
    var urlRegex = /url\s*\(\s*['\"]*\s*([^:]+?)\s*['\"]*\s*\)/g;
    var content = grunt.file.read(file);
    var urls = content.match(urlRegex);
    if(urls) for(var i=0;i<urls.length;i++){
        urlRegex.lastIndex = 0;
        var asset = urlRegex.exec(urls[i])[1].replace(/\.\.\/\.\.\/assets/g,'assets');
        if(assets.indexOf(asset) < 0) assets.push(asset);
    }
  }
  function putAssetsFromJS(file, assets){
    var imgRegex = /src\s*=\s*['\"]{1}\s*([^:'\"]+\.\w+)\s*['\"]{1}/g;
    var content = grunt.file.read(file);
    var urls = content.match(imgRegex);
    if(urls) for(var i=0;i<urls.length;i++){
        imgRegex.lastIndex = 0;
        var asset = imgRegex.exec(urls[i])[1];
        if(assets.indexOf(asset) < 0) assets.push(asset);
    }  
  }

