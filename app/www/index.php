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
    <div stmwc-sale></div>
    <div stmwc-userinfo></div>
    <div stmwc-layout-sidebar>
        <content>
            <div ng-if="requireMnogoCard" class="b-reqmnogo">
                <span class="b-reqmnogo--msg">Пожалуйста, <span ng-click="sendMnogo()" class="a-pseudo">укажите номер своей карты Много.ру</span></span>
                <a href="http://www.mnogo.ru/anketa.html?range=879" target="_blank" class="b-reqmnogo--getcard">Получить карту бесплатно</a>
            </div>
            <div stmwc-bets></div>
        </content>
        <sidebar>
            <div stmwc-promo-sportexpress></div>
        </sidebar>
    </div>
    <div stmwc-preload></div>
    <div class="footer">
        <div class="footer__copyrigth">
            © <a href="/" class="footer__copyrigth-link">Сотмаркет</a> 2005–2014 <span class="footer__copyrigth-separator">|</span> <a href="agreement.pdf" class="footer__copyrigth-link footer__copyrigth-link--out" target="_blank">Полные правила акции</a>
        </div>

    </div>
</body>
</html>