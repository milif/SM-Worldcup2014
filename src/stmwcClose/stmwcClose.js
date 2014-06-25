"use strict";
/**
 *
 * @requires stmwc
 * @requires stmwcClose:close.scss
 * 
 * @ngdoc overview
 * @name stmwcClose
 * @description
 *
 * Sotmarket Worldcup 2014 close
 */

angular.module('stmwc').factory('$stmwcAuth', function(){
    return null;
});
angular.module('stmwcClose', ['stmwc'])
    .run(['$rootScope', function($rootScope){
        $rootScope.$on('loaded', function(){
            $('[page]').show();
        });
    }])
    .controller('close', ['$scope', '$http', '$timeout', function($scope, $http, $timeout){
        var $ = angular.element;
        var errors = {
            13: "Не верно указан адрес",
            14: "Адрес уже подписан на рассылку новостей"
        }
        var flashErrorTimeout;
        var model = $scope.model = {};
        $scope.isSend = false;
        $scope.state = 'send';
        $scope.error = null;
        $scope.submit = function(){
            var form = model.form;
            if(!$scope.isSend && form.$valid) {
                $scope.isSend = true;
                var email = model.email;
            
                var res = $http.post('/ajx/subscribe.php', $.param({JSON_STR: JSON.stringify({
                    type: 'promo',
                    data: [{type: 'email', value: email}]
                })}), {
                    headers: {'Content-Type': 'application/x-www-form-urlencoded'}
                });
                res.success(function(data){
                    if(data.errcode == 0){
                        $scope.state = 'sended';
                    } else {
                        form.email.$setValidity('required', false);
                        flashError(data.errcode);
                    }
                });
                res.finally(function(){
                    $scope.isSend = false;
                });
            }
        } 
        function flashError(error){
            if(error in errors) {
                $scope.error = errors[error];
                $timeout.cancel(flashErrorTimeout);
                flashErrorTimeout = $timeout(function(){
                    $scope.error = null;
                }, 2000);
            }
        } 
    }]);
    


