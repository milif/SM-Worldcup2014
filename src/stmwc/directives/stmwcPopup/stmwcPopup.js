"use strict";
/**
 * @ngdoc directive
 * @name stmwc.directive:stmwcPopup
 * @function
 *
 * @requires stmwc.directive:stmwcPopup:popup.scss
 *
 * @requires stmwc.directive:stmwcPopupMask
 *
 * @description
 * Попап
 *
 * @element ANY
 *    
 */

angular.module('stmwc').directive('stmwcPopup', [function(){   
    var $ = angular.element;
    var popups = [];
    return {
        scope: true,
        template: function(tEl){
            var footer = tEl.find('footer');
            var content = tEl.find('content');
            return '<div ng-if="isShow" stmwc-popup-mask ng-cloak>' +
                        '<div class="popup--l" ng-click="onMaskClick($event)">' +
                            '<div class="popup--h">' +
                                    '<div ng-style="css" class="popup">' +
                                        '<span ng-click="hide()" class="popup__close">Закрыть</span>' +
                                        '<div class="popup__content '+(content.attr('class') || '')+'">' + content.html() + '</div>' +
                                        (footer.length > 0 ? '<div ' + applyAttrs(footer, {class: " popup__footer"}) + '>' + footer.html() + '</div>' : '') +
                                    '</div>' +
                                '</div>' +
                        '</div>' +
                    '</div>';
        },
        controller: ['$scope', '$attrs', '$element', function($scope, $attrs, $element) {
            var id = $attrs.stmwcPopup;
            var globalKeyEvents = {
                'keydown': function(e){
                    if(e.which == 27 && popups[popups.length - 1] == $scope){
                        $scope.$apply(hide);
                    }
                }
            }
            
            var css = $scope.css = {}
            if($attrs.width) {
                css.minWidth = css.width = $attrs.width;
            }
            $scope.hide = hide;
            $scope.onMaskClick = function(e){
                if($(e.target).closest('.popup').length > 0) return;
                hide();
            }
            
            show();
            
            $scope.$on('closePopup-' + id, hide);
            
            function show(){
                $scope.isShow = true;
                $(document).on(globalKeyEvents);
                popups.push($scope);
            }
            function hide(){
                $scope.isShow = false;
                $(document).off(globalKeyEvents);
                $scope.$emit('closedPopup-' + id);
                popups.splice(popups.indexOf($scope), 1);
            }
        }]
    };
    
    function applyAttrs(el, attrs){
        var res = ""; 
        $.each(el.get(0).attributes, function() {
            if(!this.specified) return;
            res += ' ' + this.name + '="' + (attrs[this.name] ? attrs[this.name] + ' ' : '') + this.value + '"';
            delete attrs[this.name];
        });
        for(var p in attrs){
            res = ' ' + p + '="' + attrs[p] + '"';
        }
        return res;
    }
}]);
