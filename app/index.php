<?php

use Carbon\CarbonInterval;
use Dotenv\Dotenv;

$dotenv = Dotenv::createImmutable(__DIR__ . '/..');
$dotenv->load();

$q = DB::pdo()->query("SELECT (total_time) FROM player_stats ORDER BY id DESC LIMIT 1");
if ($q) {
	$time = $q->fetch(PDO::FETCH_OBJ)->total_time;
	$display = CarbonInterval::seconds($time)->cascade()->forHumans();
} else {
	$display = ':(';
}

require_once 'view.php';