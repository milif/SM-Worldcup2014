<?php
header('Content-Type: application/json');

require_once __DIR__.'/../../lib/Bets.class.php';

$dataJson = file_get_contents("php://input");
$data = json_decode($dataJson, true);

if($data['action'] == 'update') {
    echo json_encode(array(
        'bets' => Bets::get(),
        'canBet' => Bets::canBet()
    ));
} else if($data['action'] == 'bet'){
    echo json_encode(array(
        'success' => Bets::canBet() ? Bets::bet($data['id'], $data['value']) : false,
        'canBet' => Bets::canBet()
    ));
}

