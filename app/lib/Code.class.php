<?php

require_once __DIR__.'/DB.class.php';
require_once __DIR__.'/Cache.class.php';
require_once __DIR__.'/User.class.php';

class Code {
    const ERROR_CODE = 1;
    const ERROR_USED = 2;
    const ERROR_NOTAUTH = 3;
    static public function usecode($code, &$score){
        $rs = DB::query("SELECT user_id, score, expire_date FROM code WHERE `code` = :code ", array(":code" => $code));
        if(!count($rs)) return self::ERROR_CODE;
        
        if(strtotime($rs[0]['expire_date']) < time()) return self::ERROR_CODE;
        
        $score = (int)$rs[0]['score'];
        
        if($rs[0]['user_id'] == User::getKey()) return self::ERROR_USED;
        
        if(!User::isAuth()) {
            return self::ERROR_NOTAUTH;
        }
        
        $rs = DB::query("SELECT uri FROM user WHERE id = ".User::getKey());
        if($_GET['h'] != md5($rs[0]['uri'].$code)) {
            $score = null;
            return self::ERROR_CODE;
        }
        DB::update("UPDATE user SET score = score + $score, promo_score = promo_score + $score WHERE id = ".User::getKey());
        DB::update("UPDATE code SET user_id = ".User::getKey().", used_at = NOW() WHERE code = :code ", array(
            ':code' => $code
        ));
        
        Cache::remove('userdata.'.User::getKey());
        
        return 0;
    }
}
