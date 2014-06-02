"use strict";
/**
 * @ngdoc directive
 * @name stmwc.directive:stmwcToolbar
 * @function
 *
 * @requires stmwc.directive:stmwcToolbar:toolbar.scss
 * @requires stmwc.directive:stmwcToolbar:toolbar.html
 *
 * @requires stmwc.directive:stmwcShare
 *
 * @description
 * Тулбар
 *
 * @element ANY
 *
 */
angular.module('stmwc').directive('stmwcToolbar', function(){
    var $ = angular.element;
    return {
        templateUrl: 'partials/stmwc.directive:stmwcToolbar:toolbar.html',
        replace: true,
        link: function($scope, el){
            $('body').append(el);
        },
        controller:['$scope', '$element', function($scope, $element){
            $(window).scroll(function(){
                if($('body').hasClass('m_masked')) return;
                $element.css({
                    left: -Math.max(0, Math.min($(window).scrollLeft(), $('.ll-page').width() - $(window).width()))
                });
            });
        }]
    };
});
