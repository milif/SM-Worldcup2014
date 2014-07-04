"use strict";
/**
 * @ngdoc directive
 * @name stmwc.directive:stmwcBets
 * @function
 *
 * @requires stmwc.directive:stmwcBets:bets.scss
 * @requires stmwc.directive:stmwcBets:bets.html
 * @requires stmwc.directive:stmwcBetsSection
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
            var prevprevSection = $scope.prevprevSection = [];
            var sections = $scope.sections = [currentSection];
            var prevSections = $scope.prevSections = [prevSection];
            var betsForAuth = 0;
            var dates = $scope.dates = [];
            var menuTime = $scope.menuTime = 0;
            var time = new Date().getTime();
            var lastBet;
            
            $scope.hasToShare = false;
            
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
            $scope.showPrevMore = function(){
                if($stmwcAuth.requireAuth()) return;
                prevSections.push(prevprevSection);
            }
            $scope.hidePrevMore = function(){
                if($stmwcAuth.requireAuth()) return;
                var ind = prevSections.indexOf(prevprevSection);
                if(ind < 0) return;
                prevSections.splice(ind, 1);
            }
            $scope.onBet = function(bet){
                if($stmwcAuth.requireAuth()) return;
                
                var value = bet.value;
                if(bet.__value[0]+'' == value[0]+'' && bet.__value[1]+'' == value[1]+'') return;
                bet.__value = [value[0] || bet.__value[0], value[1] || bet.__value[1]];
                
                if(!value[0] || !value[1]) return;
                
                onBet(bet);
            }
            /*
            $scope.cancel = function(bet){
                Bets.bet(bet.id, null, null, function(canBet, success){
                    if(success){
                        delete bet.value[0];
                        delete bet.value[1];
                    }
                    $scope.canBet = canBet;
                    updateState(bet);
                });
            }
            */
            var onBet = $debounce(500, function(bet){
                var value = bet.value;
                Bets.bet(bet.id, value[0], value[1], function(canBet){
                    $scope.canBet = canBet;
                    updateState(bet);
                    if($stmwcAuth.isAuth) {
                        onShare(bet);
                    }
                });
                betsForAuth++;
                
                if(!$stmwcAuth.isAuth && betsForAuth == 4) {
                    betsForAuth = 0;
                    $stmwcAuth.auth();
                }
            });
            var onShare = $debounce(5000, shareBet);
            
            $scope.shareBet = shareBet;
            
            $scope.$on('closedPopup-sharebet', function(){
                delete $scope.share;
            });
            $scope.onBlurInput = function(bet){
                bet.value[0] = bet.__value[0];
                bet.value[1] = bet.__value[1];
            }
            $scope.onFocusInput = function(e, bet){
                bet.__value = [bet.value[0],bet.value[1]];
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
            $scope.luckyBet = function(bet){
                if($stmwcAuth.requireAuth()) return;
                if(bet) {
                    doBet(bet, [Math.round(Math.random() * 4), Math.round(Math.random() * 4)]);
                    return;
                }
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
                $scope.menuTime = menuTime = date == -1 ? -1 : date ? getDayTime(date.bets[0].time) : 0;
                sections.length = 0;
                sections.push(currentSection);
                onUpdateBets();
                $scope.$broadcast('hideTooltip-selectdate');
            }
            function shareBet(bet){
                if($scope.share) return;
                
                if(!bet){
                    var betsToShare = [];
                    var actualBets = [];
                    for(var i=0;i<bets.length;i++){
                        if(bets[i].value[0] == null || !bets[i].value[1] == null) continue;
                        if(bets[i].time > $scope.time) actualBets.push(bets[i]);
                        betsToShare.push(bets[i]);
                    }
                    if(actualBets.length > 0){
                        bet = actualBets[Math.round(Math.random() * (actualBets.length - 1))]; 
                    } else {
                        bet = betsToShare[Math.round(Math.random() * (betsToShare.length - 1))];
                    }
                }
                
                $scope.share = {
                    bet: bet
                };
            }
            function doBet(bet, value){
                Bets.bet(bet.id, value[0], value[1], function(canBet, success){
                    if(success) bet.value = value;
                    $scope.canBet = canBet;
                    updateState(bet);
                });
            }
            function updateBets(){
                bets = Bets.update(onUpdateBets);
            }
            function onUpdateBets(){
                var bet;
                time = $scope.time = new Date().getTime();
                var currentDayTime = getDayTime(time);
                currentSection.length = 0;
                prevSection.length = 0;
                nextSection.length = 0;
                prevprevSection.length = 0;
                $scope.countMore = 0;
                $scope.countCurrent = 0;
                $scope.canBet = bets.canBet;
                dates.length = 0;
                
                var prevArr = [];
                
                for(var i=0;i<bets.length;i++){
                    bet = bets[i];
                    updateState(bet);
                    bet.date = $filter('date')(bet.time, 'd MMMM');
                    if(bet.time < currentDayTime) {
                        if(menuTime == -1){
                            addToSection(currentSection, bet);
                        } else {
                            prevArr.push(bet);
                        }
                    } else if(
                        menuTime != -1 
                        &&
                        ((menuTime == 0 && (countSection(currentSection) < 15 || currentSection[currentSection.length-1].date == bet.date)) || (bet.time < menuTime + 86400000 && bet.time >= menuTime))
                    ){
                        addToSection(currentSection, bet);
                    } else {
                        addToSection(nextSection, bet);
                    }
                }
                
                prevArr.reverse();
                for(var i=0; i<prevArr.length; i++){
                    bet = prevArr[i];
                    addToSection(countSection(prevSection) < 5 || prevSection[prevSection.length-1].date == bet.date ? prevSection : prevprevSection, bet);
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
                
                if(dates.length == 0){
                    menuTime = $scope.menuTime = -1;
                    sections.splice(0, 0, prevSection);
                } else {
                    if(currentSection.length == 0){
                        if(nextSection.length > 0){
                            currentSection.push(nextSection.splice(0,1)[0]);
                        } else if(prevSection.length > 0){
                            currentSection.push(prevSection.pop());
                        }
                    }
                }
                
                $scope.countCurrent = countSection(currentSection);
                $scope.countMore = countSection(nextSection);
                $scope.countPrev = countSection(prevSection);
                $scope.countPrevMore = countSection(prevprevSection);
                
            }
            
            var dateBetsSet = {};
            
            function updateState(bet){
                if(bet.userResult !== null) {
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
                } else if(bet.time > time && bet.value[0] >= 0 && bet.value[1] >= 0){
                    bet.isUpdated = bet.state == 'bet';
                    bet.state = 'bet';
                } else if(bet.time <= time && bet.value[0] >= 0 && bet.value[1] >= 0){
                    bet.state = 'lock';
                } else if(bet.time > time && bet.time - 7200000 <= time && !(bet.value[0] >= 0 && bet.value[1] >= 0)) {
                    bet.state = 'warn';
                } else {
                    bet.isUpdated = bet.state = null;
                }
                $scope.hasToShare = $scope.hasToShare || (bet.value[0] != null && bet.value[1] != null);
            }
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
/**
 * @ngdoc directive
 * @name stmwc.directive:stmwcBetsSection
 * @function
 *
 * @requires stmwc.directive:stmwcBetsSection:betssection.html
 *
 * @description
 * Блок ставок
 *
 * @element ANY
 *
 */
angular.module('stmwc').directive('stmwcBetsSection', function(){
    return {
        scope: true,
        templateUrl: 'partials/stmwc.directive:stmwcBetsSection:betssection.html',
        replace: true,
        controller: ['$scope', '$attrs', function($scope, $attrs){
            $scope.section = $scope.$eval($attrs.stmwcBetsSection);
        }]
    }
});
/**
 * @ngdoc directive
 * @name stmwc.directive:stmwcBetsShared
 * @function
 *
 * @requires stmwc.directive:stmwcBetsShared:betsshared.scss
 * @requires stmwc.directive:stmwcBetsShared:betsshared.html
 *
 * @requires stmwc.filter:howmany
 * @requires stmwc.directive:stmwcPopup
 *
 * @description
 * Попап шаринга ставок
 *
 * @element ANY
 *
 */
angular.module('stmwc').directive('stmwcBetsShared', function(){
    var $ = angular.element;
    return {
        templateUrl: 'partials/stmwc.directive:stmwcBetsShared:betsshared.html',
        controller: ['$scope', '$attrs', '$stmwcAuth', function($scope, $attrs, $stmwcAuth){
            var user = $scope.user = $scope.$eval($attrs.stmwcBetsShared);
            var bets = user.bets;
            
            bets.wins = 0;
            bets.score = 0;
            var bet;
            for(var i=0;i<bets.length;i++){
                bet = bets[i];
                if(bet.userResult !== null) {
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
                } else {
                    bet.state = null;
                }
                if(bet.userResult == 1){
                    bets.wins++
                } else if(bet.userResult == 2){
                    bets.score++;
                }
            }
            user.stage = $scope.getStage(user.score, user.place.user);
            $scope.time = new Date().getTime();
            $scope.betsCss = {
                maxHeight: Math.max(300, $(window).height() - 250)
            }
            
        }]
    }
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
        var hh = Math[dd > 0 ? 'round' : 'floor']((interval - dd * 86400) / 3600);
        var mm = dd > 0 ? 0 : Math.ceil((interval - dd * 86400 - hh * 3600) / 60);

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