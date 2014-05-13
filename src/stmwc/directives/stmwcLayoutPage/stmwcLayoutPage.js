"use strict";
/**
 * @ngdoc directive
 * @name stmwc.directive:stmwcLayoutPage
 * @function
 *
 * @requires stmwc.directive:stmwcLayoutPage:layoutpage.scss
 * @requires stmwc.directive:stmwcLayoutPage:layoutpage.html
 *
 * @description
 * Лайаут страницы
 *
 * @element ANY
 */
angular.module('stmwc').directive('stmwcLayoutPage', function(){
    return {
        templateUrl: 'partials/stmwc.directive:stmwcLayoutPage:layoutpage.html',
        transclude: true,
        controller: ['$element', function($element){
            $element.addClass('l-body');
        }]
    };
});
