<?php
require __DIR__ . '/../vendor/autoload.php';

use xPaw\MinecraftPing;
use xPaw\MinecraftPingException;

$response = [ 'message' => 'success'];
try
{
    $Query = new MinecraftPing( 'mc.chs.se', 25565 );
    $response['data'] = $Query->Query();
}
catch( MinecraftPingException $e )
{
    $response = [ 'message' => 'error', 'error' => $e->getMessage() ];
    http_response_code(500);
}
finally
{
    if( $Query )
    {
        $Query->Close();
    }
}
echo json_encode($response);