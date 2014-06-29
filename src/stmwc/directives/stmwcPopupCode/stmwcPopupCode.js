"use strict";
/**
 * @ngdoc directive
 * @name stmwc.directive:stmwcPopupCode
 * @function
 *
 * @requires stmwc.directive:stmwcPopupCode:code.scss
 * @requires stmwc.directive:stmwcPopupCode:code.html
 *
 * @requires stmwc.directive:stmwcPopupCode
 *
 * @description
 * Попап промокода
 *
 * @element ANY
 *    
 */

angular.module('stmwc').directive('stmwcPopupCode', [function(){   
    return {
        scope: true,
        templateUrl: 'partials/stmwc.directive:stmwcPopupCode:code.html',
        controller: ['$scope', '$attrs', '$stmwcAuth', '$timeout', function($scope, $attrs, $stmwcAuth, $timeout) {
            var code = $scope.$eval($attrs.stmwcPopupCode);
            $scope.result = code.errcode;
            $scope.score = code.score;
            $scope.close = function(){
                $scope.$broadcast('closePopup-code');
            }
            if(code.errcode == 3) {
                $stmwcAuth.auth({
                    title: 'Авторизуйтесь, чтобы получить<br>бонус ' + code.score + ' баллов'
                });
            }
        }]
    };
}]);
