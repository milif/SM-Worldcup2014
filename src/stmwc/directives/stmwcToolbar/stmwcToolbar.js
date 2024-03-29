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
        controller: ['$scope', '$element', '$location', function($scope, $element, $location){
            
            var bodyEl = $('body');
            var windowEl = $(window);
            var firstEl = $('body > :first');
            var scrollLeft;
            var anchorEls;
            
            $scope.showTop = function(){
                $scope.$emit('showTop');
            }
            
            $scope.$on('$locationChangeSuccess', function(){
                $scope.hash = $location.hash();
                //console.log('Hash:' + $scope.hash)
                onUrlUpdate();
            });
            
            $scope.$on('loaded', function(){
                anchorEls = $('body,[anchor]');
                $scope.hash = $location.hash();
                setTimeout(function(){
                    inScroll = false;
                    inMenuScroll = false;
                    onUrlUpdate();
                    $scope.$digest();
                }, 250);        
            });
            
            $element.on('click', '[hashbutton]', function(e){
                if('#' + $location.hash() == $(e.target).closest('[href]').attr('href') && !inMenuScroll) {
                    onUrlUpdate();
                    $scope.$digest();
                }
            });
            
            windowEl.scroll(function(){
                if(bodyEl.hasClass('m_masked')){
                    return;
                }
                onScrollUpdate();
                if(scrollLeft == windowEl.scrollLeft() || bodyEl.hasClass('m_masked')) return;
                scrollLeft = windowEl.scrollLeft();
                $element.css({
                    left: -Math.max(0, Math.min(scrollLeft, firstEl.width() - windowEl.width()))
                });
            });
            
            var inScroll = true;
            var inMenuScroll = true;
            var cancelInScrollTimeout;
            
            function onScrollUpdate(){
                if(!anchorEls || inMenuScroll) return;
                //console.log('onScrollUpdate')
                if(!inScroll) setInScroll();
                var posTop = windowEl.scrollTop() + windowEl.height() * 0.5;
                var winHeight = windowEl.height();
                var el, prevEl;
                anchorEls.each(function(){
                    el = $(this);
                    if(-posTop + el.offset().top > 0) {
                        el = prevEl;
                        return false;
                    }
                    prevEl = el;
                });
                var anchor = prevEl.attr('anchor') || '';
                if($location.hash() != anchor) {
                     $scope.$apply(function(){
                         $location.hash(anchor);
                     });
                }
            }
            function onUrlUpdate(isJump){
                if(inScroll) return;
                var hash = $location.hash();
                var el = $(hash == '' ? 'body' : '[anchor='+hash+']');
                if(el.length == 0) return;
                var scrollTop = Math.max(0, el.offset().top - 65);
                //console.log(hash, scrollTop, inMenuScroll, inScroll)
                if(el.length > 0 && scrollTop != windowEl.scrollTop()) { 
                    if(isJump) {
                        windowEl.scrollTop(scrollTop);
                    } else {
                        inMenuScroll = true;
                        $('html,body').stop().animate({
                            scrollTop: scrollTop
                        }, null, null, function(){
                            setTimeout(function(){
                                inMenuScroll = false;
                            }, 50);
                        });
                    }
                }
            }
            function setInScroll(){
                inScroll = true;
                clearTimeout(cancelInScrollTimeout);
                cancelInScrollTimeout = setTimeout(function(){
                    inScroll = false;
                }, 100);
            }
        }]
    };
});
