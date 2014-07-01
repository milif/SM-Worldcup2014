<?php

    require_once __DIR__.'/../lib/init.php';

    require_once __DIR__.'/../lib/User.class.php';
    require_once __DIR__.'/../lib/Bets.class.php';

    $usershare = null;

    if(isset($_GET['share'])){
        $rs = DB::query("SELECT id, `uri`, `score`, `avatar`, `name`, `ref_key` FROM user WHERE ref_key = :key;", array(
            ':key' => $_GET['r']
        ));
        if(count($rs) && md5($rs[0]['uri']) == $_GET['share']) {
            $userId = $rs[0]['id'];
            $usershare = array(
                'name' => $rs[0]['name'], 
                'score' => (int)$rs[0]['score'],
                'avatar' => $rs[0]['avatar'],
                'place' => array(
                    'user' => User::getPlace($userId),
                    'total' => User::getTotal()
                ),
                'bets' => Bets::getUserResults($userId),
                'refKey' => $rs[0]['ref_key'],
                
            );
        } else {
            header("Location: ".strtok($_SERVER["REQUEST_URI"],'?'));
            exit;
        }
    }

    $ENV = array(
        'requireAuth' => isset($_COOKIE[SESSION_COOKIE.'_authorization']),
        'bets' => array(
            'bets' => Bets::get(),
            'canBet' => Bets::canBet(),
            'score' => User::getScore()
        ),
        'place' => array(
            'user' => User::getPlace(),
            'total' => User::getTotal()
        )
    );
    
    if(isset($_GET['code'])){
        require_once __DIR__.'/../lib/Code.class.php';
        $usecode = Code::usecode($_GET['code'], $score);
        $ENV['code'] = array(
            'errcode' => $usecode,
            'score' => $score
        );
    }
    
    if($usershare){
        $ENV['usershare'] = $usershare;
    }
    


    ob_start();
    require __DIR__.'/../tpl/head.php';
    $head = ob_get_contents();
    ob_end_clean();
    
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
            <div stmwc-news type="sportexpress"></div>
            <div stmwc-news type="mailru"></div>
        </sidebar>
    </div>
    <div stmwc-preload></div>
    <div class="footer">
        <div class="footer__copyrigth">
            © <a href="/" class="footer__copyrigth-link">Сотмаркет</a> 2005–2014<a href="agreement.pdf" class="footer__copyrigth-link footer__copyrigth-link--out" target="_blank">Полные правила акции</a>
        </div>

    </div>
    <div stmwc-paypal></div>
    <div ng-if="betsShared" stmwc-bets-shared="betsShared"></div>
    <div ng-if="code" stmwc-popup-code="code"></div>
    <div ng-if="showTop20" stmwc-popup-top></div>
</body>
</html>