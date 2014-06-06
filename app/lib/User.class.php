<?php

require_once __DIR__.'/../config.php';
require_once __DIR__.'/DB.class.php';
require_once __DIR__.'/Cache.class.php';
require_once __DIR__.'/Log.class.php';

class User {
    const CONFIRM_ERROR = 1;
    const CONFIRM_ERROR_HAS = 2;
    const UNSUBSCRIBE_ERROR = 1;
    const UNSUBSCRIBE_ERROR_HAS = 2;
    static private $userId = null;
    static private $userKey = null;
    static public function getFriendsCount(){
        if(!User::isAuth()) return 0;
        $key = 'friends.'.User::getKey();
        $counter = Cache::get($key);
        if($counter !== false) return (int)$counter;
        
        $rs = DB::query("SELECT COUNT(*) as count FROM `user` WHERE ref_id = ".User::getKey());
        $count = $rs[0]['count'];
        Cache::set($key, $count, 1200);
        return (int)$count;
    }
    static public function isConfirmation($userId = 0){
        if(!User::isAuth() && !$userId) return false;
        if(!$userId) $userId = User::getKey();
        $key = 'isconfrm.'.$userId;
        $isConfrm = Cache::get($key);
        if($isConfrm !== false) return !!$isConfrm;
        
        $rs = DB::query("SELECT COUNT(*) as count FROM `user` WHERE `is_confirmed` > 0 AND id = ".$userId);
        $isConfrm = $rs[0]['count'];
        Cache::set($key, $isConfrm, 1200);
        return !!$isConfrm;
    }    
    static public function isRegistrated($userId = 0){
        if(!User::isAuth() && !$userId) return false;
        if(!$userId) $userId = User::getKey();
        $key = 'isreg.'.$userId;
        $isReg = Cache::get($key);
        if($isReg !== false) return !!$isReg;
        
        $rs = DB::query("SELECT COUNT(*) as count FROM `user` WHERE `registrated` > 0 AND id = ".$userId);
        $isReg = (int)$rs[0]['count'];
        Cache::set($key, $isReg, 1200);
        return !!$isReg;
    }    
    static public function getData($userId = 0){
        if(!User::isAuth() && !$userId) return NULL;
        if(!$userId) $userId = User::getKey();
        
        $key = 'userdata.'.$userId;
        
        $userData = Cache::get($key);
        if($userData !== false) return $userData;
        
        $rs = DB::query("SELECT name, avatar, email, phone, gender, dob, ref_key, mnogoru_card FROM `user` WHERE id = ".$userId);
        $userData = array(
            'refKey' => $rs[0]['ref_key'],
            'avatar' => $rs[0]['avatar'],
            'name' => $rs[0]['name'],
            'email' => $rs[0]['email'],
            'phone' => $rs[0]['phone'],
            'gender' => $rs[0]['gender'],
            'dob' => $rs[0]['dob'] ? date('dmY', strtotime($rs[0]['dob'])) : '',
            'isReg' => self::isRegistrated($userId),
            'hasMnogo' => !!$rs[0]['mnogoru_card']
        );
        
        Cache::set($key, $userData, 1200);
        return $userData;
    }      
    static public function confirmEmail($refKey, $checkHash){
        $rs = DB::query("SELECT id, email, is_confirmed FROM `user` WHERE `ref_key` = :refKey", array(':refKey' => $refKey));
        if(!count($rs) || md5($rs[0]['id'].$rs[0]['email']) != $checkHash) {
            Log::add('confirm_email_error', array(
                'user' => count($rs) ? $rs[0] : false,
                'checkHash' => md5($rs[0]['id'].$rs[0]['email']) == $checkHash
            ));
            return self::CONFIRM_ERROR;
        }
        if($rs[0]['is_confirmed'] > 0) {
            Log::add('confirm_email_error', array(
                'user' => count($rs) ? $rs[0] : false,
                'isConfirmed' => true
            ));        
            return self::CONFIRM_ERROR_HAS;
        }
        DB::query("UPDATE `user` SET `is_confirmed` = 1, `openid_verified_email` = {$rs[0]['email']} WHERE `id` = ".$rs[0]['id']);
        Log::add('confirm_email', array(
            'user' => $rs[0]
        ));
        
        self::auth((int)$rs[0]['id'], true);
        
        Cache::remove('isconfrm.'.$rs[0]['id']);
        return true;
    }
    static public function unsubscribe($refKey, $checkHash){
        $rs = DB::query("SELECT id, is_subscribe, email FROM `user` WHERE `ref_key` = :refKey", array(':refKey' => $refKey));
        if(!count($rs) || md5($rs[0]['id'].'unsubscribe') != $checkHash) return self::UNSUBSCRIBE_ERROR;
        if($rs[0]['is_subscribe'] == 0) return sprintf(self::UNSUBSCRIBE_ERROR_HAS, $rs[0]['email']);
        DB::query("UPDATE `user` SET `is_subscribe` = 0 WHERE `id` = ".$rs[0]['id']);
        return true;
    }
    static public function getPartnerByKey($key){
        $rs = DB::query("SELECT `partner_ref`, `partner_subref` FROM `user` WHERE `ref_key` = :key;", array(':key' => $key));
        return count($rs) > 0 ? array($rs[0]['partner_ref'], $rs[0]['partner_subref']) : null;
    }
    static public function getEmailByKey($key){
        $rs = DB::query("SELECT `email` FROM `user` WHERE `ref_key` = :key;", array(':key' => $key));
        return count($rs) > 0 ? $rs[0]['email'] : null;
    }
    static public function save($data){
        if(!User::isAuth()) return false;
        $rs = DB::query("SELECT email FROM `user` WHERE registrated > 0 AND id = ".User::getKey());
        $isRegistrated = count($rs) > 0;
        $isResetConfirmation = isset($data['email']) && $isRegistrated && $rs[0]['email'] != $data['email'];

        $data = array_intersect_key($data, array(
            'avatar' => true,
            'name' => true,
            'email' => true,
            'phone' => true,
            'gender' => true,
            'dob' => true,
            'mnogoru_card' => true
        ));

        DB::update("UPDATE `user` SET ".DB::getSetPart($data).($isRegistrated ? '' : ', registrated = NOW()').($isResetConfirmation ? ', is_confirmed = 0' : '')."  WHERE id = ".User::getKey(), $data);
        
        Cache::remove('userdata.'.User::getKey());
        Cache::remove('isreg.'.User::getKey());
        
        if(!$isRegistrated) {
            setcookie(SESSION_COOKIE, $_COOKIE[SESSION_COOKIE], time() + SESSION_TIME, APP_ROOT_URL."/");
            // Регистрация пройдена. Переносим ставки сделанные за анонимом пользователю
            if(isset($_COOKIE[SESSION_COOKIE.'_stmuid'])){
                DB::update("UPDATE user_bets SET user_key = :userKey WHERE user_key = :uniqKey ;", array(
                    ':userKey' => User::getKey(),
                    ':uniqKey' => $_COOKIE[SESSION_COOKIE.'_stmuid']
                ));
            }
        }
        
        return true;
    }        
    static public function hasPermissionPrice(){
        $rs = DB::query("SELECT COUNT(*) cc FROM `user` WHERE id = ".User::getKey()." AND price_access = 1;");
        return $rs[0]['cc'] > 0;
    }
    static public function login($loginData){
        
        if(!$loginData) return false;

        $data = $loginData['data'];
        
        self::logout();
        
        $uri = $data['uri'];
        if(!$uri) return false;

        $rs = DB::query("SELECT id, registrated FROM user WHERE uri = :uri OR (openid_verified_email = :email AND openid_verified_email IS NOT NULL)", array(
            ':uri' => $uri,
            ':email' => $data['email']
        ));
        $isReg = false;
        if(count($rs)) {
           $id = $rs[0]['id'];
           $isReg = strtotime($rs[0]['registrated']) > 0;
           DB::query("UPDATE user SET data= :data WHERE uri= :uri", array(':uri'=>$uri, ':data' => json_encode($data)));
        } else {
            $ref = isset($_COOKIE[SESSION_COOKIE.'_ref']) ? $_COOKIE[SESSION_COOKIE.'_ref'] : null;
            $refId = 0;
            if($ref){
                $ref = explode('.', $ref);
                $rs = DB::query("SELECT id FROM `user` WHERE ref_key = :refKey", array(":refKey" => $ref[0]));
                
                if(count($rs)){
                    $refId = $rs[0]['id'];
                }
            }
        
            $refKey = uniqid();
            DB::query("INSERT INTO user (uri, data, ref_key, ref_id, partner_ref, partner_subref, name, avatar, email, phone, gender, dob, openid_verified_email) VALUES (:uri, :data, '$refKey', $refId, :partnerRef, :partnerSubref, :name, :avatar, :email, :phone, :gender, :dob, :verifiedEmail)", array(
                ':uri'=>$uri,
                ':data'=>json_encode($data), 
                ':partnerRef'=>isset($_COOKIE['partner']) ? $_COOKIE['partner'] : '', 
                ':partnerSubref'=>isset($_COOKIE['subref']) ? $_COOKIE['subref'] : '',
                ':name' => $data['name'],
                ':avatar' => $data['avatar'], 
                ':email' => $data['email'],
                ':phone' => isset($data['phone']) ? $data['phone'] : NULL,
                ':gender' => $data['gender'], 
                ':dob' => $data['dob'],
                ':verifiedEmail' => $data['email']
            ));
            $id = DB::lastInsertId();           
            
        }
        if(!$id) return false;
        
        $cookie = self::auth($id, $isReg);
        
        $loginData = array(
            'session' => $cookie,
            'redirect' => $loginData['redirect']."#".($isReg ? '' : '!'.$cookie)
        );
        
        return $loginData;
    }
    static public function auth($userId, $isReg){
        
        $sessionId = md5(uniqid());
        
        $expire = time() + SESSION_TIME;
        if($isReg) {
            setcookie(SESSION_COOKIE, $sessionId, $expire, APP_ROOT_URL."/");
        }
        DB::query("DELETE FROM session WHERE expire < ".time());
        DB::query("INSERT INTO session (`key`, expire, user_id) VALUES (:cookie, $expire, $userId)", array(':cookie'=>$sessionId));
        
        self::$userId = $userId;
        self::$userKey = $userId;
        
        return $sessionId;
    }
    static public function logout(){
        setcookie(SESSION_COOKIE, "", -1, APP_ROOT_URL."/");
        return true;
    }   
    static public function isAuth(){
        return !!self::$userId;
    }
    static public function getKey(){
        return self::$userKey;
    }
    static public function init(){
        if(is_null(self::$userId)){
            self::$userId = 0;
            if(isset($_GET['session'])) $_COOKIE[SESSION_COOKIE] = $_GET['session'];
            if(isset($_COOKIE[SESSION_COOKIE])){
                $userSession = Cache::get("user_".$_COOKIE[SESSION_COOKIE]);
                if(!$userSession){
                    $rs = DB::query("SELECT user_id, expire FROM session WHERE `key` = :key AND expire > ".time(), array(':key'=>$_COOKIE[SESSION_COOKIE]));
                    if(count($rs)) {
                        $userSession = array(
                            'id' => count($rs) ? $rs[0]['user_id'] : false,
                            'expire' => (int)$rs[0]['expire']
                        );
                        Cache::set("user_".$_COOKIE[SESSION_COOKIE], $userSession, $rs[0]['expire']);
                        
                        self::$userId = $userSession['id'];
                    } else {
                        $userSession = array(
                            'id' => 0
                        );
                    }
                }
                
                if($userSession['id'] > 0 && $userSession['expire'] < time() + SESSION_TIME / 2) {
                    DB::update("UPDATE session SET expire = ".(time() + SESSION_TIME)." WHERE `key` = :key", array(':key' => $_COOKIE[SESSION_COOKIE]));
                }
                    
                self::$userId = $userSession['id'];
                 
            }
        }
        self::$userKey = self::$userId ? self::$userId : (isset($_COOKIE[SESSION_COOKIE.'_stmuid']) ? $_COOKIE[SESSION_COOKIE.'_stmuid'] : NULL);
        if(!self::$userKey) {
            self::$userKey = uniqid();
            setcookie(SESSION_COOKIE.'_stmuid', self::$userKey, 0, APP_ROOT_URL."/");
        }
    } 
    static public function getPlace(){
        $key = 'userPlace'.User::getKey();
        $place = Cache::get($key);
        if($place !== false) return $place;
        
        $rs = DB::query('SELECT SUM(score) score FROM user_bets WHERE user_key = :userKey;', array(
            ':userKey' => User::getKey()
        ));
        $rs = DB::query("SELECT COUNT(*) cc FROM user WHERE score < ".(int)$rs[0]['score']);
        $place = User::getTotal() - (int)$rs[0]['cc'];
        Cache::set($key, $place, 1200);
        return $place;
    }
    static public function getTotal(){
        $key = 'usersTotal';
        $total = Cache::get($key);
        if($total !== false) return $total;
        
        $rs = DB::query('SELECT COUNT(*) cc FROM user;');
        $total = (int)$rs[0]['cc'];
        Cache::set($key, $total, 1200);
        return $total;
    }
}

User::init();
