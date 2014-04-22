<?php

  function checkGET($field) {
    return array_key_exists($field, $_GET) ? trim($_GET[$field]) : null;
  }

  include 'inc/article.php';

  $category = checkGET('category');
  $articleId = checkGET('article_id');
  $keyword = checkGET('keyword');

  if (! empty($articleId)) { // Article
    $article = getArticle($articleId);
    $response = [
      'relatedArticles' => getRelatedArticles($articleId, $article)
    ];

    include 'views/article.php';
  } else { // Articles
    if (! empty($category) && $category !== 'news') {
      $all = getArticles($category);
    } else if (! empty($keyword)) {
      $all = getArticles($keyword, true);
    } else {
      $all = getArticles();
    }

    include 'views/articles.php';
  }
?>
