<div class="row">
  <div class="col-md-4">
    <a class="up" href="?article_id=<?php echo $articles[0]['id'] ?>">
      <div class="article up">
        <div class="image" style="background-image:url(<?php echo $articles[0]['imagePath'] ?>);"></div>
        <div class="text <?= $articles[0]['color'] ?>">
          <strong><?php echo $articles[0]['title'] ?></strong>
          <p><?php echo $articles[0]['excerpt'] ?></p>
        </div>
      </div>
    </a>
  </div>
  <div class="col-md-4">
    <div class="article down">
      <a href="?article_id=<?= $articles[1]['id'] ?>">
        <div class="text <?php echo $articles[1]['color']; ?>">
          <strong><?php echo $articles[1]['title'] ?></strong>
          <p><?php echo $articles[1]['excerpt'] ?></p>
        </div>
        <div class="image" style="background-image:url(<?php echo $articles[1]['imagePath'] ?>);">&nbsp;</div>
      </a>
    </div>
  </div>
  <div class="col-md-4">
    <div class="article up">
      <a href="?article_id=<?= $articles[2]['id'] ?>">
        <div class="image" style="background-image:url(<?php echo $articles[2]['imagePath'] ?>);">&nbsp;</div>
        <div class="text <?php echo $articles[2]['color']; ?>">
          <strong><?php echo $articles[2]['title'] ?></strong>
          <p><?php echo $articles[2]['excerpt'] ?></p>
        </div>
      </a>
    </div>
  </div>
</div>
