<?php 

require_once __DIR__.'/DB.class.php';
require_once __DIR__.'/User.class.php';

class Bets {
    static public function get(){
        $bets = array();
        $userBets = self::getUserBets();
        $rs = DB::query("SELECT * FROM bets ORDER BY `time`, `descr`");
        foreach($rs as $row){
            $userBet = isset($userBets[$row['id']]) ? $userBets[$row['id']] : NULL;
            $bets[] = array(
                'id' => $row['id'],
                'time' => strtotime($row['time']) * 1000,
                'descr' => $row['descr'],
                'data' => json_decode($row['data'], true),
                'result' => json_decode($row['result'], true),
                'userResult' => $userBet ? $userBet['result'] : NULL,
                'value' => $userBet ? json_decode($userBet['value'], true) : NULL,
                'score' => $userBet ? $userBet['score'] : NULL
            );
        }
        return $bets;
    }
    static public function getUserBets(){
        $rs = DB::query("SELECT `bet_id`, `value`, `result`, `score` FROM `user_bets` WHERE `user_key` = :userKey ;", array(
            ':userKey' => User::getKey()
        ));
        $userBets = array();
        foreach($rs => $row){
            $userBets[$row['bet_id']] = $row;
        }
        return $userBets;
    }
}
