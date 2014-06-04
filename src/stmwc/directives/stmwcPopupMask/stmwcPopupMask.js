"use strict";
/**
 * @ngdoc directive
 * @name stmwc.directive:stmwcPopupMask
 * @function
 *
 * @requires stmwc.directive:stmwcPopupMask:popupmask.scss
 *
 * @description
 * Маска попапов
 *
 * @element ANY
 *    
 */

angular.module('stmwc').directive('stmwcPopupMask', ['$animate', function($animate){   
    var $ = angular.element;
    var bodyEl = $('body');
    var windowEl = $(window);
    var scrollTop;
    var stack = [];
    return {
        transclude: true,
        controller: ['$scope', '$transclude', '$attrs', function($scope, $transclude, $attrs) {
            var maskEl;
            var isAnimateEnter = !$attrs.animateEnter || $scope.$eval($attrs.animateEnter);
            $scope.$on('$destroy', function(){
                stack.splice(stack.indexOf(maskEl.get(0)), 1);
                $animate.leave(maskEl, function(){
                    if(stack.length > 0) return;
                    bodyEl
                        .removeClass('m_masked')
                        .find('>:first')
                            .css('top', 0).end();
                    if(scrollTop == 0) windowEl.scrollTop(1).scrollTop(0);
                    windowEl.scrollTop(scrollTop);
                });
                $(stack).fadeIn(200);
            });
            $transclude(function(el, scope){
                maskEl = $('<div class="l-popup">').append(el);
                $(stack).fadeOut(200);
                stack.push(maskEl.get(0));
                if(isAnimateEnter) {
                    $animate.enter(maskEl, bodyEl);
                } else {
                    bodyEl.append(maskEl);
                }
                if(!bodyEl.hasClass('m_masked')){
                    scrollTop = windowEl.scrollTop();
                    bodyEl
                        .addClass('m_masked')
                        .find('>:first')
                            .css('top', -scrollTop).end();
                }
            });
        }]
    };
}]);
