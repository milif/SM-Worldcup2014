<?php

require_once __DIR__.'/../lib/DB.class.php';
require_once __DIR__.'/../lib/Bets.class.php';

// Обновляем список матчей

$handle = fopen(__DIR__.'/bets.csv', "r");
$i = 0;
$rs = DB::query("SELECT id FROM bets");
$ids = array();
foreach($rs as $row){
    $ids[] = $row['id'];
}

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