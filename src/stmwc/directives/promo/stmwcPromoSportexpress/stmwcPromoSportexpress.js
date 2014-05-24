"use strict";
/**
 * @ngdoc directive
 * @name stmwc.directive:stmwcPromoSportexpress
 * @function
 *
 * @requires stmwc.directive:stmwcPromoSportexpress:sportexpress.scss
 * @requires stmwc.directive:stmwcPromoSportexpress:sportexpress.html
 *
 * @description
 * Промоблок Спортекспресс
 *
 * @element ANY
 *
 */
angular.module('stmwc').directive('stmwcPromoSportexpress', function(){
    return {
        templateUrl: 'partials/stmwc.directive:stmwcPromoSportexpress:sportexpress.html',
        replace: true,
        controller: ['$http', '$scope', function($http, $scope){
            $scope.isLoad = true;
            $http.jsonp('https://ajax.googleapis.com/ajax/services/feed/load?v=1.0&num=5&callback=JSON_CALLBACK&q=' + encodeURIComponent('http://ss.sport-express.ru/rss/public_news.rss'))
                .success(function(data){
                    var items = $scope.items = data.responseData.feed.entries;
                    for(var i=0;i<items.length;i++){
                        items[i].time = new Date(items[i].publishedDate).getTime()
                    }
                })
                .finally(function(){
                    $scope.isLoad = false;
                })
        }]
    };
});
