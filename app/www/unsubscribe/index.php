<?php
    require __DIR__.'/../../lib/User.class.php';
    $unsubscribe = User::unsubscribe($_GET['i'], $_GET['h']);
    
    header("Location: ".APP_ROOT_URL."/#!us:".($unsubscribe === true ? 0 : $unsubscribe).":".User::getEmailByKey($_GET['i']);
