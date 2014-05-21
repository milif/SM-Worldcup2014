<?php

class Stm {
    const API_URL = 'http://www.sotmarket.ru/ajx/userInfo.php';
    static public function auth(){
        if($_GET['stm'] == "1") {
            return self::__userData(
                self::__post(self::API_URL, array(
                    'cookie' => $_COOKIE['sotmarketid']
                ))
            );
            
        } else if($_GET['stm'] == "2"){
            return self::__userData(
                self::__post(self::API_URL, array(
                    'login' => $_POST['login'],
                    'password' => $_POST['password']
                ))
            );
        } 
    }
    static private function __userData($data){
        if($data['errcode'] !== 0) return false;
        return array(
            'uri' => "stm:".$data['id'],
            'email' => $data['email'],
            'avatar' => NULL,
            'dob' => isset($data['birthday']) && $data['birthday'] ? $data['birthday'] : NULL,
            'name' => $data['full_name'],
            'gender' => NULL
        );
    }
    static private function __post($url, $params){
        $options = array(
            'http' => array(
                'header'  => "Content-type: application/x-www-form-urlencoded\r\n",
                'method'  => 'POST',
                'content' => http_build_query($params),
            ),
        );
        $context  = stream_context_create($options);
        $jsonData = json_decode(file_get_contents($url, false, $context), true);
        return $jsonData;
    }
}
