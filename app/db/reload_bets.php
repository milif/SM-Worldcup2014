<?php

require_once __DIR__.'/../lib/DB.class.php';

// Обновляем данные матчей
DB::update("UPDATE user SET score = 0;");
DB::update("UPDATE user_bets SET score = null, result = 0;");

require __DIR__.'/update_bets.php';

// Начисляем баллы по промокодам
DB::update("UPDATE user a, (SELECT user_id, SUM(score) score FROM code GROUP BY user_id) b SET a.score = a.score + b.score WHERE a.id = b.user_id");