"use strict";
/**
 * @ngdoc directive
 * @name stmwc.directive:stmwcPreload
 * @function
 *
 * @requires stmwc.directive:stmwcPreload:preload.scss
 * @requires stmwc.directive:stmwcPreload:preload.html
 * @requires stmwc.directive:stmwcPopupMask
 *
 * @description
 * Загрузчик картинок. По умолчанию данные к загрузке берутся из window._assets
 *
 * @element ANY
 *    
 */

angular.module('stmwc').directive('stmwcPreload', [function(){    
    return {
        scope: true,
        templateUrl: 'partials/stmwc.directive:stmwcPreload:preload.html',
        controller: ['$scope', '$timeout', '$element', function($scope, $timeout, $element){
            var assets;
            var count;
            
            $element.hide();
            
            init();
            
            $('html,body').scrollTop(1).scrollTop(0);
            
            function init(){
                $scope.isLoad = false;
                assets = window._assets;
                if(!assets) return;
                
                $timeout(function(){
                    if(!$scope.isLoad) $scope.showLoading = true;
                }, 500);
                $timeout(function(){
                    if(!$scope.isLoad) $scope.showPercent = true;
                }, 1000);
                
                preload();

            }          
            function preload(){
                var item;
                count = 0;
                
                for(var i=0;i<assets.length;i++){
                    item = assets[i];
                    if(/\.(png|jpg|gif)\s*$/i.test(item)){
                        count++;
                        $(new Image()).attr('src', item)
                            .load(onload)
                            .error(onload);
                       
                    }
                }
                
                if(count == 0) $timeout(onload, 0);
                
                function onload(){
                    if(count == 0 || count-- == 1) {
                        
                        $scope.percent = 100;
                        $scope.isLoad = true;
                        /**
                           * @ngdoc event
                           * @name stm.directive:stmPreload#loaded
                           * @eventOf stm.directive:stmPreload
                           * @eventType emit on parent scope
                           * @description
                           * Окончание загрузки 
                           * 
                           */                         
                        $scope.$emit('loaded'); 
                        $scope.$destroy();                         
                    } else {    
                        $scope.percent = Math.round((assets.length - count) / assets.length * 100);
                        $scope.$digest();                        
                    }
                }
            }
        }]
    };
}]);
