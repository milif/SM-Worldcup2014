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
 *
 * @description
 * Ставки
 *
 * @element ANY
 *
 */
angular.module('stmwc').directive('stmwcBets', function(){
    return {
        templateUrl: 'partials/stmwc.directive:stmwcBets:bets.html',
        replace: true,
        controller: ['$scope', 'Bets', '$interval', function($scope, Bets, $interval){
            var bets;
            var currentSection = [];
            var prevSection = [];
            var nextSection = [];
            var sections = $scope.sections = [currentSection];
            
            updateBets();
            
            var cancelUpdate = $interval(updateBets, 60000);
            
            $scope.$on('$destroy', function(){
                $interval.cancel(cancelUpdate);
            });
            
            function updateBets(){
                bets = Bets.update(onUpdateBets);
            }
            function onUpdateBets(){
                var bet;
                var time = new Date().getTime();
                currentSection.length = 0;
                prevSection.length = 0;
                nextSection.length = 0;
                for(var i=0;i<bets.length;i++){
                    bet = bets[i];
                    if(!bet.date) {
                        bet.date = $filter('date')(bet.time, 'd MMMM');
                    }
                    if(bet.time < time) {
                        addToSection(prevSection, bet);
                    } else if(bet.time > time + 86400000){
                        addToSection(nextSection, bet);
                    } else {
                        addToSection(currentSection, bet);
                    }
                }
            }
            function addToSection(section, bet){
                var dateBets = section[section.length - 1];
                if(!dateBets || dateBets.date != bet.date || dateBets.descr != bet.descr) {
                    dateBets = {
                        date: bet.date,
                        bets: []
                    };
                    section.push(dateBets);
                } 
                dateBets.push(bet);
            }
        }]
    };
});
