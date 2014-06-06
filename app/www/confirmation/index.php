<?php
    require __DIR__.'/../../lib/User.class.php';
    $confirm = User::confirmEmail($_GET['i'], $_GET['h']);
    
    header("Location: ".APP_ROOT_URL."/#!c:".($confirm === true ? 0 : $confirm));

