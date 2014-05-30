<?php
    require_once __DIR__.'/../lib/User.class.php';
    require_once __DIR__.'/../lib/Bets.class.php';

    $ENV = array(
        'requireAuth' => isset($_COOKIE[SESSION_COOKIE.'_authorization']),
        'bets' => array(
            'bets' => Bets::get(),
            'canBet' => Bets::canBet()
        ),
        'place' => array(
            'user' => User::getPlace(),
            'total' => User::getTotal()
        )
    );

    require_once __DIR__.'/../lib/init.php';
?><!doctype html>
<html ng-app="stmwc" lang="ru">
<head>
  <meta charset="utf-8">
  <title>Чемпионат мира по футболу 2014 от Сотмаркет</title>
  <base href="<?php echo APP_ROOT_URL.'/'; ?>" />
  <!-- @include stmwcIndex -->
  <?php echo $head;?>
</head>
<body stmwc-layout-page>
    <div stmwc-toolbar></div>
    <div stmwc-userinfo></div>
    <div stmwc-layout-sidebar>
        <content>
            <div stmwc-bets></div>
        </content>
        <sidebar>
            <div stmwc-promo-sportexpress></div>
        </sidebar>
    </div>
    <div stmwc-preload></div>
</body>
</html>