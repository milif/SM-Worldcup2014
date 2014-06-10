<?php

require_once __DIR__.'/../config.php';
require_once __DIR__.'/Share.class.php';
require_once __DIR__.'/User.class.php';

if(!isset($GAME_DATA)) $GAME_DATA = array();
if(!isset($SHARE_URI)) $SHARE_URI = '/';

if(isset($_GET['email'])){
    setcookie(SESSION_COOKIE.'_email', $_GET['email'], time() + 604800, APP_ROOT_URL."/");
}

$API = array_merge(array(
    "api/share.php" => Share::get($SHARE_URI)
), isset($API) ? $API : array());

$ENV = array_merge(array(
    'auth' => User::getData(),
    'api' => $API,
    'isProduction' => IS_PRODUCTION
), isset($ENV) ? $ENV : array());
if(User::isRegistrated() && !User::isConfirmation()){
    $ENV['requireConfirm'] = true;
}
if(IS_PRODUCTION){
    $ENV['gtm'] = array(
        'id'=> GTM_ID,
        'data' => array(array_merge( array(
             'pageType' => 'Promo'            
        ), isset($GTM_DATA) ? $GTM_DATA : array()))
    );
}
echo '<script type="text/javascript">angular.module("stmwc").value("$stmwcEnv", JSON.parse(\''.str_replace('\"','\\\"',str_replace('\n','',json_encode($ENV))).'\'))</script>';
