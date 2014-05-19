<?php

header('Content-Type: application/json');

$dataJson = file_get_contents("php://input");
$data = json_decode($dataJson, true);

require_once __DIR__.'/../../config.php';
if(!isset($_COOKIE[SESSION_COOKIE]) && isset($data['session'])) $_COOKIE[SESSION_COOKIE] = $data['session'];

require_once __DIR__.'/../../lib/User.class.php';

$res = false;
if(isset($_GET['logout']) && $_GET['logout']){
    $res = User::logout();
} else if($data['action'] == 'get'){
    $res = User::getData();
} else if($data['action'] == 'reg'){
    $data['data']['dob'] = $data['data']['dob'] ? substr($data['data']['dob'], 4).'-'.substr($data['data']['dob'], 2, 2).'-'.substr($data['data']['dob'], 0, 2) : NULL;
    $res = User::save($data['data']);
} else if ($data['action'] == 'confirmEmail'){
    if(isset($data['email'])) {
        User::save(array(
            'email' => $data['email']
        ));
    }
    if(isset($data['send'])) {
        DB::update("UPDATE `user` SET `confirmation_mail_sent` = NULL WHERE id = ".User::getKey());
    }

    $res = array('success' => true);
    
}

echo json_encode($res);