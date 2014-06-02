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
        link: function(scope, element, attrs) {
            element.closest('[tooltips]').append(element);
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
            var position;
            var direction = $attrs.direction ? $scope.$eval($attrs.direction) || $attrs.direction : null;
            
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
                if(isTop){
                    position = [-cntOffset.left + offset.left + el.outerWidth() / 2, -cntOffset.top + offsetParentEl.outerHeight() - offset.top];
                } else {
                    position = [-cntOffset.left + offset.left + el.outerWidth() / 2, -cntOffset.top + offset.top + el.outerHeight()];
                }
                updatePosition();               
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
            function updatePosition(){
                if(!position) return;
                if($scope.direction == 'top'){
                    $scope.css = {
                        left: position[0] + offset[0],
                        bottom: position[1] + offset[1]
                    }                
                } else {
                    $scope.css = {
                        left: position[0] + offset[0],
                        top: position[1] + offset[1]
                    }
                }                
            }
        }]
    };
});
