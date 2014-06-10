"use strict";
/**
 * @ngdoc directive
 * @name stmwc.directive:stmwcPopupTop
 * @function
 *
 * @requires stmwc.directive:stmwcPopupTop:top.scss
 * @requires stmwc.directive:stmwcPopupTop:top.html
 *
 * @requires stmwc.directive:stmwcPopup
 *
 * @description
 * Попап
 *
 * @element ANY
 *    
 */

angular.module('stmwc').directive('stmwcPopupTop', [function(){   
    return {
        scope: true,
        templateUrl: 'partials/stmwc.directive:stmwcPopupTop:top.html',
        controller: ['$scope', '$attrs', '$element', function($scope, $attrs, $element) {
            
        }]
    };
}]);
