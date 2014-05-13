#!/usr/bin/env node

var GitHubApi = require("github");
var fs = require("fs");
var qfs = require("q-fs");
var grunt = require("grunt");
var url = require('url');
var shell = require('shelljs');

process.stdout.write("Content-type: application/json\n\n");

//var data = JSON.parse(fs.readFileSync('/dev/stdin').toString());
var GET = url.parse(process.env.REQUEST_URI, true).query;

if(GET.build){
    // Build patch
    var id = parseInt(GET.id);
    var repo = getRepo(); 
    var pullDir = getPullDir(id);
    var pullUrl = getPullUrl(id);
    
    if(!exist(pullDir, GET.updatedAt)) {
        if(grunt.file.exists(pullDir)) {
            grunt.file.delete(pullDir, {force: true});
        }
    } else {
        process.stdout.write(JSON.stringify({
            url: pullUrl
        }));
        return;
    }
    
    var cmd = 'git clone --no-hardlinks \'' + qfs.absolute('../../') + '\' \'' + pullDir + '\'';
    shell.exec(cmd, {silent: true});
    
    qfs.symbolicLink(pullDir + '/bower_components', '../../bower_components', 'dir');
    qfs.symbolicLink(pullDir + '/node_modules', '../../node_modules', 'dir');
    
    grunt.file.write(pullDir+'/updatedAt.json', GET.updatedAt);
        
    cmd = '(cd \'' + pullDir + '\'; git config --local user.email "you@example.com"; git config --local user.name "Your Name"; curl -H \'Accept: application/vnd.github.patch\' -u ' + repo.oauth + ':x-oauth-basic https://api.github.com/repos/' + repo.company + '/' + repo.name + '/pulls/' + id + ' | git am; grunt init; grunt docs; grunt app; chmod -R 777 .)'; 

    shell.exec(cmd, {silent: false});
    
    process.stdout.write(JSON.stringify({
        url: pullUrl
    }));
} else {
    // List pulls
    var repo = getRepo(); 

    var github = new GitHubApi({
        version: "3.0.0"
    });
    github.authenticate({
        type: "oauth",
        token: repo.oauth
    });

    var pulls = [];
    github.pullRequests.getAll(
        {
            user: repo.company,
            repo: repo.name
        },
        function(err, res) {
            if(!err) {
                for(var i=0;i<res.length;i++){
                    var pull = res[i];
                    var updatedAt = new Date(pull.updated_at || pull.created_at).getTime();
                    var pullDir = getPullDir(pull.number);
                    var isExist = exist(pullDir, updatedAt);
                    if(!isExist && grunt.file.exists(pullDir)){
                        grunt.file.delete(pullDir, {force: true});
                    }
                    pulls.push({
                        id: pull.number,
                        title: pull.title,
                        url: isExist ? getPullUrl(pull.number) : null,
                        description: pull.body,
                        pullUrl: pull.html_url,
                        updatedAt: updatedAt
                    });
                }
            }
            
            var ids = [];
            grunt.util._.forEach(pulls, function(pull){
                ids.push(pull.id + '');
            });            
            grunt.file.expand('../../pulls/*').forEach(function(file){
                var id = /[^\/]*$/.exec(file)[0];
                if(ids.indexOf(id) < 0){
                    grunt.file.delete(getPullDir(id), {force: true});
                }
            });
                        
            process.stdout.write(JSON.stringify(pulls));
        }
    );
}

function getRepo(){
    var repo = JSON.parse(fs.readFileSync('../../package.json', 'UTF-8')).repository;
    var matchRepo = repo.url.match(/\/\/([^\/]+)\/([^\/]+)\/(.*?)\.git/);   
    repo.name = matchRepo[3];
    repo.company = matchRepo[2]; 
    return repo;
}
function exist(pullDir, updatedAt){
    var updateFile = pullDir+'/updatedAt.json';
    return grunt.file.exists(updateFile) && grunt.file.read(updateFile) == updatedAt;
}
function getPullDir(id){
    return qfs.absolute('../../pulls') + '/' + id;
}
function getPullUrl(id){
    return 'pull/' + id + '/build/docs';
}

