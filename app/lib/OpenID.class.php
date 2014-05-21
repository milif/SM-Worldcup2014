<?php
require_once __DIR__.'/../config.php';
require_once __DIR__.'/DB.class.php';

class OpenID {
    
    const TW_API_KEY = '9DxDnMuLoKoh9om3IjVFV3B6E';
    const TW_API_SECRET = '3pbuuHPfTcfAtmeQmtw2f3cby1ApPRMq3yeKMs7urZfXTdJJIB';
    
    const VK_CLIENT_ID = '4362789';
    const VK_CLIENT_SECRET = 'IFjuD00MgzBAPCfqgVmt';
    
    const FB_CLIENT_ID = '1466129586957898';
    const FB_CLIENT_SECRET = '98ce22461a13466299072044fa86d4a6';
    
    const G_CLIENT_ID = '261707923682-3e83krp7lmhhqpo8rpmk455geoptp2tg.apps.googleusercontent.com';
    const G_CLIENT_SECRET = 'GYadKmx6VdrapCMQA7exMAa9';
    
    static public function auth(){
        $state = explode('::',$_GET['state']);
        if($state[0] == 'vk') $data = self::__authVK();
        else if($state[0] == 'fb') $data = self::__authFB();
        else if($state[0] == 'g') $data = self::__authG();
        else if($state[0] == 'tw') $data = self::__authTW();
        return $data ? array(
            'data' => $data,
            'redirect' => $state[1]
        ) : false;
    }
    static private function __authVK(){
        $url = 'https://oauth.vk.com/access_token?client_id='.self::VK_CLIENT_ID.'&client_secret='.self::VK_CLIENT_SECRET.'&code='.$_GET['code'].'&redirect_uri='.urlencode(self::getRedirectUrl());
        $dataCode =  json_decode(file_get_contents($url), true);
        if(!isset($dataCode['access_token'])) return false;
        $url = "https://api.vk.com/method/users.get?fields=sex,bdate,photo_100,domain&v=5.21&access_token={$dataCode['access_token']}&user_id={$dataCode['user_id']}";
        $dataUser =  json_decode(file_get_contents($url), true);
        if(!isset($dataUser['response'])) return false;
        $dataUser = $dataUser['response']['0'];
        $dob = $dataUser['bdate'] ? explode('.',$dataUser['bdate']) : NULL;
        return array(
            'uri' => "http://vk.com/{$dataUser['domain']}",
            'email' => $dataCode['email'] ? $dataCode['email'] : NULL,
            'avatar' => $dataUser['photo_100'] ? $dataUser['photo_100'] : NULL,
            'dob' => $dob ? $dob[2].'-'.$dob[1].'-'.$dob[0] : NULL,
            'name' => $dataUser['first_name'].' '.$dataUser['last_name'],
            'gender' => $dataUser['sex'] == 2 ? 'm' : ($dataUser['sex'] == 1 ? 'f' : NULL)
        );
    }
    static private function getRedirectUrl(){
        return 'http://'.$_SERVER['HTTP_HOST'].APP_ROOT_URL.'/api/openid.php';
    }
    static private function __authFB(){
        $url ='https://graph.facebook.com/oauth/access_token?client_secret='.self::FB_CLIENT_SECRET.'&code='.$_GET['code'].'&client_id='.self::FB_CLIENT_ID.'&redirect_uri='.urlencode(self::getRedirectUrl());
        
        $data = file_get_contents($url);
        preg_match('/access_token=([^&]+)/', $data, $accessToken);      
        if(!$accessToken) return false;

        $url = "https://graph.facebook.com/me?fields=link,email,birthday,name,gender,picture.type(square),picture.width(62),picture.height(62)&access_token=&access_token=".$accessToken[1];
        $dataUser =  json_decode(file_get_contents($url), true);

        if(!isset($dataUser['link'])) return false;
        
        $dob = $dataUser['birthday'] ? explode('/',$dataUser['birthday']) : NULL;
        $data = array(
            'uri' => $dataUser['link'],
            'email' => $dataUser['email'] ? $dataUser['email'] : NULL,
            'avatar' => isset($dataUser['picture']) && isset($dataUser['picture']['data']['url']) ? $dataUser['picture']['data']['url'] : NULL,
            'dob' => $dob ? $dob[2].'-'.$dob[0].'-'.$dob[1] : NULL,
            'name' => $dataUser['name'],
            'gender' => $dataUser['gender'] == 'male' ? 'm' : ($dataUser['gender'] == 'female' ? 'f' : NULL)
        );
        return $data;
    }
    static private function __authG(){
        $params = array(
            'code' => $_GET['code'],
            'client_id' => self::G_CLIENT_ID,
            'client_secret' => self::G_CLIENT_SECRET,
            'redirect_uri' => self::getRedirectUrl(),
            'grant_type' => 'authorization_code'
        );
        $options = array(
            'http' => array(
                'header'  => "Content-type: application/x-www-form-urlencoded\r\n",
                'method'  => 'POST',
                'content' => http_build_query($params),
            ),
        );
        $context  = stream_context_create($options);
        $accessData = json_decode(file_get_contents('https://accounts.google.com/o/oauth2/token', false, $context), true);
        if(!is_array($accessData) || !isset($accessData['access_token'])) return false;
        $userData = json_decode(file_get_contents('https://www.googleapis.com/plus/v1/people/me?access_token='.$accessData['access_token']), true);
        if(!is_array($userData) || !isset($userData['url'])) return false;

        $data = array(
            'uri' => $userData['url'],
            'email' => is_array($userData['emails']) && count($userData['emails']) ? $userData['emails'][0]['value'] : NULL,
            'avatar' => isset($userData['image']) ? str_replace('sz=50', 'sz=100', $userData['image']['url']) : NULL,
            'dob' => isset($userData['birthday']) ? $userData['birthday'] : NULL,
            'name' => $userData['displayName'],
            'gender' => $userData['gender'] == 'male' ? 'm' : ($userData['gender'] == 'female' ? 'f' : NULL)
        );

        return $data;
    }
    public static function __authTW(){
        require_once __DIR__.'/twitteroauth/twitteroauth.php';
        $rs = DB::query("SELECT secret FROM openid_tw WHERE token = :token", array(
            ':token' => $_GET['oauth_token']
        ));
        if(!count($rs)) return false;
        $connection = new TwitterOAuth(self::TW_API_KEY, self::TW_API_SECRET, $_GET['oauth_token'], $rs[0]['secret']);
        $token_credentials = $connection->getAccessToken($_GET['oauth_verifier']);
        $connection = new TwitterOAuth(self::TW_API_KEY, self::TW_API_SECRET, $token_credentials['oauth_token'],
        $token_credentials['oauth_token_secret']);
        $userData = $connection->get('account/verify_credentials');
        if(!is_object($userData)) return false;
        $data = array(
            'uri' => 'https://twitter.com/'.$userData->screen_name,
            'name' => $userData->name,
            'email' => NULL,
            'avatar' =>  isset($userData->profile_image_url) ? str_replace('normal', 'bigger', $userData->profile_image_url) : NULL,
            'dob' => NULL,
            'gender' => NULL
        );
        return $data;
    }
    public static function getTWUrl($state){
        require_once __DIR__.'/twitteroauth/twitteroauth.php';
        $connection = new TwitterOAuth(self::TW_API_KEY, self::TW_API_SECRET);
        $temporary_credentials = $connection->getRequestToken(
            self::getRedirectUrl()."?state=".urlencode($state)
        );
        if(!$temporary_credentials['oauth_callback_confirmed']) {
            header('HTTP/1.1 500 Internal Server Error'); exit;
        }
        DB::update("DELETE FROM openid_tw WHERE expire < ".time());
        DB::update("INSERT INTO openid_tw (token, secret, expire) VALUES (:token, :secret, :expire)", array(
            ':token' => $temporary_credentials['oauth_token'],
            ':secret' => $temporary_credentials['oauth_token_secret'],
            ':expire' => time() + 3600
        ));
        return $connection->getAuthorizeURL($temporary_credentials);
    }
}