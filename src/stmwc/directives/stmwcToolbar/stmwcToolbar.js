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
    return {
        templateUrl: 'partials/stmwc.directive:stmwcToolbar:toolbar.html',
        replace: true
    };
});
