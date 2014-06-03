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
        controller: ['$scope', '$element', function($scope, $element){
            /*
            $element.css({
                'height': Math.max(650, $(window).height() - 50)
            });
            */
            $scope.goBets = function(){
                $('html,body').animate({
                    scrollTop: $('[stmwc-userinfo]').offset().top - 65
                });
            }
        }]
    };
});