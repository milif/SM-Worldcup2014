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
        controller: ['$scope', '$element', '$location', function($scope, $element, $location){
            $scope.isActive = false;
            $scope.toggle = toggle;
            var windowEl = $(window);
            var globalEvents = {
                'mousedown': function(e){
                    if($(e.target).closest($element).length == 0){
                        hide();
                        $scope.$digest();
                    }
                }
            }
              
            $scope.$on('$locationChangeSuccess', function(){
                if($location.hash() == 'paypal') {
                    show();
                }
            });
            
            if($location.hash() == 'paypal'){
                show();
            }
            
            function toggle(){
                if($scope.isActive) {
                    hide();
                } else {
                    show();
                }
            }
            function show(){
                $scope.isActive = true;
                windowEl.on(globalEvents);
            }
            function hide(){
                $scope.isActive = false;
                windowEl.off(globalEvents);
            }
        }]
    };
});
