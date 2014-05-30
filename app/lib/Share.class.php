<?php

require_once __DIR__.'/DB.class.php';
require_once __DIR__.'/Cache.class.php';
require_once __DIR__.'/User.class.php';

class Share {
    static $TYPES = ['vk', 'fb', 'ok', 'gp', 'tw'];
    static public function get($uri){
        $counters = array();
        foreach(self::$TYPES as $type){
            $counters[$type] = self::getCounter($uri, $type);
        }
        return $counters;
    }
    static public function getCounter($uri, $type){
        $counter = Cache::get('share.'.$type.".".$uri);
        if($counter !== false) return (int)$counter;
        
        $rs = DB::query("SELECT COUNT(*) as count FROM share_log WHERE type = :type AND uri = :uri", array(':type' => $type, ':uri' => $uri));
        $count = $rs[0]['count'];
        Cache::set('share.'.$type.".".$uri, $count, 1200);
        return (int)$count;
    }
    static public function add($uri, $type){
        $uid = User::getKey();
        $rs = DB::query("SELECT COUNT(*) as count FROM share_log WHERE type = :type AND uid = :uid AND uri = :uri", array(':type'=>$type, ':uid'=>$uid, ':uri'=>$uri));
       
        if($rs[0]['count'] > 0) return false;
        
        $count = Cache::increment('share.'.$type.".".$uri);
        if($count === false){
            $count = self::getCounter($uri, $type) + 1;
            Cache::increment('share.'.$type.".".$uri);
        }
        
        DB::query("INSERT INTO share_log (uid, type, ip, uri) VALUES (:uid, :type, :ip, :uri);", array(':uid'=>$uid, ':type'=>$type, ':ip'=>$_SERVER['REMOTE_ADDR'], ':uri'=> $uri));
        return true;
    }
}
