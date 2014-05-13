<?php

require_once __DIR__.'/../config.php';
require_once __DIR__.'/DB.class.php';
require_once __DIR__.'/Cache.class.php';
require_once __DIR__.'/Log.class.php';

class User {
    const CONFIRM_ERROR = 1;
    const CONFIRM_ERROR_HAS = 'Данный аккаунт уже зарегистрирован.';
    const UNSUBSCRIBE_ERROR = 'Ошибка при отписке.';
    const UNSUBSCRIBE_ERROR_HAS = 'Адрес <b>%s</b> уже отписан от всех рассылок.';
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
        $isReg = $rs[0]['count'];
        Cache::set($key, $isReg, 1200);
        return !!$isReg;
    }    
    static public function getData($userId = 0){
        if(!User::isAuth() && !$userId) return NULL;
        if(!$userId) $userId = User::getKey();
        
        $key = 'userdata.'.$userId;
        
        $userData = Cache::get($key);
        if($userData !== false) return $userData;
        
        $isReg = User::isRegistrated($userId);
        
        if($isReg){
            $rs = DB::query("SELECT name, avatar, email, phone, gender, dob, ref_key FROM `user` WHERE id = ".$userId);
            $userData = array(
                'refKey' => $rs[0]['ref_key'],
                'avatar' => $rs[0]['avatar'],
                'name' => $rs[0]['name'],
                'email' => $rs[0]['email'],
                'phone' => $rs[0]['phone'],
                'gender' => $rs[0]['gender'],
                'dob' => $rs[0]['dob'] ? date('dmY', strtotime($rs[0]['dob'])) : ''
            );
        } else {
            $rs = DB::query("SELECT data, ref_key FROM `user` WHERE id = ".$userId);
            $authData = json_decode($rs[0]['data'], true); 
            $name = $authData['name']['first_name'].' '.$authData['name']['last_name'];
            preg_match_all('/u[\da-f]{4}/', $name, $testName);
            if(count($testName[0]) > 4) $name = str_replace('u', '\u', $name);
            if(isset($authData['dob'])){
                if(preg_match('/vk\.com\//', $authData['identity'])
                 || preg_match('/odnoklassniki\.ru\//', $authData['identity'])
                 || preg_match('/mail\.ru/', $authData['identity'])
                ) {
                    $dob = substr($authData['dob'], 8) . substr($authData['dob'], 5, 2) . substr($authData['dob'], 0,4);
                } else {
                    $dob = substr($authData['dob'], 5, 2) . substr($authData['dob'], 8) . substr($authData['dob'], 0,4);
                }
            }
            $userData = array(
                'refKey' => $rs[0]['ref_key'],
                'email' => $authData['email'],
                'dob' =>  $dob,
                'gender' => isset($authData['gender']) && $authData['gender'] != "F" ? 'male' : 'female',
                'avatar' => isset($authData['photo']) ? $authData['photo'] : NULL ,
                'name' => $name
            );
        }
        
        $userData['isReg'] = $isReg;
        
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
        DB::query("UPDATE `user` SET `is_confirmed` = 1 WHERE `id` = ".$rs[0]['id']);
        Log::add('confirm_email', array(
            'user' => $rs[0]
        ));        
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
        $userData = Auth::getUser();
        $rs = DB::query("SELECT email FROM `user` WHERE registrated > 0 AND id = ".User::getKey());
        $isRegistrated = count($rs) > 0;
        $isResetConfirmation = $isRegistrated && $rs[0]['email'] != $data['email'];
        DB::update("UPDATE `user` SET `avatar` = :avatar, `email` = :email, `dob` = :dob, `name` = :name, `phone` = :phone, ".($isRegistrated ? '' : 'registrated = NOW(),').($isResetConfirmation ? 'is_confirmed = 0,' : '')." `gender` = :gender WHERE id = ".User::getKey(), array(
            ':email'=>$data['email'],
            ':dob'=>$data['dob'],
            ':name' => $data['name'],
            ':phone' => $data['phone'],
            ':gender'=>$data['gender'],
            ':avatar'=>isset($userData['photo']) ? $userData['photo'] : NULL)
        );
        Cache::remove('userdata.'.User::getKey());
        Cache::remove('isreg.'.User::getKey());
        return true;
    }        
    static public function hasPermissionPrice(){
        $rs = DB::query("SELECT COUNT(*) cc FROM `user` WHERE id = ".User::getKey()." AND price_access = 1;");
        return $rs[0]['cc'] > 0;
    }
    static public function login($cookie, $uri, $data){
        if(!$uri) return false;
        $expire = time() + SESSION_TIME;
        setcookie(SESSION_COOKIE, $cookie, $expire, APP_ROOT_URL."/");
        $dataJSON = str_replace("'","",json_encode($data));
        $rs = DB::query("SELECT id FROM user WHERE uri = :uri", array(':uri'=>$uri));
        if(count($rs)) {
            $id = $rs[0]['id'];
            DB::query("UPDATE user SET data= :data WHERE uri= :uri", array(':uri'=>$uri, ':data' => $dataJSON));
        } else {
            $ref = $_COOKIE[SESSION_COOKIE.'_ref'];
            $refId = 0;
            if($ref){
                $ref = explode('.', $ref);
                $rs = DB::query("SELECT id FROM `user` WHERE ref_key = :refKey", array(":refKey" => $ref[0]));
                
                if(count($rs)){
                    $refId = $rs[0]['id'];
                }
            }
        
            $refKey = uniqid();
            DB::query("INSERT INTO user (uri, data, ref_key, ref_id, partner_ref, partner_subref) VALUES (:uri, :data, '$refKey', $refId, :partnerRef, :partnerSubref)", array(':uri'=>$uri,':data'=>$dataJSON, ':partnerRef'=>$_COOKIE['partner'], ':partnerSubref'=>$_COOKIE['subref']));
            $id = DB::lastInsertId();           
            
        }
        if(!$id) return false;
        
        DB::query("DELETE FROM session WHERE expire < ".time());
        DB::query("INSERT INTO session (`key`, expire, user_id) VALUES (:cookie, $expire, $id)", array(':cookie'=>$cookie));
        
        return $id;
    }
    static public function logout(){
        if(!User::isAuth()) return true;
        
        setcookie(SESSION_COOKIE, "", -1, APP_ROOT_URL."/");

        return true;
    }   
    static public function isAuth(){
        return !!self::userId;
    }
    static public function getKey(){
        return self::$userKey;
    }
    static public function init(){
        if(is_null(self::$userId)){
            if(!isset($_COOKIE[SESSION_COOKIE])){
                self::$userId = 0;
            } else {
                $userId = Cache::get("user_".$_COOKIE[SESSION_COOKIE]);
                if(!$userId){
                    $rs = DB::query("SELECT user_id, expire FROM session WHERE `key` = :key AND expire > ".time(), array(':key'=>$_COOKIE[SESSION_COOKIE]));
                    $userId = count($rs) ? $rs[0]['id'] : false;
                    Cache::set("user_".$_COOKIE[SESSION_COOKIE], $userId, $rs[0]['expire']);
                } 
                self::$userId = $userId;             
            }
        }
        self::$userKey = self::$userId ? self::$userId : (isset($_COOKIE[SESSION_COOKIE.'_stmuid']) ? $_COOKIE[SESSION_COOKIE.'_stmuid'] : NULL);
        if(!self::$userKey) {
            self::$userKey = uniqid();
            setcookie(SESSION_COOKIE.'_stmuid', self::$userKey, 0, APP_ROOT_URL."/");
        }
    } 
}

User::init();
