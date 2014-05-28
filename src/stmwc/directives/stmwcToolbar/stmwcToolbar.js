"use strict";
/**
 * @ngdoc directive
 * @name stmwc.directive:stmwcToolbar
 * @function
 *
 * @requires stmwc.directive:stmwcToolbar:toolbar.scss
 * @requires stmwc.directive:stmwcToolbar:toolbar.html
 *
 * @description
 * Тулбар
 *
 * @element ANY
 *
 */
angular.module('stmwc').directive('stmwcToolbar', function(){
    var $ = angular.element;
    return {
        templateUrl: 'partials/stmwc.directive:stmwcToolbar:toolbar.html',
        replace: true,
        controller:['$scope', function($scope){
            $scope.goBets = function(){
                $('body').animate({
                    scrollTop: $('[stmwc-bets]').offset().top
                });
            }
        }]
    };
});
