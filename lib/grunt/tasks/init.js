var q = require('q');
var qfs = require('q-fs');
var utils = require('../utils.js');
var fs = require('fs');
var shell = require('shelljs');

module.exports = function(grunt) {
  grunt.registerTask('init', 'init', function(){
    
    shell.exec('npm install && bower install', {silent: false});
    
    var config = grunt.config(this.name);
  
    var buildDir = 'build';
    
    if(grunt.file.exists(buildDir)) {
        grunt.file.delete(buildDir, {force: true});
    }
    grunt.file.mkdir(buildDir);
    
    var promises = [];
    var doneTask = this.async();
    
    var repo = utils.getRepository();
    
    // Git commit hook
    if(!grunt.file.exists('.git/hooks')) {
        grunt.file.mkdir('.git/hooks');
    }   
    if(grunt.file.exists('.git/hooks/commit-msg')) {
        grunt.file.delete('.git/hooks/commit-msg', {force: true});
    }
    qfs.symbolicLink('validate-commit-msg.js', 'bower_components/angularjs/validate-commit-msg.js', 'file');
    qfs.symbolicLink('.git/hooks/commit-msg', '../../validate-commit-msg.js', 'file');

    // Compass
    var gemsDir = grunt.file.expand('.gems/ruby/*/');
    if(gemsDir.length > 0) {
        gemsDir = qfs.absolute(gemsDir[0]);
        grunt.file.write('compass',
            '#!/usr/bin/env sh\n\n' +
            'export GEM_PATH=$GEM_PATH:'+gemsDir+'\n' +
            gemsDir+'/bin/compass $@'
        );
        fs.chmodSync('compass', 0755);
    } 
    
    // Docs
    /*
    grunt.file.write('docs/content/misc/building.ngdoc',
        '@ngdoc overview\n@name Setup and building\n@description\n' +
        grunt.file.read('README.md')
            .replace(/<main repository>/g, repo.url)
    );        
    
    grunt.file.copy('docs/errors.json', buildDir + '/errors.json');
    copyDir('bower_components/angularjs/docs/components', 'docs/components');
    copyDir('bower_components/angularjs/docs/src', 'docs/src')
        .then(function(){
            grunt.file.copy('favicon.ico', 'docs/src/templates/favicon.ico');
            grunt.file.write('docs/src/templates/index.html', grunt.file.read('docs/templates/index.html')
                .replace(/{githubIssues}/g, repo.url.replace('.git', '/issues'))
                .replace(/{githubUrl}/g, repo.url)
                .replace(/{appName}/g, utils.getName())
                .replace(/{version}/g, utils.getVersion().full)
            );
            grunt.file.write('docs/src/gen-docs.js', grunt.file.read('docs/src/gen-docs.js')
                .replace(/bower_components/g, 'bower_components/angularjs/bower_components')
            );
            grunt.file.write('docs/src/templates/js/docs.js', grunt.file.read('docs/src/templates/js/docs.js')
                .replace('loadDisqus(currentPageId) {','loadDisqus(currentPageId) {return;')
                .replace('angular.module(\'docsApp', grunt.file.read('docs/docs.modify.js') + '\nangular.module(\'docsApp')
                .replace('$window._gaq', '//$window._gaq')
            );
            grunt.file.write('docs/components/angular-bootstrap/bootstrap-prettify.js', grunt.file.read('docs/components/angular-bootstrap/bootstrap-prettify.js')
                .replace('$provide.decorator(\'$timeout\'', '// FIX: Remove decorate $timeout\n$provide.value(\'__$timeout\'')
            );            
        });
    */
    // Bower components
    grunt.file.mkdir(buildDir + '/components');
    grunt.util._.forEach(config.bower, function(folder, name){
        qfs.symbolicLink(buildDir + '/components/' + name, '../../bower_components/' + folder, 'dir');
    });
    
    qfs.symbolicLink(buildDir + '/components/jquery', '../../bower_components/jquery', 'dir');
    
    // Pulls
    if(!grunt.file.exists('pulls')){
        grunt.file.mkdir('pulls');
        fs.chmodSync('pulls', 0777);    
    }
    
    q.all(promises).done(doneTask);
    
    function copyDir(src, dist){
        if(grunt.file.exists(dist)) {
            grunt.file.delete(dist, {force: true});
        }
        var promise = qfs.copyTree(src, dist);
        promise.then(function(){
            addGitignore(dist);
        });
        promises.push(promise);
        return promise;
    }
    function addGitignore(dir){
        grunt.file.write(dir + '/.gitignore',[ 
                '# Ignore everything in this directory',
                '*'
            ].join('\n')
        );       
    }
  });
}
