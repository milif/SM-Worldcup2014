"use strict";
/**
 *
 * @requires jquery/jquery.js
 * @requires angular/angular.js
 * @requires angular/angular-animate.js
 * @requires angular/angular-resource.js
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
angular.module('stmwc', ['ngAnimate', 'ngResource', 'ngLocale', 'ui.utils'])
    .config(['$sceProvider', '$locationProvider', function($sceProvider, $locationProvider){
        $sceProvider.enabled(false);
        $locationProvider.html5Mode(true);
    }])
    .run(['$stmwcAuth', '$timeout', '$location', '$rootScope', function($stmwcAuth, $timeout, $location, $rootScope){
        
        if($location.hash().indexOf('!') === 0 || $location.url().indexOf('/!') === 0){
            $stmwcAuth.session = $location.hash().substr(1);
            if($location.hash().indexOf('!') === 0) {
                $stmwcAuth.session = $location.hash().substr(1);
                $location.hash('');
            } else {
                $stmwcAuth.session = $location.url().substr(2);
                $location.url('/');
            }
            $location.replace();
            $rootScope.$on('loaded', $stmwcAuth.registrate);
        }

     }]);

