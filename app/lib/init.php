<?php

require_once __DIR__.'/../config.php';

if(isset($_GET['r'])){
    setcookie(SESSION_COOKIE.'_ref', $_GET['r'].'.'.basename(dirname($_SERVER['REQUEST_URI'])), 0, APP_ROOT_URL.'/api/');
    header("Location: ".strtok($_SERVER["REQUEST_URI"],'?'));
    exit;
}
if(!IS_PRODUCTION){
    if(isset($_GET['delete_user'])){
        require_once __DIR__.'/DB.class.php';
        require_once __DIR__.'/Auth.class.php';
        require_once __DIR__.'/Cache.class.php';
        DB::query("
            DELETE FROM `user` WHERE id = ".CLIENT_ID.";
            DELETE FROM `session` WHERE user_id = ".CLIENT_ID.";
        ");
        Cache::remove("user_".$_COOKIE[SESSION_COOKIE]);
        header("Location: ".strtok($_SERVER["REQUEST_URI"],'?'));
        exit;
    }
    if(isset($_GET['clear_memcache'])){
        require_once __DIR__.'/Cache.class.php';
        Cache::clear();
    }
}

ob_start();
require __DIR__.'/../tpl/head.php';
$head = ob_get_contents();
ob_end_clean();
