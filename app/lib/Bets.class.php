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
                'time' => strtotime($row['time']." Europe/Moscow") * 1000,
                'descr' => $row['descr'],
                'data' => json_decode($row['data'], true),
                'result' => json_decode($row['result'], true),
                'userResult' => $userBet && !is_null($userBet['result'])? (int)$userBet['result'] : NULL,
                'value' => $userBet ? json_decode($userBet['value'], true) : NULL,
                'score' => $userBet ? (int)$userBet['score'] : NULL
            );
        }
        return $bets;
    }
    static public function bet($betId, $value){
        $rs = DB::query("SELECT `time` FROM bets WHERE id = :betId", array(
            ':betId' => $betId
        ));
        if(!count($rs) || strtotime($rs[0]['time']." Europe/Moscow") < time()) return false;

        if($value[0] !== NULL && $value[1] !== NULL) {
            $rs = DB::query("SELECT id FROM user_bets WHERE bet_id = :betId AND user_key = :userKey", array(
                ':betId' => $betId,
                ':userKey' => User::getKey()
            ));
            if(count($rs)){
                DB::update("UPDATE user_bets SET value = :value WHERE id = ".$rs[0]['id'], array(
                    ':value' => json_encode($value)
                ));
            } else {
                DB::update("INSERT INTO user_bets (bet_id, user_key, value) VALUES (:betId, :userKey, :value)", array(
                    ':betId' => $betId,
                    ':userKey' => User::getKey(),
                    ':value' => json_encode($value)
                ));   
            }   
        } else {
            DB::update("DELETE FROM user_bets WHERE bet_id = :betId AND user_key = :userKey", array(
                ':betId' => $betId,
                ':userKey' => User::getKey()
            ));
        }
        return true;
    }
    static public function canBet(){
        if(!User::isAuth()){
            $rs = DB::query("SELECT COUNT(*) cc FROM user_bets WHERE user_key = :userKey", array(
                ':userKey' => User::getKey()
            ));
            //  Запрещаем анониму делать более 12 ставок
            if($rs[0]['cc'] >= 12) return false;
        }
        return true;
    }
    static public function getUserBets(){
        $rs = DB::query("SELECT `bet_id`, `value`, `result`, `score` FROM `user_bets` WHERE `user_key` = :userKey ;", array(
            ':userKey' => User::getKey()
        ));
        $userBets = array();
        foreach($rs as $row){
            $userBets[$row['bet_id']] = $row;
        }
        return $userBets;
    }
}
