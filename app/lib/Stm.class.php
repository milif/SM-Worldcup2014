<?php

class Stm {
    const API_URL = 'http://www.sotmarket.ru/ajx/userInfo.php';
    const API_KEY = '60a8C9957E201E45C2e7270D1F7e4AE3DC2b4D0f';
    static public function auth(){
        if($_GET['stm'] == "1") {
            return isset($_COOKIE['sotmarketid']) ? self::__userData(
                self::__post(array(
                    'cookie' => $_COOKIE['sotmarketid']
                ))
            ) : false;
            
        } else if($_GET['stm'] == "2"){
            $dataJson = file_get_contents("php://input");
            $data = json_decode($dataJson, true);
            return self::__userData(
                self::__post(array(
                    'login' => $data['login'],
                    'password' => $data['password']
                ))
            );
        } 
    }
    static private function __userData($data){
        if($data['errcode'] !== 0) return false;
        $data = $data['result'];
        return array(
            'data' => array(
                'uri' => "stm:".$data['id'],
                'email' => $data['email'],
                'avatar' => NULL,
                'dob' => isset($data['birthday']) && $data['birthday'] ? $data['birthday'] : NULL,
                'name' => $data['full_name'],
                'gender' => NULL
            ),
            'redirect' => APP_ROOT_URL."/"
        );
    }
    static private function __post($params){
        $params['api_key'] = self::API_KEY;
        $options = array(
            'http' => array(
                'header'  => "Content-type: application/x-www-form-urlencoded\r\n",
                'method'  => 'POST',
                'content' => http_build_query($params),
            ),
        );
        $context  = stream_context_create($options);
        Log::add("openid.stm.request", json_encode($options));
        $resp = file_get_contents(self::API_URL, false, $context);
        Log::add("openid.stm.response", $resp);
        $jsonData = json_decode($resp, true);
        return $jsonData;
    }
}
