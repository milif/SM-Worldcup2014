<?php
header('Content-Type: application/json');

require_once __DIR__.'/../../lib/Share.class.php';

$data = json_decode(file_get_contents("php://input"), true);
$action = $data['action'];

if($action == 'add') {
    echo json_encode(array(
        'success' => Share::add($data['uri'], $data['type'])
    ));
}
