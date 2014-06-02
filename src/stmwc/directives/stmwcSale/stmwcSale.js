"use strict";
/**
 * @ngdoc directive
 * @name stmwc.directive:stmwcSale
 * @function
 *
 * @requires stmwc.directive:stmwcSale:sale.html
 * @requires stmwc.directive:stmwcSale:sale.scss
 *
 * @description
 * Подарки распродажи
 *
 * @element ANY
 *
 */

angular.module('stmwc').directive('stmwcSale', function(){
    var $ = angular.element;
    return {
        templateUrl: 'partials/stmwc.directive:stmwcSale:sale.html',
        replace: true,
        controller: ['$scope', function($scope){
            $scope.goBets = function(){
                $('body').animate({
                    scrollTop: $('[stmwc-bets]').offset().top - 60
                });
            }
        }]
    };
});