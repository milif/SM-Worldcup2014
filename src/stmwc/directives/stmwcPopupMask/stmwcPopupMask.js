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
    var scrollTop;
    return {
        transclude: true,
        controller: ['$scope', '$transclude', '$attrs', function($scope, $transclude, $attrs) {
            var maskEl;
            var isAnimateEnter = !$attrs.animateEnter || $scope.$eval($attrs.animateEnter);
            $scope.$on('$destroy', function(){
                $animate.leave(maskEl, function(){
                    if(bodyEl.find('>.l-popup').length > 0) return;
                    bodyEl
                        .removeClass('m_masked')
                        .scrollTop(scrollTop);
                });
            });
            $transclude(function(el, scope){
                maskEl = $('<div class="l-popup">').append(el);
                if(isAnimateEnter) {
                    $animate.enter(maskEl, bodyEl);
                } else {
                    bodyEl.append(maskEl);
                }
                if(!bodyEl.hasClass('m_masked')){
                    scrollTop = bodyEl.scrollTop();
                    bodyEl
                        .addClass('m_masked')
                        .find('>:first')
                            .css('top', -scrollTop).end();
                }
            });
        }]
    };
}]);
