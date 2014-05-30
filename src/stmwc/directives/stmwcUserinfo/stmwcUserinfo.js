"use strict";
/**
 * @ngdoc directive
 * @name stmwc.directive:stmwcUserinfo
 * @function
 *
 * @requires stmwc.directive:stmwcUserinfo:userinfo.scss
 * @requires stmwc.directive:stmwcUserinfo:userscore.scss
 * @requires stmwc.directive:stmwcUserinfo:userscore.html
* @requires stmwc.directive:stmwcUserinfo:userinfo.html
 *
 * @requires stmwc.Bets
 *
 * @description
 * Пользовательская панель
 *
 * @element ANY
 *
 */

angular.module('stmwc').directive('stmwcUserinfo', function(){
    var $ = angular.element;
    return {
        templateUrl: 'partials/stmwc.directive:stmwcUserinfo:userinfo.html',
        replace: true,
        controller: ['$scope', 'Bets', '$stmwcAuth', '$filter', '$cookies', '$stmwcEnv', function($scope, Bets, $stmwcAuth, $filter, $cookies, $stmwcEnv){
            $scope.auth = $stmwcAuth;
            $scope.user = $stmwcAuth.data;
            $scope.bets = Bets;
            $scope.score = 0;
            var place = $scope.place = $stmwcEnv.place;
            
            $scope.showTop = function(){
                $scope.showTop20 = true;
            }
            $scope.$on('closedPopup-top20', function(){
                $scope.showTop20 = false;    
            });
            
            var progressCss = $scope.progressCss = {};
            $scope.$watch(function(){
                $scope.score = Bets.getScore() || 0;
                if($scope.score < 1000) {
                    progressCss.width = Math.round($scope.score / 1000 * 25) + '%';
                } else if($scope.score <= 1500){
                    progressCss.width = Math.round(25 + ($scope.score - 1000) / 500 * 25) + '%';
                } else {
                    progressCss.width = Math.round(50 + (place.total - place.user + 1) / place.total * 50) + '%';
                }
            });
            if(!$stmwcAuth.isAuth){
                $scope.name = "Игрок № " + $filter('number')(getUserNumber(), 0);
            }
            function getUserNumber(){
                var n = parseInt($cookies.WC2014_stmuid, 16);
                return n - Math.floor(n / 1000000000) * 1000000000;
            }
        }]
    };
});