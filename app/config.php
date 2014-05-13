<?php

define('CACHE_HOST', 'localhost');
define('CACHE_PORT', 11211); // 0 for Unix socket
define('CACHE_KEY_PREFIX', 'WC2014_');

define('DB_HOST', 'localhost');
define('DB_USER', 'WC2014');
define('DB_PASSWORD', 'WC2014');
define('DB_NAME', 'WC2014');

define('SESSION_TIME',  86400 * 7);
define('SESSION_COOKIE', 'WC2014');

define("GTM_ID", 'GTM-TMZ66K');

define('IS_PRODUCTION', is_file(__DIR__.'/.production'));
define('APP_ROOT_URL', str_replace($_SERVER['DOCUMENT_ROOT'], '', __DIR__.'/www'));
