<?php
/**
* нужны таблицы
* sprav_status_list
* affiliate_affiliate
*
**/
//ini_set('display_errors', 'on');
//ini_set('display_startup_errors', 'on');

defined('START_TRACK_DATE')  OR define('START_TRACK_DATE' , 1373914800);// '2013-07-15 22:00:00');
$db=mysql_connect(DB_HOST,DB_USER,DB_PASSWORD);
if(is_resource($db))
{
    mysql_select_db('default_sm', $db);
}


//start of partner_aliass.php
$memcache_host='unix:///run/memcached.sock';
$memcache          = new Memcache;
$bConnected = @$memcache->connect( $memcache_host, 0);
if (!$bConnected){
    $memcache = FALSE;
}

if (!isset($_GET['ref'])) $_GET['ref'] = 0;
if (isset($_GET['admitad']) && $_GET['admitad'] != '') {

    if (isset($_GET['clicknd']) && $_GET['clicknd'] == 1) {
        $_GET['ref'] = 55887;
        unset($_GET['clicknd']);
    }
    elseif (isset($_GET['retarget']) && $_GET['retarget'] == 1) {
        $_GET['ref'] = 57105;
        unset($_GET['retarget']);
    }
    elseif (isset($_GET['landing']) && $_GET['landing'] == 1) {
        $_GET['ref'] = 57135;
        unset($_GET['landing']);
    }
    elseif (isset($_GET['media']) && $_GET['media'] == 1) {
        $_GET['ref'] = 57143;
        unset($_GET['media']);
    }
    elseif (isset($_GET['context']) && $_GET['context'] == 1) {
        $_GET['ref'] = 57141;
        unset($_GET['context']);
    }
    else {
        $_GET['ref'] = 35626;
    }
    $_GET['subref'] = $_GET['admitad'];
    unset($_GET['admitad']);
}
elseif (isset($_GET['apelsin']) && $_GET['apelsin'] != '') {
    $_GET['ref'] = 49421;
    $_GET['subref'] = $_GET['apelsin'];
    unset($_GET['apelsin']);
}
elseif (isset($_GET['cityads']) && $_GET['cityads'] != '') {
    if (isset($_GET['clicknd']) && $_GET['clicknd'] == 1) {
        $_GET['ref'] = 57107;
        unset($_GET['clicknd']);
    }
    elseif (isset($_GET['retarget']) && $_GET['retarget'] == 1) {
        $_GET['ref'] = 57109;
        unset($_GET['retarget']);
    }
    elseif (isset($_GET['media']) && $_GET['media'] == 1) {
        $_GET['ref'] = 57121;
        unset($_GET['media']);
    }
    else {
        $_GET['ref'] = 49377;
    }
    $_GET['subref'] = $_GET['cityads'];
    unset($_GET['cityads']);
}
elseif (isset($_GET['qxplus']) && $_GET['qxplus'] != '') {
    $_GET['ref'] = 49371;
    $_GET['subref'] = $_GET['qxplus'];
    unset($_GET['qxplus']);
}
elseif (isset($_GET['actionads']) && $_GET['actionads'] != '') {
    $_GET['ref'] = 49995;
    $_GET['subref'] = $_GET['actionads'];
    unset($_GET['actionads']);
}
elseif (isset($_GET['ad1']) && $_GET['ad1'] != '') {
    $_GET['ref'] = 49503;
    $_GET['subref'] = $_GET['ad1'];
    unset($_GET['ad1']);
}
elseif (isset($_GET['myragon']) && $_GET['myragon'] != '') {
    $_GET['ref'] = 49389;
    $_GET['subref'] = $_GET['myragon'];
    unset($_GET['myragon']);
}
elseif (isset($_GET['gdeslon']) && $_GET['gdeslon'] != '') {
    $_GET['ref'] = 28527;
    $_GET['subref'] = $_GET['gdeslon'];
    unset($_GET['gdeslon']);
}
elseif (isset($_GET['topadvert']) && $_GET['topadvert'] != '') {
    $_GET['ref'] = 33976;
    $_GET['subref'] = $_GET['topadvert'];
    unset($_GET['topadvert']);
}elseif ($_GET['ref'] == 33976 && isset($_GET['pin'])) {
    $_GET['subref'] = $_GET['pin'];
    unset($_GET['pin']);
}
elseif (isset($_GET['actionpay']) && $_GET['actionpay'] != '') {
    $woCanonical=true;
    if (isset($_GET['clicknd']) && $_GET['clicknd'] == 1) {
        $_GET['ref'] = 55885;
        unset($_GET['clicknd']);
        $promo_available=true;
    }
    elseif (isset($_GET['retarget']) && $_GET['retarget'] == 1) {
        $_GET['ref'] = 57103;
        unset($_GET['retarget']);
        $promo_available=true;
    }
    elseif (isset($_GET['landing']) && $_GET['landing'] == 1) {
        $_GET['ref'] = 57209;
        unset($_GET['landing']);
        $promo_available=true;
    }
    elseif (isset($_GET['media']) && $_GET['media'] == 1) {
        $_GET['ref'] = 57213;
        unset($_GET['media']);
        $promo_available=true;
    }
    else {
        $_GET['ref'] = 49417;
    }
    $_GET['subref'] = $_GET['actionpay'];
    unset($_GET['actionpay']);
}
elseif (isset($_GET['sellis']) && $_GET['sellis'] != '') {
    $_GET['ref'] = 50233;
    $_GET['subref'] = $_GET['sellis'];
    unset($_GET['sellis']);
}
elseif (isset($_GET['ref']) && $_GET['ref'] == 54033) {
    $_GET['subref'] = substr($_GET['utm_source'], 9) . '.content_' . $_GET['utm_content'] . '.campaign_' . substr($_GET['utm_campaign'], 9);
    unset($_GET['utm_source']);
    unset($_GET['utm_medium']);
    unset($_GET['utm_content']);
    unset($_GET['utm_campaign']);
}
elseif (isset($_GET['heymoose']) && $_GET['heymoose'] != '') {
    $_GET['ref'] = 53063;
    $_GET['subref'] = $_GET['heymoose'];
    unset($_GET['heymoose']);
}
elseif (isset($_GET['sellis']) && $_GET['sellis'] != '') {
    $_GET['ref'] = 50233;
    $_GET['subref'] = $_GET['sellis'];
    unset($_GET['sellis']);
}
elseif (isset($_GET['advertstar']) && $_GET['advertstar'] != '') {
    $_GET['ref'] = 54479;
    $_GET['subref'] = $_GET['advertstar'];
    unset($_GET['advertstar']);
}
elseif (isset($_GET['afrek']) && $_GET['afrek'] != '') {
    $_GET['ref'] = 54471;
    $_GET['subref'] = $_GET['afrek'];
    unset($_GET['afrek']);
}
elseif (isset($_GET['cpazy']) && $_GET['cpazy'] != '') {
    $_GET['ref'] = 54475;
    $_GET['subref'] = $_GET['cpazy'];
    unset($_GET['cpazy']);
}
elseif (isset($_GET['motiv8']) && $_GET['motiv8'] != '') {
    $_GET['ref'] = 54467;
    $_GET['subref'] = $_GET['motiv8'];
    unset($_GET['motiv8']);
}
elseif (isset($_GET['clobucks']) && $_GET['clobucks'] != '') {
    $_GET['ref'] = 53509;
    $_GET['subref'] = $_GET['clobucks'];
    unset($_GET['clobucks']);
}
elseif (isset($_GET['advaction']) && $_GET['advaction'] != '') {
    $_GET['ref'] = 54817;
    $_GET['subref'] = $_GET['advaction'];
    unset($_GET['advaction']);
}
elseif (isset($_GET['tradetracker']) && $_GET['tradetracker'] != '') {
    $_GET['ref'] = 54811;
    $_GET['subref'] = $_GET['tradetracker'];
    unset($_GET['tradetracker']);
}
elseif (isset($_GET['mixmarket']) && $_GET['mixmarket'] != '') {
    $_GET['ref'] = 55713;
    $_GET['subref'] = $_GET['mixmarket'];
    unset($_GET['mixmarket']);
}
elseif (isset($_GET['offline']) && $_GET['offline'] != '') {
    $_GET['ref'] = 55711;
    $_GET['subref'] = $_GET['offline'];
    unset($_GET['offline']);
}
elseif (isset($_GET['pay4results']) && $_GET['pay4results'] != '') {
    $_GET['ref'] = 56265;
    $_GET['subref'] = $_GET['pay4results'];
    unset($_GET['pay4results']);
}
elseif (isset($_GET['leadster']) && $_GET['leadster'] != '') {
    $_GET['ref'] = 56261;
    $_GET['subref'] = $_GET['leadster'];
    unset($_GET['leadster']);
}
elseif (isset($_GET['pmgtraffic']) && $_GET['pmgtraffic'] != '') {
    $_GET['ref'] = 56257;
    $_GET['subref'] = $_GET['pmgtraffic'];
    unset($_GET['pmgtraffic']);
}
elseif (isset($_GET['partneo']) && $_GET['partneo'] != '') {
    $_GET['ref'] = 56253;
    $_GET['subref'] = $_GET['partneo'];
    unset($_GET['partneo']);
}  elseif (isset($_GET['directprofit']) && $_GET['directprofit'] != '') {
    $_GET['ref'] = 56229;
    $_GET['subref'] = $_GET['directprofit'];
    unset($_GET['directprofit']);
}
elseif (isset($_GET['cosmoleads']) && $_GET['cosmoleads'] != '') {
    $_GET['ref'] = 56225;
    $_GET['subref'] = $_GET['cosmoleads'];
    unset($_GET['cosmoleads']);
}
elseif (isset($_GET['goodvert']) && $_GET['goodvert'] != '') {
    $_GET['ref'] = 56295;
    $_GET['subref'] = $_GET['goodvert'];
    unset($_GET['goodvert']);
}
elseif (isset($_GET['leadgid']) && $_GET['leadgid'] != '') {
    $_GET['ref'] = 55961;
    $_GET['subref'] = $_GET['leadgid'];
    unset($_GET['leadgid']);
}
elseif (isset($_GET['myads']) && $_GET['myads'] != '') {
    $_GET['ref'] = 56301;
    $_GET['subref'] = $_GET['myads'];
    unset($_GET['myads']);
}
elseif (isset($_GET['leads']) && $_GET['leads'] != '') {
    $_GET['ref'] = 56249;
    $_GET['subref'] = $_GET['leads'];
    unset($_GET['leads']);
}
elseif (isset($_GET['leads3']) && $_GET['leads3'] != '') {
    $_GET['ref'] = 56245;
    $_GET['subref'] = $_GET['leads3'];
    unset($_GET['leads3']);
}
elseif (isset($_GET['tradedoubler']) && $_GET['tradedoubler'] != '') {
    $_GET['ref'] = 56241;
    $_GET['subref'] = $_GET['tradedoubler'];
    unset($_GET['tradedoubler']);
}
elseif (isset($_GET['leadsleader']) && $_GET['leadsleader'] != '') {
    $_GET['ref'] = 56237;
    $_GET['subref'] = $_GET['leadsleader'];
    unset($_GET['leadsleader']);
}
elseif (isset($_GET['tisref']) && $_GET['tisref'] != '') {
    $_GET['ref'] = 56233;
    $_GET['subref'] = $_GET['tisref'];
    unset($_GET['tisref']);
}
elseif (isset($_GET['cpartner']) && $_GET['cpartner'] != '') {
    $_GET['ref'] = 56269;
    $_GET['subref'] = $_GET['cpartner'];
    unset($_GET['cpartner']);
}
elseif (isset($_GET['inetrek']) && $_GET['inetrek'] != '') {
    $_GET['ref'] = 56273;
    $_GET['subref'] = $_GET['inetrek'];
    unset($_GET['inetrek']);
}
elseif (isset($_GET['babki']) && $_GET['babki'] != '') {
    $_GET['ref'] = 56277;
    $_GET['subref'] = $_GET['babki'];
    unset($_GET['babki']);
}
elseif (isset($_GET['himba']) && $_GET['himba'] != '') {
    $_GET['ref'] = 56281;
    $_GET['subref'] = $_GET['himba'];
    unset($_GET['himba']);
}
elseif (isset($_GET['moneytizer']) && $_GET['moneytizer'] != '') {
    $_GET['ref'] = 56285;
    $_GET['subref'] = $_GET['moneytizer'];
    unset($_GET['moneytizer']);
}
 elseif (isset($_GET['unilead']) && $_GET['unilead'] != '') {
    $_GET['ref'] = 54627;
    $_GET['subref'] = $_GET['unilead'];
    unset($_GET['unilead']);
}
elseif (isset($_GET['1lead']) && $_GET['1lead'] != '') {
    $_GET['ref'] = 53009;
    $_GET['subref'] = $_GET['1lead'];
    unset($_GET['1lead']);
}
elseif (isset($_GET['mastertarget']) && $_GET['mastertarget'] != '') {
    $_GET['ref'] = 49483;
    $_GET['subref'] = $_GET['mastertarget'];
    unset($_GET['mastertarget']);
}
elseif (isset($_GET['etargeting']) && $_GET['etargeting'] != '') {
    $_GET['ref'] = 56889;
    $_GET['subref'] = $_GET['etargeting'];
    unset($_GET['etargeting']);
}
elseif (isset($_GET['primelead']) && $_GET['primelead'] != '') {
    $_GET['ref'] = 56941;
    $_GET['subref'] = $_GET['primelead'];
    unset($_GET['primelead']);
}
elseif (isset($_GET['adwad']) && $_GET['adwad'] != '') {
    $_GET['ref'] = 56945;
    $_GET['subref'] = $_GET['adwad'];
    unset($_GET['adwad']);
}
elseif (isset($_GET['lead100']) && $_GET['lead100'] != '') {
    $_GET['ref'] = 52209;
    $_GET['subref'] = $_GET['lead100'];
    unset($_GET['lead100']);
}
elseif (isset($_GET['adpro']) && $_GET['adpro'] != '') {
    $_GET['ref'] = 56999;
    $_GET['subref'] = $_GET['adpro'];
    unset($_GET['adpro']);
}
elseif (isset($_GET['leadtrade']) && $_GET['leadtrade'] != '') {
    $_GET['ref'] = 57003;
    $_GET['subref'] = $_GET['leadtrade'];
    unset($_GET['leadtrade']);
}
elseif (isset($_GET['clickrocket']) && $_GET['clickrocket'] != '') {
    $_GET['ref'] = 57031;
    $_GET['subref'] = $_GET['clickrocket'];
    unset($_GET['clickrocket']);
}
elseif (isset($_GET['cpanetwork']) && $_GET['cpanetwork'] != '') {
    $_GET['ref'] = 57049;
    $_GET['subref'] = $_GET['cpanetwork'];
    unset($_GET['cpanetwork']);
}
elseif (isset($_GET['mobile_topadvert']) && $_GET['mobile_topadvert'] != '') {
    $_GET['ref'] = 57079;
    $_GET['subref'] = $_GET['mobile_topadvert'];
    unset($_GET['mobile_topadvert']);
}
elseif (isset($_GET['notebook_topadvert']) && $_GET['notebook_topadvert'] != '') {
    $_GET['ref'] = 57091;
    $_GET['subref'] = $_GET['notebook_topadvert'];
    unset($_GET['notebook_topadvert']);
}
elseif (isset($_GET['other_topadvert']) && $_GET['other_topadvert'] != '') {
    $_GET['ref'] = 57093;
    $_GET['subref'] = $_GET['other_topadvert'];
    unset($_GET['other_topadvert']);
}

$af_multi = array(55887, 35626, 49421, 49377, 49371, 49995, 49503, 49389, 28527, 33976, 55885, 49417, 50233, 54033, 53063, 50233, 54479, 54475, 50233, 54467, 53509, 54817, 54811, 55713, 55711,
    56285,56281,56277,56273,56269,56265,56261,56257,56253,56249,56245,56241,56237,56233,56229,56225,56295,55961,56301,56945,54627,52209,53009,49483,56889,56941,56999,57003,57031,57049,57103,
    57079,57091,57093,57105,57107,57109,57135,57143,57141);/*
if (in_array($_GET['ref'], $af_multi) && (!isset($_GET['subref']) || $_GET['subref'] == '') && $_SERVER['HTTP_REFERER'] != '' && strpos($_SERVER['HTTP_REFERER'], 'sotmarket.ru') === false) {
     file_put_contents('/log/no_subref.log', print_r(array(date("G:i:s d.m.y"),$_SERVER['HTTP_REFERER'],$_SERVER['REQUEST_URI'],$_SERVER['HTTP_X_REAL_IP']), true), FILE_APPEND);
}*/


function clear_broken_ref_cookies($af_multi)
{
    if(isset($_COOKIE['partner']) && in_array($_COOKIE['partner'],$af_multi) && (!isset($_COOKIE['subref'])|| empty($_COOKIE['subref']))){
        md_setcookie('partner', '', 0, '/', '.sotmarket.ru');
    }
}

clear_broken_ref_cookies($af_multi);

/**
 * @param $add int значение которое добавляем
 * @param $name string имя куки
 * @param bool $allow_repeat возможны ли повторы значений в куке
 * @param bool $last_deffer должно ли отличаться последнее значение чтоб быть записаным
 * @param string $delimiter разделитель
 * @param int $limit сколько оставляем
 */
function update_cookie($add,$name,$allow_repeat=true,$last_deffer=false, $delimiter='_', $limit=9){
    $organic=array();
    if(isset($_COOKIE[$name])){
        $organic=explode($delimiter,$_COOKIE[$name]);
    }
    if($allow_repeat!==true && in_array($add,$organic)){
        return null;
    }
    if($last_deffer===true && !empty($organic) && $organic[0]==$add){
        return null;
    }
    array_unshift($organic,$add);
    $organic=implode($delimiter,array_slice($organic,0,$limit));

    md_setcookie($name,$organic,time()+3600*24*365,'/','.sotmarket.ru');
}

//end of partner_aliass.php

/**
 * @return bool|mixed|string
 * проверяет партнера и записывает нужные куки
 */
function check_ref()
{
    global $don_use_ref;
    static $data='';
    if($data==''){
    $don_use_ref=true;
    $time = 36000;
    if ($_GET['ref'] > 1000000000) {
        memcache_set_info('ref1_' . $_GET['ref'], 'bad',  $time);
        $data = 'bad';
    }
    else
        $data = memcache_get_info('ref1_' . $_GET['ref']);
    if ($data===false) {
        if (validate_affId((int)$_GET['ref'])) {
            memcache_set_info('ref1_' . $_GET['ref'], 'good',  $time);
            $data = 'good';
        }
        else
        {
            memcache_set_info('ref1_' . $_GET['ref'], 'bad',  $time);
            $data = 'bad';
        }
    }
    if ($data == 'bad') {
        $_GET['ref_bad'] = $_GET['ref'];
        unset($_GET['ref']);
        unset($_GET['mag_did']);
    }
    if ($data == "good") {

            $need_ref_link=save_history_new('subref');

          if($need_ref_link=='update'){
              $don_use_ref=false;
            $_GET['mag_did'] = $_GET['ref'];
            $_COOKIE["partner"] = $_GET['ref'];
            $_GET['refid'] = 'ref=' . $_GET['mag_did'];

            if(isset($_GET['subref'])){
                $_GET['refid'].= '&subref=' . $_GET['subref'];
            }
        }
        $_ENV['new_partner']['need_track']=true;
        if(isset($_COOKIE['last_ref']))
        {
            $_ENV['new_partner']['ref']='r='.$_COOKIE['last_ref'];
            if(isset($_COOKIE['last_subref']))
                $_ENV['new_partner']['subref']='s='.urlencode($_COOKIE['last_subref']);
        }

    }
    }
    return $data;
}

function enableNewTrack()
{
    if(!isset($_COOKIE["partner"]) && !isset($_COOKIE['tr'])){
        return;
    }
    $_ENV['track']['need_track']=true;
   if(isset($_COOKIE["partner"]))
    $_ENV['track']['ref']='r='.urlencode($_COOKIE["partner"]);
    if(isset($_GET['subref'])){
        $_ENV['track']['subref']='s='.urlencode($_GET['subref']);
    }
    if(isset($_COOKIE['tr']) && ($_COOKIE['tr']=='o' || $_COOKIE['tr']=='d')){
        $type=$_COOKIE['tr'];
        if($type=='o'){
            $_ENV['track']['ref']='r=0';
        }
        elseif($type=='d'  && (!isset($_GET['refid']) || empty($_GET['refid']))){
            $_ENV['track']['ref']='r=1';
        }
    }
    if(!isset($_COOKIE["rSid"])){
        generateSid();
    }
    $_ENV['track']['sid']='sid='.$_COOKIE["rSid"];
    $_ENV['track']['url']='u2='.urlencode($_SERVER['REQUEST_URI']);
    $host=$_SERVER['SERVER_NAME'];
    $len=strlen($host);
    if($host!=substr($_SERVER['HTTP_REFERER'],7,$len) && $host!=substr($_SERVER['HTTP_REFERER'],8,$len))
    {
        $_ENV['track']['last_url']='u='.urlencode($_SERVER['HTTP_REFERER']);
    }
    if(isset($_GET['mag_prodid']) && $_GET['mag_prodid']>0){
        $_ENV['track']['prod_id']='pid='.$_GET['mag_prodid'];
    }
    if(isset($_GET['mag_cat']) && $_GET['mag_cat']>0){
        $_ENV['track']['cat_id']='cid='.$_GET['mag_cat'];
    }
    /*$sIp = PMA_getIp();
    $_ENV['track']['ip']='ip='.ip2long($sIp);*/
}

/**
 * содаем сессионую куку для отслеживания
 */
function generateSid()
{
    $time = time();
    $timeYear = $time + 3600 * 24 * 730;
    $sid = $time.':'.tep_create_random_value(5,'digits');
    md_setcookie('rSid',$sid,$timeYear,'/','.sotmarket.ru');
    $_COOKIE['rSid']=$sid;
}

function save_history_new($type='from') {
    global $af_multi;
    static $return=array();
    if(!array_key_exists($type,$return)){
    $ref = isset($_GET['ref']) ? (int)$_GET['ref'] : null;
    $from = isset($_GET[$type]) ? $_GET[$type] : null;
    $oldRef = isset($_COOKIE['partner']) ? (int)$_COOKIE['partner'] : null;
    $oldFrom = isset($_COOKIE[$type]) ? $_COOKIE[$type] : null;
    $timeYear = time() + 3600 * 24 * 45;//365; сейчас максимум месяц куку держим
    $timeWeek = time() + 3600 * 24 * 7;//365; сейчас максимум месяц куку держим
    if ($ref !== null) {
        // Условия обнуления 'from'
        $fromToNull = ($from === null);
        $newFrom = $fromToNull ? '' : $from;
        $timeFrom = $fromToNull ? 0 : $timeYear;

        // Обновляем только если изменилось значение хотя бы одной из кук.
        $block=false;
        if ($ref !== $oldRef && !check_can_update($ref , $oldRef)){
            $block=true;
        }
        if(in_array($ref,$af_multi) && $newFrom=='')
        {
            $block=true;
        }
        if (($ref !== $oldRef  || $from !== $oldFrom) && $block===false)  {
            $return[$type]='update';
            $seconds=time()-START_TRACK_DATE;
            if(isset($_COOKIE['partner']) && isset($_COOKIE['bad_ref']) && isset($_COOKIE['p_s'])
                && $_COOKIE['bad_ref']!=1 &&  $seconds<$_COOKIE['p_s']+45*86400 ){
                $lastGoodPartner=$_COOKIE['partner'].'_'.$_COOKIE['p_s'];
                if(isset($_COOKIE['subref'])){
                    $lastGoodPartner.='_'.$_COOKIE['subref'];
                }
                md_setcookie('last_good_partner', $lastGoodPartner, $timeYear, '/', '.sotmarket.ru');
            }
            md_setcookie('partner', $ref, $timeYear, '/', '.sotmarket.ru');
            md_setcookie($type, $newFrom, $timeFrom, '/', '.sotmarket.ru');
            md_setcookie('stm_stat_page_views', 0, $timeWeek, '/', '.sotmarket.ru');
            md_setcookie('stm_stat_page_time', 0, $timeWeek, '/', '.sotmarket.ru');
            update_cookie($ref,'affhistory',true,true);
            md_setcookie('p_s', $seconds, $timeYear, '/', '.sotmarket.ru');
            md_setcookie('d_traf', 0, $timeYear, '/', '.sotmarket.ru');
            md_setcookie('bad_ref',1,$timeYear,'/','.sotmarket.ru');
            $_COOKIE['p_s']=$seconds;
            $_COOKIE['d_traf']=0;
            $_COOKIE['w_count']=0;
        }
        else{
            $return[$type]='no';
            //return 'no';
        }
    }
    }

        return $return[$type];
}

/**
 * @param $ref
 * @param $oldref
 * @return bool
 * проверяет возможность смены партнера
 */
function check_can_update($ref,$oldref)
{
    $return=true;
    $can=true;
    $array_refs=get_reftype_low();
    $array_refs_cpc=get_reftype_high();
    $array_refs_ignore=get_reftype_ignore();
    $landing=false;//check_partner_landings();

    if( array_key_exists($ref,$array_refs_ignore) && $landing!==true ) {
        $can=false;
    }
    if(!is_null($oldref) && array_key_exists($ref,$array_refs) && !array_key_exists($oldref,$array_refs)) {
        $can=false;
    }
    if(!is_null($oldref) && !array_key_exists($ref,$array_refs_cpc) && array_key_exists($oldref,$array_refs_cpc)) {
        $can=false;
    }
    if($can!==true){
        $return=$can;
    }
    return $return;
}

/**
 * список партнеров с низким приоритетом в основном это кликандеры
 * @return array
 */
function get_reftype_low()
{
    static $return=null;
    if(is_null($return)){
        $return=array();
        $info=sql_cached('ref_type_low','SELECT status_number
                FROM
                `sprav_status_list` AS ss
                    WHERE ss.`status_type_id`=205 AND sort<=100
                ORDER BY ss.`sort`',3600*24);
        $types=array();
        foreach($info as $v){
            if(is_array($v) && isset($v['status_number']))
                $types[$v['status_number']]=1;
        }
        $types=array_keys($types);
        $return=get_reftype_by_ids($types);
    }
    return $return;
    //return get_reftype_by_ids(array(27,40));
}

/**
 * список партнеров только для лендингов
 * @return array
 */
function get_reftype_ignore()
{
    return array();//get_reftype_by_ids(array(70));
}

/**
 * @return array
 * список прайс площадок их не переписывают остальные виды партнеров
 */
function get_reftype_high()
{
    static $return=null;
    if(is_null($return)){
        $return=array();
        $info=sql_cached('ref_type_high','SELECT status_number
                FROM
                `sprav_status_list` AS ss
                    WHERE ss.`status_type_id`=205 AND sort>=200
                ORDER BY ss.`sort`',3600*24);
        $types=array();
        foreach($info as $v){
            if(is_array($v) && isset($v['status_number']))
                $types[$v['status_number']]=1;
        }
        $types=array_keys($types);
        $return=get_reftype_by_ids($types);
    }
    //если с момента установки партнеской куки высокого приоритета прошло больше 14 дней она становится обычного приоритета
    if(isset($_COOKIE['p_s'])){
        $time=time()-START_TRACK_DATE-$_COOKIE['p_s'];
    }else{
        $time=time();
    }
    if($time>14*24*3600){
        $return=array();
    }
    return $return;
}


check_ref();
detect_type();
incViewCounter();
/**
 * определяет тип источника трафика и записывает в куку
 *      куки p_s время установки партнера
 *       p_o время перехода с поиска
 *       $_GET['from'] при переходе с писем
 *       кука tr содержит тип один из следующих
 *      m(directmail) - письма d(direct_url) r(ref) o(search) trafik_orign
 */
function detect_type()
{
    $last=0;
    if(mb_substr($_SERVER['HTTP_REFERER'],0,31)=='http://active.www.dev.sotmarket' ||mb_substr($_SERVER['HTTP_REFERER'],0,24)=='http://www.dev.sotmarket'
        || mb_substr($_SERVER['HTTP_REFERER'],0,20)=='http://www.sotmarket' || mb_substr($_SERVER['HTTP_REFERER'],0,21)=='https://www.sotmarket'  ){
        return;
    }
    $k=0;
    $curent_from_traf=0;
    $unset_ref=false;
    $w_count=0;
    $w_count_delta=0;
    if(isset($_COOKIE['w_count']))
    {
        $w_count=$_COOKIE['w_count'];
    }
    if(isset($_COOKIE['d_traf'])){
        $curent_from_traf=(int)$_COOKIE['d_traf'];
    }
    $new_tarf=$curent_from_traf;
    if(isset($_GET['shi'])){
        $type='m';
        $new_tarf=$curent_from_traf+1;
    }else{
        if(isset($_COOKIE['p_s'])){
            $last=$_COOKIE['p_s'];
            $type='r';
            $w_count_delta++;
        }
        if(isset($_COOKIE['p_o']) && $_COOKIE['p_o']>$last){
            $last=$_COOKIE['p_o'];
            $type='o';
            $new_tarf=$curent_from_traf+1;
            $w_count_delta--;
        }

        $k=(time()-$last-START_TRACK_DATE);
        //если с последнего перехода по партнеской ссылке или из поиска прошло более 12 часов и рефер пустой считаем это прямым заходом на сайт
        if(empty($_SERVER['HTTP_REFERER']) && $k>12*3600 && (!isset($_GET['refid']) || empty($_GET['refid']))){
            $new_tarf=$curent_from_traf+1;
            $type='d';
        }
        /*
        if( $k>2*24*3600){
            $type='d';
        }*/
    }
    //обновляем количество просмотров страниц
    incViewCounter($w_count_delta);

    if(($new_tarf>2 || $unset_ref==true)&& isset($_COOKIE['partner'])){
        unset_partner();
    }

    if($new_tarf>$curent_from_traf){
        md_setcookie('d_traf',$new_tarf,time()+365*24*3600,'/','.sotmarket.ru');
    }
    if($type!=$_COOKIE['tr']){
        md_setcookie('tr',$type,time()+365*24*3600,'/','.sotmarket.ru');
        $_COOKIE['tr']=$type;
        if($type=='o'){
            $_ENV['new_partner']['need_track']=true;
            $_ENV['new_partner']['ref']='r=0';
        }
        elseif($type=='d'){
            $_ENV['new_partner']['need_track']=true;
        }
    }
}

/**
 * обрезка партнерских привязок по тикетам 49787,50127,50129
 */
function wrap_wrong_partners($afil_id){
    if($afil_id>0 ){
        if(isset($_COOKIE['p_s'])){
            $time=time()-START_TRACK_DATE-$_COOKIE['p_s'];
        }
        else{
            $time=time();
        }
        //3888000-45 дней в секундах если кука старше 45 дней давим
        if($time>3888000){
            unset_partner();
        }
        return;
    }
}

function get_reftype_by_ids($ids=array())
{
    static $return=array();
    if(!empty($ids) && is_array($ids)){
        $name=implode('_',$ids);
        if(!isset($return[$name])){
            $return=array();
            $info=sql_cached('ref_type_'.$name,'SELECT aa.`affiliate_id`
                    FROM  affiliate_affiliate AS aa
                        WHERE aa.`affiliate_type` in ('.implode(',',$ids).')',3600*9);

            foreach($info as $v){
                if(is_array($v) && isset($v['affiliate_id']))
                    $return[$v['affiliate_id']]=1;
            }
        }
    }
    return $return;
}

/**
 * отвязываем партнера установкой пустых кук
 */
function unset_partner(){
    md_setcookie('partner','',time()-3600,'/','.sotmarket.ru');
    unset($_COOKIE['partner']);
    unset($_GET['mag_did']);
    if( isset($_COOKIE['subref'])){
        md_setcookie('subref', '', time()-3600, '/', '.sotmarket.ru');
        unset($_COOKIE['subref']);
    }
    if( isset($_COOKIE['last_ref'])){
        md_setcookie('last_ref', '', time()-3600, '/', '.sotmarket.ru');
        unset($_COOKIE['last_ref']);
    }
    if( isset($_COOKIE['last_subref'])){
        md_setcookie('last_subref', '', time()-3600, '/', '.sotmarket.ru');
        unset($_COOKIE['last_subref']);
    }
    if( isset($_COOKIE['last_from'])){
        md_setcookie('last_from', '', time()-3600, '/', '.sotmarket.ru');
        unset($_COOKIE['last_from']);
    }
    if(isset($_COOKIE['stm_stat_page_time'])){
        md_setcookie('stm_stat_page_time', '', time()-3600, '/', '.sotmarket.ru');
        unset($_COOKIE['stm_stat_page_time']);
    }
    if(isset($_COOKIE['stm_stat_page_views'])){
        md_setcookie('stm_stat_page_views', '', time()-3600, '/', '.sotmarket.ru');
        unset($_COOKIE['stm_stat_page_views']);
    }
}
function md_setcookie($name, $value = NULL, $expire = NULL, $path = NULL, $domain = NULL, $secure = NULL, $httponly = NULL)
{
    if (!empty($domain) && substr($_SERVER['HTTP_HOST'], -strlen($domain)) != $domain) {
        $parts     = explode('.', $_SERVER['HTTP_HOST']);
        $last_part = end($parts);
        $domain    = '.sotmarket.' . $last_part;
    }
    setcookie($name, $value, $expire, $path, $domain, $secure, $httponly);
    $_ENV['cookie_arr'][$name] = array($name, $value, $expire, $path, $domain, $secure, $httponly);
}

function sql_cached($name, $query, $time = 3600, $base = 'default', $force_renew = false)
{
    if ($force_renew) {
        memcache_delete_info($name);
    }
    $return_value = memcache_get_info($name);
    if (!is_array($return_value)) {
        $return_value = array();
        $q            = mysql_query($query);
        if (mysql_num_rows($q) == 0) {
            $return_value['none'] = true;
        } else {
            while ($r = mysql_fetch_array($q, MYSQL_ASSOC)) {
                $return_value[] = $r;
            }
        }
        memcache_set_info($name, $return_value, $time);
    }
    if (isset($return_value['none'])) {
        unset($return_value['none']);
    }
    return $return_value;
}


/**
 * @param string $name - название ключа
 * @return bool|mixed FALSE если не удалось получить данные из мемкэша
 */
function memcache_get_info($name) {
    global $memcache;
    if ($name == '' || !$memcache) return FALSE;
    $name=convert_memcache_name($name);
    $ret = $memcache->get($name);
    return $ret;
}

/**
 * Удаляет значение из мемкэша
 * @param string $name
 * @return bool
 */
function memcache_delete_info($name) {
    global $memcache;
    if (!$memcache) return FALSE;
    $memcache->delete(convert_memcache_name($name));
}
/**
 * Устанавливает значение в memcache
 * @param string $name
 * @param mixed $value
 * @param int $time
 * @return bool
 */
function memcache_set_info($name, $value, $time = 3600) {
    global $memcache;
    if ($name == '' || !$memcache) return FALSE;
    if ($name == '') return FALSE;
    return $memcache->set(convert_memcache_name($name), $value, FALSE, $time);
}

function convert_memcache_name($name){
    $name=md5($name);
    $add='';
    return $add . $name;
}

function validate_affId($id){
        return mysql_num_rows(mysql_query('SELECT affiliate_id FROM affiliate_affiliate where  affiliate_id=' . (int)$id))>0;
    }
function incViewCounter($num=1){
    static $wasCalled=false;
    $w_count=$_COOKIE['w_count'];
    if(isset($_COOKIE['tr']) && $_COOKIE['tr']=='r' && $wasCalled===false){
        md_setcookie('w_count',$num+$w_count, time()+365*24*3600, '/', '.sotmarket.ru');
    }
    if(isset($_COOKIE['partner'])  && $_COOKIE['bad_ref']==1 && isset($_COOKIE['p_s']) && $_COOKIE['w_count']>3  && (time()-$_COOKIE['p_s']-START_TRACK_DATE)>2 ){
        //$unset_ref=true;
        md_setcookie('bad_ref',0,time()+45*24*3600,'/','.sotmarket.ru');
    }
    $wasCalled=true;
}

  
function tep_rand($min = NULL, $max = NULL)
{
    static $seeded;

    if (!$seeded) {
        mt_srand((double)microtime() * 1000000);
        $seeded = TRUE;
    }

    if (isset($min) && isset($max)) {
        if ($min >= $max) {
            return $min;
        } else {
            return mt_rand($min, $max);
        }
    } else {
        return mt_rand();
    }
}

function tep_create_random_value($length, $type = 'mixed')
{

    if (($type != 'mixed') && ($type != 'chars') && ($type != 'digits')) return FALSE;


    $rand_value = '';

    while (mb_strlen($rand_value) < $length) {

        if ($type == 'digits') {

            $char = tep_rand(1, 9);

        } else {

            $char = chr(tep_rand(0, 255));

        }

        if ($type == 'mixed') {

            if (preg_match('/^[a-z0-9]$/', $char)) $rand_value .= $char;

        } elseif ($type == 'chars') {

            if (preg_match('/^[a-z]$/', $char)) $rand_value .= $char;

        } elseif ($type == 'digits') {

            if (preg_match('/^[0-9]$/', $char)) $rand_value .= $char;

        }

    }


    return $rand_value;

}
