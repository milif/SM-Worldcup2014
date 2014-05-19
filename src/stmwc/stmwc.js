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
if (!window.requestAnimationFrame) {
        window.requestAnimationFrame = function(callback) {
            setTimeout(callback, 10);
        };
}
angular.module('stmwc', ['ngAnimate', 'ngResource', 'ngLocale', 'ngCookies', 'ui.utils'])
    .config(['$sceProvider', '$locationProvider', function($sceProvider, $locationProvider){
        $sceProvider.enabled(false);
        $locationProvider.html5Mode(true);
    }])
    .run(['$stmwcAuth', '$timeout', '$location', '$rootScope', '$stmwcEnv', function($stmwcAuth, $timeout, $location, $rootScope, $stmwcEnv){
        
        $stmwcAuth.init($stmwcEnv.auth, $stmwcEnv.requireConfirm);
        
     }]);

