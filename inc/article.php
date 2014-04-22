<?php

include 'es.php';

function filterArticle(&$article) {
  $blocked = [
    5050407240225330112
  ];

  if (in_array($article['_id'], $blocked)) {
    return true;
  }

  if (strpos($article['fields']['image'][0], '/') === 0) {
    return true;
  }

  $broken = strpos($article['fields']['image'][0], '/>');
  if ($broken !== false) {
    $article['fields']['image'][0] = substr($article['fields']['image'][0], 0, $broken - 1);
  }
}

function riak($bucket, $key) {
  $url = "http://192.168.3.52:8098/buckets/$bucket/keys/$key";
  return file_get_contents($url);
}

function getRelatedArticles($articleId, $article) {
  global $client;

  $raw = file_get_contents("http://192.168.3.53:9200/articles2/article/$articleId/_mlt");
  $json = json_decode($raw, true);

  $titles = [ $article['title'] ];

  $articles = [];
  foreach ($json['hits']['hits'] as $hit) {
    if (filterArticle($hit)) {
      continue;
    }

    if (in_array($hit['_source']['title'], $titles)) {
      continue;
    }
    array_push($titles, $hit['_source']['title']);

    array_push($articles, getArticle($hit['_id']));
  }

  return $articles;
}

function getArticles($keywords = false, $textSearch = false) {
  global $client;

  $query = '';
  if ($keywords) {
    $field = 'category';
    if ($textSearch) {
      $field = 'article_text';
    }

    $query = '
      , "query" : {
        "match" : {
            "' . $field . '" : "' . $keywords . '"
        }
      }
    ';
  }

  $response = [];

  $json = '{
    "size": 49,
    "sort": {
      "_script": {
        "script": "Math.random()",
        "type": "number",
        "params": {},
        "order": "asc"
      }
    },
    "fields": [ "article_id", "title", "image", "description" ]
    ' . $query . '
  }';

  $params['index'] = 'articles2';
  $params['type']  = 'article';
  $params['body']  = $json;

  $results = $client->search($params);

  foreach ($results['hits']['hits'] as $hit) {
    if (filterArticle($hit)) {
      continue;
    }
    $topic = getTopic($hit['_id']);
    $hit['fields']['category'] = $topic;
    $hit['fields']['id'] = $hit['_id'];
    $hit['fields']['title'] = strip_tags($hit['fields']['title'][0]);
    $hit['fields']['imagePath'] = '/cache.php?url=' . urlencode(strip_tags($hit['fields']['image'][0]));
    $hit['fields']['excerpt'] = strip_tags($hit['fields']['description'][0]);
    $hit['fields']['color'] = getColor($topic);

    array_push($response, $hit['fields']);
  }

  return $response;
}

function getTopic($articleId) {
  $topic = riak('article_category2', $articleId);

  if ($topic === null) {
    $topic = riak('article_category', $articleId);
  }

  if ($topic === null) {
    return false;
  }

  $topic = strtolower($topic);

  if (strpos($topic, 'tech') !== false) {
    return 'edutech';
  }

  return $topic;
}

function getColor($topic) {
  switch($topic) {
    case 'news':
      return 'black';
    case 'entertainment':
      return 'red';
    case 'politics':
      return 'purple';
    case 'sports':
      return 'green';
    case 'edutech':
      return 'blue';
    case 'business':
      return 'gray';
    case 'lifestyle':
      return 'orange';
    default:
      return 'blue';
  }
}

function getArticle($articleId) {
  $json = json_decode(riak('meat_grinder2', $articleId), true);

  // Check meat_grinder
  if ($json === null) {
    $json = json_decode(riak('meat_grinder', $articleId), true);
  }

  // Invalid Article
  if ($json === null) {
    return false;
  }
  
  $topic = getTopic($articleId);

  return [
    'id' => $json['article_id'],
    'title' => strip_tags($json['title']),
    'imagePath' => '/cache.php?url=' . urlencode(strip_tags($json['image'])),
    'excerpt' => substr(strip_tags($json['description']), 0, 150),
    'description' => $json['article_text'],
    'category' => $topic,
    'color' => getColor($topic)
  ];
}
