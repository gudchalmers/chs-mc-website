<?php

use Carbon\CarbonInterval;

$q = DB::pdo()->query("SELECT (total_time) FROM player_stats ORDER BY id DESC LIMIT 1");
if ($q) {
	$time = $q->fetch(PDO::FETCH_OBJ)->total_time;
	$display = CarbonInterval::seconds($time)->cascade()->forHumans();
} else {
	$display = ':(';
}

require_once 'view.php';