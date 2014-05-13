<?php 

require_once __DIR__.'/../config.php';

class Cache {
    private static $cache = null;
    static public function getInstance(){
        if(is_null(self::$cache)){
            $cache = new Memcache();
            if($cache->connect(CACHE_HOST, CACHE_PORT)){
                self::$cache = $cache;
            } else {
                self::$cache = false;
            }
        }
        return self::$cache;
    }
    static public function get($key){
        $cache = self::getInstance();
        if(!$cache) return false;
        $value = $cache->get(CACHE_KEY_PREFIX.$key);
        if(is_array($value) && count($value) == 0) return false;
        return $value;
    }
    static public function set($key, $value, $expire = 0){
        $cache = self::getInstance();
        if(!$cache) return;
        $cache->set(CACHE_KEY_PREFIX.$key, $value,  0, $expire);   
    }
    static public function remove($key){
        $cache = self::getInstance();
        if(!$cache) return;
        $cache->delete(CACHE_KEY_PREFIX.$key);
    }    
    static public function increment($key){
        $cache = self::getInstance();
        if(!$cache) return false;    
        return $cache->increment(CACHE_KEY_PREFIX.$key);
    }  
    static public function clear(){
        $cache = self::getInstance();
        if(!$cache) return;
        $allSlabs = $cache->getExtendedStats('slabs');
        $items = $cache->getExtendedStats('items');
        foreach($allSlabs as $server => $slabs) {
            foreach($slabs AS $slabId => $slabMeta) {
                $cdump = $cache->getExtendedStats('cachedump',(int)$slabId);
                foreach($cdump AS $keys => $arrVal) {
                    if (!is_array($arrVal)) continue;
                    foreach($arrVal AS $k => $v) {                  
                        if(strpos($k, CACHE_KEY_PREFIX) === 0){
                            $cache->delete($k);
                        }
                    }
                }
            }
        }   
    }  
}
