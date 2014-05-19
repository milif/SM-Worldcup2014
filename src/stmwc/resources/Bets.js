"use strict";
    /**
     * @ngdoc interface
     * @name stmwc.Bets
     * @description
     *
     * Внешний интерфейс ставок
     * 
     */            
    angular.module('stmwc').factory('Bets', ['$resource', '$filter', function($resource, $filter){
        
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
        Bets.getScore = getScore;
        
        return Bets;
        
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
        function getScore(){
            return __bets.score;
        }
        function update(clbFn){
            var bets
            var data = Bets.__update({
                action: 'update'
            }, function(){
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
            });
            return __bets;
        }
        
    }]) 
