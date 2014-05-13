<?php

require_once __DIR__.'/DB.class.php';
require_once __DIR__.'/User.class.php';

class Log {
    static public function add($type, $data){
        DB::update("INSERT INTO `log` (user_id, `type`, `data`, `url`, http_data) VALUES ('".User::getKey()."', '".$type."', :data, :url, :http_data);", array(
            ':data' => is_array($data) ? json_encode($data) : $data,
            ':url' => $_SERVER['REQUEST_URI'],
            ':http_data' => json_encode($_SERVER)
        ));
    }
}
