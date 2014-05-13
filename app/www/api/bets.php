<?php
header('Content-Type: application/json');

require_once __DIR__.'/../../lib/Bets.class.php';

echo json_encode(Bets::get());
