<?php
header('Content-Type: application/json');

require_once __DIR__.'/../../lib/Bets.class.php';
require_once __DIR__.'/../../lib/User.class.php';

$dataJson = file_get_contents("php://input");
$data = json_decode($dataJson, true);

if($data['action'] == 'update') {
    echo json_encode(array(
        'bets' => Bets::get(),
        'canBet' => Bets::canBet(),
        'score' => User::getScore()
    ));
} else if($data['action'] == 'bet'){
    echo json_encode(array(
        'success' => ($data['value'][0] === NULL && $data['value'][1] === NULL) || Bets::canBet() ? Bets::bet($data['id'], $data['value']) : false,
        'canBet' => Bets::canBet()
    ));
}

