"use strict";
/**
 * @ngdoc directive
 * @name stmwc.directive:stmwcPaypal
 * @function
 *
 * @requires stmwc.directive:stmwcPaypal:paypal.scss
 * @requires stmwc.directive:stmwcPaypal:paypal.html
 *
 * @description
 * Промоблок PayPal
 *
 * @element ANY
 *
 */
angular.module('stmwc').directive('stmwcPaypal', function(){
    return {
        scope: true,
        templateUrl: 'partials/stmwc.directive:stmwcPaypal:paypal.html',
        replace: true,
        controller: ['$scope', '$element', function($scope, $element){
            $scope.isActive = false;
            $scope.toggle = toggle;
            var windowEl = $(window);
            var globalEvents = {
                'mousedown': function(e){
                    if($(e.target).closest($element).length == 0){
                        toggle();
                        $scope.$digest();
                    }
                }
            }
            
            function toggle(){
                $scope.isActive = !$scope.isActive;
                if($scope.isActive){
                    windowEl.on(globalEvents);
                } else {
                    windowEl.off(globalEvents);
                }
            }
        }]
    };
});
