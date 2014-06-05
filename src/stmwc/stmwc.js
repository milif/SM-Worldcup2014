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
    .run(['$stmwcAuth', '$timeout', '$location', '$rootScope', '$stmwcEnv', '$http', '$cacheFactory', function($stmwcAuth, $timeout, $location, $rootScope, $stmwcEnv, $http, $cacheFactory){
        
        $stmwcAuth.init($stmwcEnv.auth, $stmwcEnv.requireConfirm, $stmwcEnv.requireAuth);
        
        $rootScope.$watch(function(){
            $rootScope.requireMnogoCard = $stmwcAuth.isAuth && !$stmwcAuth.data.hasMnogo;
        });
        
        $rootScope.sendMnogo = $stmwcAuth.sendMnogo;
        
        // Cache
        var cache = $cacheFactory('stmwc');
        $http.defaults.cache = cache;
        
        if($stmwcEnv.api){
            var api = $stmwcEnv.api;
            for(var key in api){
                cache.put(key, api[key]);
            }
        }
    }])
    .value('$stmwcEnv', {})
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

