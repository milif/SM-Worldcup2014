<?php

require_once __DIR__.'/../../lib/OpenID.class.php';
require_once __DIR__.'/../../lib/User.class.php';

if(isset($_GET['stm'])){
    header('Content-Type: application/json');
    $loginData = User::login(Stm::auth());
    echo json_encode(array(
        'success' => !!$loginData,
        'redirect' => $loginData ? $loginData['redirect'] : null
    ));
} else if(isset($_GET['twurl'])){
    header('Content-Type: application/json');
    echo OpenID::getTWUrl($_GET['twurl']);
} else {
    $loginData = User::login(OpenID::auth());
    header('Location: '.$loginData['redirect']);
}
