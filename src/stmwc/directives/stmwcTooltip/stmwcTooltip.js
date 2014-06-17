"use strict";
/**
 * @ngdoc directive
 * @name stmwc.directive:stmwcTooltip
 * @function
 *
 * @requires stmwc.directive:stmwcTooltip:tooltip.scss
 * @requires stmwc.directive:stmwcTooltip:tooltip.html
 *
 * @description
 * Тултип
 *
 * @element ANY
 *
 */
angular.module('stmwc').directive('stmwcTooltip', function(){
    return {
        templateUrl: 'partials/stmwc.directive:stmwcTooltip:tooltip.html',
        transclude: true,
        scope: true,
        link: function(scope, element, attrs) {
            element.insertAfter(element.closest('[tooltips]'));
        },
        controller: ['$scope', '$attrs', '$timeout', '$element', function($scope, $attrs, $timeout, $element){         
            
            var windowEl = $(window);
            
            var globalEvents = {
                'mousedown': function(e){
                    if($(e.target).closest($element).length == 0){
                        hide();
                        $scope.$digest();
                    }
                }
            }
            
            $element.parent().on('mousedown', $attrs.element, function(e){
                if($(e.target).closest($element).length == 0){
                    if(!$scope.hide) return;
                    showTooltip(e); 
                    $scope.$digest();
                }
            });
            
            var offset = $attrs.offset ? $scope.$eval($attrs.offset) : [0,0];
            var width = $attrs.width ? $scope.$eval($attrs.width) : null;
            
            var position;
            var direction = $attrs.direction ? $scope.$eval($attrs.direction) || $attrs.direction : null;
            var align = $attrs.align || 'center';
            
            $scope.id = $attrs.stmwcTooltip;
            $scope.hide = true;
            $scope.$on('hideTooltip-' + $scope.id, hide);  
            
            function showTooltip(e){
                var el = $(e.target);
                var offset = el.offset();
                  
                var offsetParentEl = $element.offsetParent();
                var cntOffset = offsetParentEl.offset();
                var boundingClient = e.target.getBoundingClientRect();
                if(!direction) {
                    var isTop = boundingClient.top > windowEl.height() - boundingClient.top - el.outerHeight();
                    $scope.direction = isTop ? 'top' : 'bottom';
                } else {
                    $scope.direction = direction;
                }
                
                $scope.align = align;
                
                var css = $scope.css = {};
                var cssTri = $scope.cssTri = {};
                
                if(align == 'right') {
                    css.right = cntOffset.left + offsetParentEl.outerWidth() - (offset.left + el.outerWidth());
                    cssTri.left = css.left = 'auto';
                    cssTri.right = el.outerWidth() / 2;
                } else {
                    css.left = -cntOffset.left + offset.left + el.outerWidth() / 2;
                }
                
                if(isTop){
                    css.bottom = cntOffset.top + offsetParentEl.outerHeight() - offset.top;
                } else {
                    css.top = -cntOffset.top + offset.top + el.outerHeight();
                }
                
                css.marginLeft = -(width || 200) / 2;
                css.width = width || 'auto';  
                           
                show();   
                
            }
            function show(){
                if(!$scope.hide) return;
                $scope.hide = false;
                $timeout(function(){
                    windowEl.on(globalEvents);
                }, 50);
            }
            function hide(){
                if($scope.hide) return;
                windowEl.off(globalEvents);
                $scope.hide = true;
                $scope.$emit('hideTooltip', $scope.id);
            }
        }]
    };
});
