"use strict";
    /**
     * @ngdoc interface
     * @name stmwc.Bets
     * @description
     *
     * Внешний интерфейс ставок
     * 
     */            
    angular.module('stmwc').factory('Bets', ['$resource', '$filter', '$stmwcEnv', '$timeout', '$rootScope', function($resource, $filter, $stmwcEnv, $timeout, $rootScope){
        
        var $$ = angular;
        
        var __bets = [];
        var __betsKeys = {};
        
        var Bets = $resource('api/bets.php', null,
           {
               '__update': { method:'POST'}
           }
        );
        
        Bets.update = update;
        Bets.bet = bet;
        Bets.getUserBets = getUserBets;
        Bets.getBets = getBets;
        
        return Bets;
        
        function getUserBets(){
            var bet, type;
            var bets = {};
            for(var i=0;i<__bets.length;i++){
                bet = __bets[i];
                if('0' in bet.value) {
                    if(bet.userResult == null) {
                        type = 'bet';
                    } else {
                        switch(bet.userResult) {
                            case 0:
                                type = 'false';
                                break;
                            case 2:
                                type = 'true';
                                break;
                            case 1:
                                type = 'wine';
                                break;
                        }    
                    }
                    bets[type] = bets[type] || 0; 
                    bets[type]++;
                }
            }
            return bets;
        }
        function bet(id, left, right, clbFn){
            var res = Bets.save({
                action: 'bet',
                id: id,
                value: [left, right]
            }, function(){
                clbFn(res.canBet, res.success);
            });
            return res;
        }
        function getBets(){
            return __bets;
        }
        function update(clbFn){
            var bets
            var data;
            
            if($stmwcEnv.bets) {
                data = $stmwcEnv.bets;
                $timeout(applyData, 0);
                $stmwcEnv.bets = null;
            } else {
                data = Bets.__update({
                    action: 'update'
                }, applyData);   
            }
            
            return __bets;
            
            function applyData(){
                
                $rootScope.score = data.score;
                
                __bets.canBet = data.canBet;
                __bets.score = 0;
                bets = data.bets;
                var bet;
                var ids = [];
                for(var i=0;i<bets.length;i++){
                    bet = bets[i];
                    __bets.score += bet.score || 0;
                    bet.value = bet.value || {};
                    ids.push(bet.id);
                    if(bet.id in __betsKeys) {
                        bet.value = __betsKeys[bet.id].value;
                        $$.extend(__betsKeys[bet.id], bet);
                    } else {
                        __bets.push(bet);
                        __betsKeys[bet.id] = bet;
                    }
                }
                for(var i=0;i<__bets.length;i++){
                    var bet = __bets[i];
                    if(ids.indexOf(bet.id) < 0){
                        delete __betsKeys[bet.id];
                        __bets.splice(i--,1);
                    }
                }
                __bets.sort(function(a, b){return a.time - b.time});
                clbFn();
            }
        }
        
    }]) 
