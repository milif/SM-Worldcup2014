"use strict";
    /**
     * @ngdoc service
     * @name stmwc.$stmwcAuth
     *
     * @requires stmwc.$stmwcAuth:auth.html
     * @requires stmwc.$stmwcAuth:registrate.html
     * @requires stmwc.$stmwcAuth:registrate.scss
     * @requires stmwc.$stmwcAuth:sotmarket.html
     * @requires stmwc.$stmwcAuth:confirmed.html
     * @requires stmwc.$stmwcAuth:unsubscribe.html
     * @requires stmwc.$stmwcAuth:confirm.html
     * @requires stmwc.$stmwcAuth:confirm.scss
     * @requires stmwc.$stmwcAuth:mnogo.html
     * @requires stmwc.$stmwcAuth:mnogo.scss
     *
     * @requires stmwc.directive:stmwcPopup
     * @requires stmwc.directive:stmwcShare
     *
     * @description
     *
     * Сервис авторизации
     * 
     */
        
    angular.module('stmwc').factory('$stmwcAuth', ['$location', '$rootScope', '$compile', '$templateCache', '$http', '$q', '$timeout', '$stmwcGtm', '$filter', '$cookies', function($location, $rootScope, $compile, $templateCache, $http, $q, $timeout, $stmwcGtm, $filter, $cookies){
        
        var $$ = angular;
        var $ = angular.element;
    
        var baseUrl = $('base')[0].href;
        var openidURL = baseUrl + 'api/openid.php';
        
        var apiUser = 'api/user.php';
        
        var inAuth = false;
        var isRequireAuth = false;
        
        var cookieName;
        
        var $stmwcAuth = {
            init: init
        };
        
        return $stmwcAuth;
        
        function init(config){
            var data = config.auth;
            var requireConfirm = config.requireConfirm;
            var isReqAuth = config.requireAuth;
            
            cookieName = config.cookieName;
            
            if($location.hash().indexOf('!') === 0 || $location.url().indexOf('/!') === 0){
                var context;
                if($location.hash().indexOf('!') === 0) {
                    context = $location.hash().substr(1);
                    $location.hash('');
                } else {
                    context = $location.url().substr(2);
                    $location.url('/');
                }
                $location.replace();
                
                var contextData = context.split(":");
                if(contextData[0] === 'c'){
                    $rootScope.$on('loaded', function(){
                        confirmEmailInfo(parseInt(contextData[1]));
                    });
                } else if(contextData[0] === 'us'){
                    $rootScope.$on('loaded', function(){
                        unsubscribe(parseInt(contextData[1]), contextData[2]);
                    });
                } else {
                    $stmwcAuth.session = context;
                    $rootScope.$on('loaded', registrate);
                }
            }
            
            isRequireAuth = isReqAuth;
            
            $.extend($stmwcAuth, {
                data: data || {},
                isAuth: !!data,
                auth: auth,
                registrate: registrate,
                requireAuth: requireAuth,
                logout: logout,
                sendMnogo: sendMnogo,
                confirmEmail: confirmEmail,
                getName: getName
            });
            
            if($stmwcAuth.isAuth && requireConfirm) {
                var key = '_wc2014ConfirmTime' + $stmwcAuth.data.refKey;
                var time = parseInt(localStorage.getItem(key) || 0);
                var curTime = new Date().getTime();
                if(time < curTime) {
                    if(time > 0) $rootScope.$on('loaded', confirmEmail);
                    localStorage.setItem(key, curTime + 86400000);
                }
            }
        }
        function getName(){
            return $stmwcAuth.isAuth ? $stmwcAuth.data.name : "Игрок № " + $filter('number')(getUserNumber(), 0);
        }
        function getUserNumber(){
            var n = parseInt($cookies[cookieName + '_stmuid'], 16);
            return n - Math.floor(n / 1000000000) * 1000000000;
        }
        function requireAuth(noCallAuth){
            if (!$stmwcAuth.isAuth && isRequireAuth){
                if(!noCallAuth) $stmwcAuth.auth();
                return true;
            }
            return false;
        }
        function sendMnogo(){
            var $scope = $rootScope.$new();
            var model = $scope.modelData = {};
            $scope.model = model.data = {};
            
            $scope.state = 'start';
            
            $scope.$on('closedPopup-mnogosend', function(){
                setTimeout(function(){
                    $scope.$destroy();
                }, 0);
            });

            $scope.submit = function(){
                var form = model.form;
                $scope.isSubmited = true;
                if(!$scope.isSend && form.$valid) {
                    $scope.isSend = true;
                    var res = $http.post(apiUser, {
                        action: 'mnogo',
                        data: model.data
                    });
                    res.success(function(res){
                        if(res.success){
                           $scope.state = 'end';
                           $stmwcAuth.data.hasMnogo = true;
                           $scope.$broadcast('closePopup-mnogosend');
                        }
                    });
                    res.finally(function(){
                        $scope.isSend = false;
                    });
                }
            }

            $http.get('partials/stmwc.$stmwcAuth:mnogo.html', {cache: $templateCache})
                .success(function(tpl){
                    $compile(tpl)($scope);
                });
        }
        function confirmEmailInfo(state){
            var $scope = $rootScope.$new();
            $scope.state = state;
            $scope.$on('closedPopup-confirmed', function(){
                setTimeout(function(){
                    $scope.$destroy();
                }, 0);
            });
            
            if(state == 0 && $stmwcAuth.isAuth){
                var data = $stmwcAuth.data;
                $stmwcGtm.push({
                    event: 'WorldCup2014',
                    eventAction: 'confirmation',
                    userId: data.refKey,
                    partner: {
                        id: data.partnerRef,
                        data: data.partnerSubRef
                    }
                });   
            }
            
            $http.get('partials/stmwc.$stmwcAuth:confirmed.html', {cache: $templateCache}).success(function(data){
               $compile(data)($scope); 
            });
        }
        function unsubscribe(state, email){
            var $scope = $rootScope.$new();
            $scope.state = state;
            $scope.email = email;
            $scope.$on('closedPopup-unsubscribe', function(){
                setTimeout(function(){
                    $scope.$destroy();
                }, 0);
            });
            $http.get('partials/stmwc.$stmwcAuth:unsubscribe.html', {cache: $templateCache}).success(function(data){
               $compile(data)($scope); 
            });
        }
        function registrate(){
            var $scope = $rootScope.$new();
            var model = $scope.modelData = {};
            
            $scope.state = 'start';
            
            $scope.$on('closedPopup-registrate', function(){
                if($scope.state == 'end') {
                    window.location.reload();
                }
                setTimeout(function(){
                    $scope.$destroy();
                }, 0);
            });

            $scope.submit = function(){
                var form = model.form;
                $scope.isSubmited = true;
                if(!$scope.isSend && form.$valid) {
                    $scope.isSend = true;
                    var res = $http.post(apiUser, {
                        action: 'reg',
                        data: model.data,
                        session: $stmwcAuth.session
                    });
                    res.success(function(res){
                        if(res.success){
                           $scope.state = 'end';
                           $stmwcAuth.isAuth = true;
                           $stmwcAuth.data = res.data;
                        }
                    });
                    res.finally(function(){
                        $scope.isSend = false;
                    });
                }
            }

            $q.all([
                $http.get('partials/stmwc.$stmwcAuth:registrate.html', {cache: $templateCache}), 
                $http.post(apiUser, {action: 'get', session: $stmwcAuth.session})
            ]).then(function(res){
                $scope.model = model.data = res[1].data;
                $compile(res[0].data)($scope);
            });
        }
        function authSM(){
            $http.post(openidURL + '?stm=1').success(function(data){
                if(data.success) {
                    window.location.href = data.redirect;
                    window.location.reload();
                } else {
                    var $scope = $rootScope.$new();
                    var model = $scope.model = {};
                    var modelData = model.data = {};
                    $scope.again = function(){
                        $timeout(function(){
                            model.data = {};
                            $scope.isError = false;
                        }, 0);
                    }
                    $scope.$on('closedPopup-sotmarket', function(){
                        setTimeout(function(){
                            $scope.$destroy();
                        }, 0);    
                    });
            
                    $scope.submit = function(){
                        $scope.isSubmited = true;
                        var form = model.form;
                        if(!$scope.isSend && form.$valid) {
                            $scope.isSend = true;
                            var res = $http.post(openidURL + '?stm=2', {
                                login: model.data.email,
                                password: model.data.password
                            });
                            res.success(function(data){
                                if(data.success){
                                    window.location.href = data.redirect;
                                    window.location.reload();
                                } else {
                                    $scope.isError = true;
                                }
                            });
                            res.finally(function(){
                                $scope.isSend = false;
                            });
                        }
                    }
            
                    $http.get('partials/stmwc.$stmwcAuth:sotmarket.html', {cache: $templateCache}).success(function(data){
                       $compile(data)($scope); 
                    });
                }
            });
        }
        
        function confirmEmail(action){

            var $scope = $rootScope.$new();
            var model = $scope.model = {};
            
            $scope.$on('closedPopup-confirm', function(){
                setTimeout(function(){
                    $scope.$destroy();
                }, 0);    
            });
            
            $scope.send = function(){
                $timeout(send, 0);
            }
            $scope.start = function(){
                $timeout(start, 0);
            }
            $scope.changeEmail = function(){
                $timeout(email, 0);
            }           
            $scope.submit = function(){
                $scope.isSubmited = true;
                var form = model.form;
                if(!$scope.isSend && form.$valid) {
                    $scope.isSend = true;
                    var email = model.email;
                    var res = $http.post(apiUser, {
                        action: 'confirmEmail',
                        send: true,
                        email: email
                    });
                    res.success(function(res){
                        if(res.success){
                            $scope.state = 'send';
                            $stmwcAuth.data = res.data;
                            $stmwcAuth.isAuth = true;
                        }
                    });
                    res.finally(function(){
                        $scope.isSend = false;
                    });
                }
            }            
            
            if(action == 'send') {
                send();
            } else {
                start();
            }
            
            $http.get('partials/stmwc.$stmwcAuth:confirm.html', {cache: $templateCache}).success(function(data) {
                $compile(data)($scope); 
            });
            
            function start(){
                $scope.state = "start";
                model.email = $stmwcAuth.data.email;
            }
            function send(){
                $scope.state = 'send';
                $http.post(apiUser, {
                    action: 'confirmEmail',
                    send: true
                });
            }
            function email(){
                model.email = '';
                $scope.state = "email";
            }
        }
        function auth(cfg){
            if(inAuth) return;
            inAuth = true;
            var $scope = $rootScope.$new();
            $scope.authVK = authVK;
            $scope.authFB = authFB;
            $scope.authSM = authSM;
            $scope.authTW = authTW;
            $scope.authG = authG;
            $scope.title = cfg ? cfg.title : null;
            $scope.$on('closedPopup-auth', function(){
                inAuth = false;
                setTimeout(function(){
                    $scope.$destroy();
                }, 0);    
            });
            $http.get('partials/stmwc.$stmwcAuth:auth.html', {cache: $templateCache}).success(function(data){
               $compile(data)($scope); 
            });
        }
        function authVK(){
            window.location.href = 'https://oauth.vk.com/authorize?client_id=4362789&scope=email&redirect_uri='+getRedirectUrl('vk');
        }
        function authFB(){
            window.location.href = 'https://www.facebook.com/dialog/oauth?client_id=1466129586957898&response_type=code&scope=email,user_birthday&redirect_uri='+getRedirectUrl('fb');
        }
        function authG(){
            window.location.href = 'https://accounts.google.com/o/oauth2/auth?scope=email%20profile&response_type=code&client_id=261707923682-3e83krp7lmhhqpo8rpmk455geoptp2tg.apps.googleusercontent.com&redirect_uri='+getRedirectUrl('g');
        }
        function authTW(){
            $http.get(openidURL + '?twurl=' + getState('tw')).success(function(url){
                window.location.href = url;
            });
        }
        function logout(){
            $http.post('api/user.php?logout=1').then(function(){
                window.location.reload();
            });
        }
        function getRedirectUrl(type){
            return encodeURIComponent(openidURL) + '&state=' + getState(type);
        }
        function getState(type){
            return encodeURIComponent(type + '::' + window.location.href.replace(/(#.*?$)/,''));
        }

    }])
    .directive('date', ['$filter', function ($filter){ 
       return {
          require: 'ngModel',
          link: function(scope, elem, attr, ngModel) {

              //For DOM -> model validation
              ngModel.$parsers.unshift(function(value) {
                 var valid = isValid(value);
                 ngModel.$setValidity('date', !!valid);
                 return value;
              });

              //For model -> DOM validation
              ngModel.$formatters.unshift(function(value) {
                 ngModel.$setValidity('date', !!isValid(value));
                 return value;
              });
          }
       };
       function isValid(value){
          if(!value) return true;
          var date = value.replace(/[^\d]/g,'');
      
          if(date.length != 8) return false;

          date = new Date(date.substring(4)+'-'+date.substring(2,4)+'-'+date.substring(0,2));
          var time = date.getTime();
          var curTime = new Date().getTime();
          var valid = !(isNaN(time) || (curTime - time < 86400 * 365 * 4 * 1000) || (curTime - time > 86400 * 365 * 90 * 1000));
          return valid ? time : false;
       }
    }]);