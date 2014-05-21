<?php

class Stm {
    const API_URL = 'http://www.sotmarket.ru';
    static public function auth(){
        if($_GET['stm'] == "1") {
            self::__post(self::API_URL, array(''));
        }
    }
    static public function __post($url, $params){
        $options = array(
            'http' => array(
                'header'  => "Content-type: application/x-www-form-urlencoded\r\n",
                'method'  => 'POST',
                'content' => http_build_query($params),
            ),
        );
        $context  = stream_context_create($options);
        $accessData = json_decode(file_get_contents($url, false, $context), true);
    }
}
