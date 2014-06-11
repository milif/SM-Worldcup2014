"use strict";
/**
 * @ngdoc directive
 * @name stmwc.directive:stmwcPopupTop
 * @function
 *
 * @requires stmwc.directive:stmwcPopupTop:top.scss
 * @requires stmwc.directive:stmwcPopupTop:top.html
 *
 * @requires stmwc.directive:stmwcPopup
 *
 * @description
 * Попап
 *
 * @element ANY
 *    
 */

angular.module('stmwc').directive('stmwcPopupTop', [function(){   
    return {
        scope: true,
        templateUrl: 'partials/stmwc.directive:stmwcPopupTop:top.html',
        controller: ['$scope', '$attrs', '$http', '$stmwcAuth', '$stmwcEnv', 'Bets', '$timeout', '$location', '$rootScope', function($scope, $attrs, $http, $stmwcAuth, $stmwcEnv, Bets, $timeout, $location, $rootScope) {
            $scope.isReady = false;
            $scope.goBets = function(){
                $scope.$broadcast('closePopup-top');
                $timeout(function(){
                    $location.hash('bets');
                    $rootScope.$broadcast('$locationChangeSuccess');
                }, 500);
            }
            $http.post('api/user.php', {
                action: 'top'
            })
                .success(function(data){
                    $scope.data = data;
                    var item, count, p, i;
                    var hasSelf = false;
                    var selfItem = {
                        avatar: $stmwcAuth.isAuth ? $stmwcAuth.data.avatar : null,
                        score: Bets.getScore(),
                        name: $stmwcAuth.getName(),
                        bets: Bets.getUserBets(),
                        place: $stmwcEnv.place.user,
                        self: true
                    }
                    for(i=0; i<data.length;i++){
                        item = data[i];
                        if($stmwcAuth.isAuth && $stmwcAuth.data.refKey == item.refKey){
                            hasSelf = true;
                            data.splice(i, 1, selfItem);
                            item = selfItem;
                        }
                        item.place = i+1; 
                        prepearItem(item);
                    }
                    if(!hasSelf) {
                        var place = selfItem.place;
                        var count = Math.max(0, place - data.length - 1);
                        data.push({
                            separator: true,
                            count: count
                        });
                        data.push(selfItem);
                        prepearItem(selfItem);
                    }
                    
                    $scope.isReady = true;
                });
                
            function prepearItem(item){
                var count, p;
                item.bets = item.bets || [];
                count = 0;
                for(p in item.bets){
                    count += item.bets[p];
                }
                item.stage = $scope.getStage(item.score, item.place);
                item.bets.count = count;
            } 
        }]
    };
}]);
