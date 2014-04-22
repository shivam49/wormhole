<?php

require 'vendor/autoload.php';

$params = [
  'hosts' => [
    '192.168.3.53'
  ]
];

$client = new Elasticsearch\Client($params);
