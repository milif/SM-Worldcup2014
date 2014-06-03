 <link rel="shortcut icon" href="favicon.ico"/> 
 <meta name="viewport" content="width=1024"/>
 <!-- Blackberry and etc. -->
 <meta http-equiv="cleartype" content="on"/>
 <!--[if IE]>
 <meta http-equiv="imagetoolbar" content="no"/>
 <meta http-equiv="MSThemeCompatible" content="no"/>
 <![endif]-->
 <meta name="viewport" content="width=1024">
 <meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1">
 <meta name="SKYPE_TOOLBAR" content="SKYPE_TOOLBAR_PARSER_COMPATIBLE">
 <meta property="og:title" content="ЧМ по футболу 2014 от Сотмаркет"/>
 <meta property="og:description" content="Ставлю на победу в Чемпионате Мира. Присоединяйся к игре!"/> 
 <?php require_once __DIR__.'/../lib/env.php'; ?>
 <meta property="og:image" content="http://<?php echo $_SERVER["HTTP_HOST"].APP_ROOT_URL.$SHARE_URI; ?>share2.png"/>
 <meta property="og:url" content="http://<?php echo $_SERVER["HTTP_HOST"].APP_ROOT_URL.$SHARE_URI; ?>"/> <?php 
 try{
     if(IS_PRODUCTION) include_once __DIR__.'/../partner.php';
 } catch(Exception $e){};
?>