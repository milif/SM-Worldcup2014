<?php

require_once __DIR__.'/../lib/DB.class.php';
require_once __DIR__.'/../lib/Bets.class.php';

// Обновляем список матчей

$handle = fopen(__DIR__.'/country.csv', "r");
$country = array();
while (($line = fgetcsv($handle, 0)) !== FALSE) { 
    $country[getCountryKey($line[0])] = mb_strtolower($line[1], "UTF-8");
}
fclose($handle);

$rs = DB::query("SELECT id FROM bets");
$ids = array();
foreach($rs as $row){
    $ids[] = (int)$row['id'];
}

$doc = new DOMDocument();
$doc->load('http://football.sport-express.ru/export/nandu.ru/upload_competitions.php?season=2014&championship=4');
$items = $doc->getElementsByTagName ('match');
foreach($items as $itemNode){
    $attrs = $itemNode->attributes;
    
    $name1 = $attrs->getNamedItem('command1_name')->textContent;
    $name2 = $attrs->getNamedItem('command2_name')->textContent;
    
    if(!$name1 || !$name2) continue;
    
    $isPlayed = $attrs->getNamedItem('played')->textContent !== "0";
    
    $id = (int)$attrs->getNamedItem('id')->textContent;
    
    $params = array(
        ':time' => $attrs->getNamedItem('timestamp')->textContent,
        ':descr' => $attrs->getNamedItem('tour_name')->textContent,
        ':result' => $isPlayed ? '['.$attrs->getNamedItem('result1')->textContent.','.$attrs->getNamedItem('result2')->textContent.']' : null,
        ':data' => '[["'.$country[getCountryKey($name1)].'","'.$name1.'"],["'.$country[getCountryKey($name2)].'","'.$name2.'"]]'
    );
    
    if(in_array($id, $ids)) {
        DB::update("UPDATE bets SET `time` = :time, descr = :descr, result = :result, data = :data WHERE id = ".$id, $params);
    } else {
        DB::update("INSERT INTO bets (id, `time`, descr, result, data) VALUES ($id, :time, :descr, :result, :data);", $params);
    }
}
/*
$handle = fopen(__DIR__.'/bets.csv', "r");
$i = 0;

while (($line = fgetcsv($handle, 0)) !== FALSE) { 
    if($i++<3) continue;
    $params = array(
        ':time' => date('Y-m-d H:i:s', strtotime($line[1].' Europe/Moscow')),
        ':descr' => $line[8],
        ':result' => $line[4] !== '' && $line[5] !== '' ? '['.$line[4].','.$line[5].']' : null,
        ':data' => '[["'.trim(mb_strtolower($line[2], "UTF-8")).'","'.trim($line[3]).'"],["'.trim(mb_strtolower($line[7], "UTF-8")).'","'.trim($line[6]).'"]]'
    );
    
    if(in_array($line[0], $ids)) {
        DB::update("UPDATE bets SET `time` = :time, descr = :descr, result = :result, data = :data WHERE id = ".$line[0], $params);
    } else {
        DB::update("INSERT INTO bets (id, `time`, descr, result, data) VALUES ($line[0], :time, :descr, :result, :data);", $params);
    }
}
fclose($handle);
*/

//  Обновляем результаты игроков

$bets = DB::query("SELECT id, result FROM bets WHERE result IS NOT NULL;");
foreach($bets as $bet){
    $betResult = json_decode($bet['result'], true);
    $userBets = DB::query("SELECT id, value, user_key FROM user_bets WHERE bet_id = {$bet['id']} AND result IS NULL LIMIT 2500;");
    foreach($userBets as $userBet){
        $userBetResult = json_decode($userBet['value'], true);
        $userResult = 0;
        $score = 0;
        if ($userBetResult[0] == $betResult[0] && $userBetResult[1] == $betResult[1]){
            $userResult = 2;
            $score = 500;
        } else if(
            ($userBetResult[0] > $userBetResult[1] && $betResult[0] > $betResult[1])
                ||
            ($userBetResult[0] < $userBetResult[1] && $betResult[0] < $betResult[1]) 
                ||
            ($userBetResult[0] == $userBetResult[1] && $betResult[0] == $betResult[1])
        ) {
            $userResult = 1;
            $score = 100;
        }
        DB::update("UPDATE user_bets SET result = $userResult, score = $score WHERE id = {$userBet['id']};");
        if($score > 0) {
            DB::update("UPDATE user SET score = score + $score WHERE user_key = :userKey;", array(
                ':userKey' => $userBet['user_key']
            ));
        }
    }
}

function getCountryKey($name){
    return preg_replace('/[^\w]/u','', mb_strtolower($name, "UTF-8"));
}