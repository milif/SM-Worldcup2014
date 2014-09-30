<?php
    define('NO_DB', true);
    require_once __DIR__.'/../../lib/init.php';

    ob_start();
    require __DIR__.'/../../tpl/head.php';
    $head = ob_get_contents();
    ob_end_clean();
    
?><!doctype html>
<html ng-app="stmwcClose" lang="ru">
<head>
  <meta charset="utf-8">
  <title>Чемпионат мира по футболу 2014 от Сотмаркет</title>
  <base href="<?php echo APP_ROOT_URL.'/'; ?>" />
  <!-- @include stmwcClose -->
  <?php echo $head;?>
</head>
<body ng-controller="close" class="l-body">
    
    <!-- l-page -->
    <div class="l-page-splash" page style="display: none;">

        <div class="l-page-splash__h">
            <div class="splash">
                <a class="splash__sotmarket" href="/">Sotmarket.ru</a>
                <div class="splash__title"></div>
                <!--
                <div class="splash__text">
                    <p>Сочные игры это атомистика, по определению, индуктивно подчеркивает знак, ломая рамки привычных представлений. Гегельянство индуцирует данный дедуктивный метод, хотя в официозе принято обратное.</p>
                    <p>Гетерономная этика ментально дискредитирует язык образов, открывая новые горизонты. Вещь в себе трансформирует интеллигибельный катарсис, tertium nоn datur. Заблуждение, как принято считать, трогательно наивно.</p>
                </div>
                -->
                <div class="splash__envelop">
                    <div class="splash__envelop-h">
                        <div ng-if="state == 'send'" class="splash__envelop-subscribe">
                            <div class="splash__envelop-mail"></div>
                            <div class="splash__envelop-note">Хотите знать обо всех проектах Сотмаркета?</div>
                            <div class="splash__envelop-title">Подпишитесь, и узнаете первыми</div>

                            <form name="model.form" ng-submit="submit()" class="splash__envelop-form g-form" novalidate>
                                <div class="splash__envelop-form-row">
                                    <div class="splash__envelop-form-bl">
                                        <input name="email" placeholder="Электронная почта" ng-model="model.email" required type="email" class="splash__envelop-form-input" />
                                        <button type="submit" ng-class="isSend ? 'state_loading' : ''" class="splash__envelop-form-button">подписаться</button>
                                        <span ng-if="error" class="form-error">{{error}}</span>
                                    </div>
                                </div>
                            </form>
                        </div>
                        <div ng-if="state == 'sended'" class="splash__envelop-subscribe">
                            <div class="splash__envelop-access"></div>
                            <div class="splash__envelop-note">Спасибо!</div>
                            <div class="splash__envelop-title">Вы успешно подписаны</div>
                        </div>
                    </div>
                </div>

                <div class="splash__copyright">© Сотмаркет 2005–<?=date('Y')?></div>

            </div>
        </div>

    </div>
    <!-- // l-page -->
    <div stmwc-preload></div>
</body>
</html>