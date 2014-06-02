"use strict";
/**
 * @ngdoc directive
 * @name stmwc.directive:stmwcBets
 * @function
 *
 * @requires stmwc.directive:stmwcBets:bets.scss
 * @requires stmwc.directive:stmwcBets:bets.html
 *
 * @requires stmwc.Bets
 * @requires stmwc.directive:stmwcTooltip
 * @requires stmwc.filter:howmany
 *
 * @description
 * Ставки
 *
 * @element ANY
 *
 */

angular.module('stmwc').directive('stmwcBets', function(){
    var $ = angular.element;
    return {
        templateUrl: 'partials/stmwc.directive:stmwcBets:bets.html',
        replace: true,
        controller: ['$scope', 'Bets', '$interval', '$filter', '$animate', '$stmwcAuth', '$debounce', '$stmwcEnv', function($scope, Bets, $interval, $filter, $animate, $stmwcAuth, $debounce, $stmwcEnv){
            var bets;
            var currentSection = $scope.currentSection = [];
            var prevSection = $scope.prevSection = [];
            var nextSection = $scope.nextSection = [];
            var sections = $scope.sections = [currentSection];
            var betsForAuth = 0;
            var dates = $scope.dates = [];
            var menuTime = $scope.menuTime = 0;//getDayTime(new Date().getTime());
            
            $scope.requireAuth = $stmwcAuth.requireAuth(true);
            
            updateBets();
            
            var cancelUpdate = $interval(updateBets, 60000);
            $scope.callRequireAuth = function(){
                $stmwcAuth.requireAuth();
            }
            $scope.$on('$destroy', function(){
                $interval.cancel(cancelUpdate);
            });
            
            $scope.showMore = function(){
                if($stmwcAuth.requireAuth()) return;
                if(sections.indexOf(nextSection) >= 0) return;
                sections.push(nextSection);
            }
            $scope.hideMore = function(){
                if($stmwcAuth.requireAuth()) return;
                var ind = sections.indexOf(nextSection);
                if(ind < 0) return;
                sections.splice(ind, 1);
            }
            $scope.showPrev = function(){
                if($stmwcAuth.requireAuth()) return;
                if(sections.indexOf(prevSection) >= 0) return;
                sections.splice(0, 0, prevSection);
            }

            $scope.onBet = $debounce(500, function(bet){
                if($stmwcAuth.requireAuth()) return;
                var value = bet.value;
                if(!value[0] || !value[1]) return;
                Bets.bet(bet.id, parseInt(value[0]), parseInt(value[1]), function(canBet){
                    $scope.canBet = canBet;
                });
                betsForAuth++;
                
                if(!$stmwcAuth.isAuth && betsForAuth == 4) {
                    betsForAuth = 0;
                    $stmwcAuth.auth();
                }
            });
            $scope.onFocusInput = function(e){
                if($stmwcAuth.requireAuth()) return;
                if(!$scope.canBet) {
                    $stmwcAuth.auth();
                }
                var el = $(e.target).closest('[data-bet]').find('[data-error-flash]');
                el.addClass('a-error-flash');
                setTimeout(function(){
                    el.removeClass('a-error-flash');
                }, 600);
            }
            $scope.luckyBet = function(){
                if($stmwcAuth.requireAuth()) return;
                var bet;
                for(var i=0;i<sections.length;i++){
                    for(var ii=0;ii<sections[i].length;ii++){
                        for(var iii=0;iii<sections[i][ii].bets.length;iii++){
                            bet = sections[i][ii].bets[iii];
                            if(bet.time < $scope.time || bet.value[0] >= 0 || bet.value[1] >= 0) continue;
                            doBet(bet, [Math.round(Math.random() * 4), Math.round(Math.random() * 4)]);
                        }
                    }
                }
            }
            $scope.selectDate = function(date){
                if($stmwcAuth.requireAuth()) return;
                $scope.menuTime = menuTime = date ? getDayTime(date.bets[0].time) : 0;
                sections.length = 0;
                sections.push(currentSection);
                onUpdateBets();
                $scope.$broadcast('hideTooltip-selectdate');
            }
            function doBet(bet, value){
                Bets.bet(bet.id, value[0], value[1], function(canBet, success){
                    if(success) bet.value = value;
                    $scope.canBet = canBet;
                });
            }
            function updateBets(){
                bets = Bets.update(onUpdateBets);
            }
            function onUpdateBets(){
                var bet;
                var time = $scope.time = new Date().getTime();
                var currentDayTime = getDayTime(time);
                currentSection.length = 0;
                prevSection.length = 0;
                nextSection.length = 0;
                $scope.countMore = 0;
                $scope.countCurrent = 0;
                $scope.canBet = bets.canBet;
                dates.length = 0;
                for(var i=0;i<bets.length;i++){
                    bet = bets[i];
                    switch(bet.userResult) {
                        case 0:
                            bet.state = 'false';
                            break;
                        case 1:
                            bet.state = 'true';
                            break;
                        case 2:
                            bet.state = 'wine';
                            break;
                    }
                    bet.date = $filter('date')(bet.time, 'd MMMM');
                    if(bet.time < currentDayTime) {
                        addToSection(prevSection, bet);
                    } else if((menuTime == 0 && (countSection(currentSection) < 5 || currentSection[currentSection.length-1].date == bet.date)) || (bet.time < menuTime + 86400000 && bet.time >= menuTime)){
                        addToSection(currentSection, bet);
                    } else {
                        addToSection(nextSection, bet);
                    }
                }
                if(currentSection.length == 0){
                    if(nextSection.length > 0){
                        currentSection.push(nextSection.splice(0,1)[0]);
                    } else if(prevSection.length > 0){
                        currentSection.push(prevSection.pop());
                    }
                }
                
                var dateBet, descrs, descr;
                for(var date in dateBetsSet){
                    dateBet = dateBetsSet[date];
                    descrs = [];
                    for(var i=0;i<dateBet.bets.length;i++){
                        descr = dateBet.bets[i].descr;
                        if(descrs.indexOf(descr) < 0) descrs.push(descr);
                    }
                    descrs.sort();
                    dateBet.descr = descrs.join(',').replace(/,группа\s/ig, ', ');
                    
                    if(time < dateBet.bets[0].time && dates.length < 10){
                        dates.push(dateBet);
                    }
                }
                
                $scope.countCurrent = countSection(currentSection);
                $scope.countMore = countSection(nextSection);
            }
            
            var dateBetsSet = {};
            
            function countSection(section){
                var count = 0;
                for(var i=0;i<section.length;i++){
                    count += section[i].bets.length;
                }
                return count;
            }
            function addToSection(section, bet){
                var key = bet.date;
                var dateBets = dateBetsSet[key];
                if(!dateBets) {
                    dateBets = {
                        date: bet.date,
                        bets: []
                    };
                    dateBetsSet[key] = dateBets; 
                }
                if(section.indexOf(dateBets) < 0){
                    dateBets.bets.length = 0;
                    section.push(dateBets);
                }
                dateBets.bets.push(bet);
            }
            function getDayTime(time){
                var d = new Date(time);
                return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime(); 
            }
        }]
    };
});
angular.module('stmwc').animation('.animate-bet-section', function(){
    return {
        'enter': function(el, done){
            var height = el.height();
            if(height == 0) {
                return;
            } 
            el
                .css({
                    height: 0
                })
                .animate({
                    height: height
                }, 300, null, done);                
                
            return function(){
                el.css({
                    height: 'auto'
                });
            }
        },
        'leave': function(el, done){
            el
                .animate({
                    height: 0
                }, 300, null, function(){
                    done();
                });
            return function(){
                el.stop();
            }
        }
    }
});
angular.module('stmwc').filter('timeto', ['$filter', function($filter) {
    return function(time, curTime) {
        var interval = Math.round(time - curTime) / 1000;
        var dd = Math.floor(interval / 86400);
        var hh = Math.floor((interval - dd * 86400) / 3600);
        var mm = Math.ceil((interval - dd * 86400 - hh * 3600) / 60);

        var res = [];
        if(dd > 0) {
            res.push(dd + ' ' + $filter('howmany')(dd, 'день', 'дня', 'дней'));
        }
        if(hh > 0) {
            res.push(hh + ' ' + $filter('howmany')(hh, 'час', 'часа', 'часов'));
        }
        if(mm > 0) {
            res.push(mm + ' ' + $filter('howmany')(mm, 'минута', 'минуты', 'минут'));
        }
        return res.join(' ');
    };
}]);