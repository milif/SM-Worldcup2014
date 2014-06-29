"use strict";
/**
 *
 * @requires jquery/jquery.js
 * @requires angular/angular.js
 * @requires angular/angular-animate.js
 * @requires angular/angular-resource.js
 * @requires angular/angular-cookies.js
 *
 * @requires angular/i18n/angular-locale_ru.js
 * @requires angularui/ui-utils.js
 *
 * @requires stmwc:bootstrap.scss
 * 
 * @ngdoc overview
 * @name stmwc
 * @description
 *
 * Sotmarket Worldcup 2014
 */

angular.module('stmwc', ['ngAnimate', 'ngResource', 'ngLocale', 'ngCookies', 'ui.utils'])
    .config(['$sceProvider', '$locationProvider', '$anchorScrollProvider', function($sceProvider, $locationProvider, $anchorScrollProvider){
        $sceProvider.enabled(false);
        $locationProvider.html5Mode(true);
        $locationProvider.hashPrefix('#');
        $anchorScrollProvider.disableAutoScrolling();
    }])
    .run(['$stmwcAuth', '$timeout', '$location', '$rootScope', '$stmwcEnv', '$http', '$cacheFactory', '$stmwcGtm', 'Bets', function($stmwcAuth, $timeout, $location, $rootScope, $stmwcEnv, $http, $cacheFactory, $stmwcGtm, Bets){
        
        if($stmwcAuth) {
            $stmwcAuth.init($stmwcEnv);
        
            $rootScope.$watch(function(){
                $rootScope.requireMnogoCard = $stmwcAuth.isAuth && !$stmwcAuth.data.hasMnogo;
            });
            
            $rootScope.sendMnogo = $stmwcAuth.sendMnogo;   
        }
        
        if($stmwcEnv.usershare){
            $rootScope.$on('loaded', function(){
                $rootScope.betsShared = $stmwcEnv.usershare;
                var off = $rootScope.$on('closedPopup-betsshared', function(){
                    off();
                    setTimeout(function(){
                        delete $rootScope.betsShared;
                        $location.url('/');
                        $rootScope.$digest();
                    }, 0);
                });
            });
        }
        if($stmwcEnv.code){
            $rootScope.$on('loaded', function(){
                $rootScope.code = $stmwcEnv.code;
                var off = $rootScope.$on('closedPopup-code', function(){
                    off();
                    setTimeout(function(){
                        delete $rootScope.code;
                        $location.url('/');
                        $rootScope.$digest();
                    }, 0);
                });
            });
        }
        
        $rootScope.$on('closedPopup-betsshared', function(){
            $rootScope.betsShared = null;
        });
        $rootScope.$on('showBets', function(e, userbets){
            $rootScope.betsShared = userbets;
        });
        
        $rootScope.getStage = getStage;
        $rootScope.getScore = getScore;
        
        $rootScope.$on('closedPopup-top', function(){
            setTimeout(function(){
                $rootScope.showTop20 = false;
                $rootScope.$digest();
            }, 0);
        });
        $rootScope.$on('showTop', function(){
            $rootScope.showTop20 = true;
        });
   
        // Cache
        var cache = $cacheFactory('stmwc');
        $http.defaults.cache = cache;
        
        if($stmwcEnv.api){
            var api = $stmwcEnv.api;
            for(var key in api){
                cache.put(key, api[key]);
            }
        }
        
        // GTM
        var gtmCfg =  $stmwcEnv.gtm;
        if(gtmCfg) $stmwcGtm.init(gtmCfg.id, gtmCfg.data);
        
        function getScore(){
            var score = ($stmwcAuth.isAuth ? $stmwcAuth.data.promoScore : 0) || 0;
            score += Bets.getScore() || 0;
            return score;
        }
        function getStage(score, place){
            if(score < 200) {
                return 'start';
            } else if(score < 500){
                return 'mnogo';
            } else if(place > 3){
                return 'headphones';
            } else {
                return 'iphone';
            }
        }
        
    }])
    .value('$stmwcEnv', {})
        /**
         * @ngdoc service
         * @name stm.$stmGtm
         * @description
         *
         * Google tag manager
         *
         */       
    .factory('$stmwcGtm', ['$window', function($window){
        var $stmwcGtm = {
            init: init,
            push: push
        };
        
        var l = '_GTMdataLayer';
        var $ = angular.element;
        var layer;
        
        return $stmwcGtm;
        
        function init(id, data){
            layer = $window[l] = data || [];
            layer.push({'gtm.start':new Date().getTime(),event:'gtm.js'});
            var f = document.getElementsByTagName('script')[0],j=document.createElement('script');
            j.async=true;
            j.src='//www.googletagmanager.com/gtm.js?id='+id+'&l='+l;
            f.parentNode.insertBefore(j,f);
        }
        function push(param){
            layer.push(param);
        }
    }])
    .factory('$debounce', ['$timeout', function ($timeout) {

         return function (wait, fn) {
             var args, context, result, timeout;

             // Execute the callback function
             function ping() {
                 result = fn.apply(context, args);
                 context = args = null;
             }

             // Cancel the timeout (for rescheduling afterwards).
             function cancel() {
                 if (timeout) {
                     $timeout.cancel(timeout);
                     timeout = null;
                 }
             }

             // This is the actual result of the debounce call. It is a
             // wrapper function which you can invoke multiple times and
             // which will only be called once every "wait" milliseconds.
             function wrapper() {
                 context = this;
                 args = arguments;
                 cancel();
                 timeout = $timeout(ping, wait);
             }

             // The wrapper also has a flush method, which you can use to
             // force the execution of the last scheduled call to happen
             // immediately (if any). It will also return the result of that
             // call. Note that for asynchronous operations, you'll need to
             // return a promise and wait for that one to resolve.
             wrapper.flush = function () {
                 if (context) {
                     // Call pending, do it now.
                     cancel();
                     ping();
                 } else if (!timeout) {
                     // Never been called.
                     ping();
                 }
                 return result;
             };

             return wrapper;
         };
    }]);

