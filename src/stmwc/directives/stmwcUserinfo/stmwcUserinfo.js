"use strict";
/**
 * @ngdoc directive
 * @name stmwc.directive:stmwcUserinfo
 * @function
 *
 * @requires stmwc.directive:stmwcUserinfo:userinfo.scss
 * @requires stmwc.directive:stmwcUserinfo:userinfo.html
 * @requires stmwc.directive:stmwcUserinfo:userpic.html
 * @requires stmwc.directive:stmwcUserinfo:userpic.scss
 *
 * @requires stmwc.Bets
 * @requires stmwc.directive:stmwcTooltip
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
        scope: true,
        controller: ['$scope', 'Bets', '$stmwcAuth', '$filter', '$cookies', '$stmwcEnv', function($scope, Bets, $stmwcAuth, $filter, $cookies, $stmwcEnv){
            $scope.auth = $stmwcAuth;
            $scope.user = $stmwcAuth.data;
            $scope.bets = Bets;
            $scope.name = $stmwcAuth.getName();

            var place = $scope.place = $stmwcEnv.place;
            
            $scope.showBetsPopup = function(){
                var bets = Bets.getBets();
                var shareBets = [];
                for(var i=0;i<bets.length;i++){
                    if(bets[i].value[0] == null || bets[i].value[1] == null) continue;
                    shareBets.push($.extend({}, bets[i]));
                }
                $scope.$emit('showBets', {
                    name: $scope.name,
                    score: $scope.score,
                    avatar: $scope.user.avatar,
                    place: place,
                    bets: shareBets,
                    refKey: $scope.user ? $scope.user.refKey : null,
                    showShare: true
                });
            }
            $scope.showTop = function(){
                $scope.$emit('showTop');
            }
            
            var progressCss = $scope.progressCss = {};
            $scope.$watch(function(){
                if($scope.score < 200) {
                    progressCss.width = Math.round($scope.score / 200 * 25) + '%';
                } else if($scope.score <= 500){
                    progressCss.width = Math.round(25 + ($scope.score - 200) / 300 * 25) + '%';
                } else {
                    progressCss.width = Math.round(50 + (place.total - place.user + 1) / place.total * 50) + '%';
                }
            });
        }]
    };
});
angular.module('stmwc').directive('stmwcUserpic', function(){
    return {
        replace: true,
        templateUrl: 'partials/stmwc.directive:stmwcUserinfo:userpic.html',
        scope: true,
        controller: ['$attrs', '$scope', function($attrs, $scope){
            $scope.avatar = $scope.$eval($attrs.stmwcUserpic);
            $scope.username = $scope.$eval($attrs.username);
        }]
    }
});