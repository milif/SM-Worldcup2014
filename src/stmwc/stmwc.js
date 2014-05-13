"use strict";
/**
 *
 * @requires jquery/jquery.js
 * @requires angular/angular.js
 * @requires angular/angular-animate.js
 * @requires angular/angular-resource.js
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
angular.module('stmwc', ['ngAnimate', 'ngResource'])
    .config([function(){
    }])
    .run([function(){
     }])

