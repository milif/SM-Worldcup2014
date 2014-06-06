"use strict";
/**
 * @ngdoc directive
 * @name stmwc.directive:stmwcNews
 * @function
 *
 * @requires stmwc.directive:stmwcNews:news.scss
 * @requires stmwc.directive:stmwcNews:news.html
 *
 * @description
 * Промоблок Спортекспресс
 *
 * @element ANY
 *
 */
angular.module('stmwc').directive('stmwcNews', function(){
    var DATA = {
        'sportexpress': {
            url: 'http://ss.sport-express.ru/rss/public_news.rss'
        },
        'mailru': {
            url: 'http://hi-tech.mail.ru/rss/all'
        }
    }; 
    return {
        scope: true,
        templateUrl: 'partials/stmwc.directive:stmwcNews:news.html',
        replace: true,
        controller: ['$http', '$scope', '$attrs', function($http, $scope, $attrs){
            $scope.isLoad = true;
            var data = $scope.data = DATA[$attrs.type];
            $scope.type = $attrs.type;
            $http.jsonp('https://ajax.googleapis.com/ajax/services/feed/load?v=1.0&num=5&callback=JSON_CALLBACK&q=' + encodeURIComponent(data.url))
                .success(function(data){
                    var items = $scope.items = data.responseData.feed.entries;
                    for(var i=0;i<items.length;i++){
                        items[i].time = new Date(items[i].publishedDate).getTime()
                    }
                })
                .finally(function(){
                    $scope.isLoad = false;
                });
        }]
    };
});
