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
        replace: true
    };
});
