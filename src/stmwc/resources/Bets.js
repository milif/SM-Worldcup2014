"use strict";
    /**
     * @ngdoc interface
     * @name stmwc.Bets
     * @description
     *
     * Внешний интерфейс ставок
     * 
     */            
    angular.module('stmwc').factory('Bets', ['$resource', function($resource){
    
        var Bets = $resource('api/bets.php', null,
           {
               'update': { method:'POST', isArray: true }
           }
        );
        
        return Bets;
        
    }]) 
