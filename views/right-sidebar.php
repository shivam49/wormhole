<script type="text/javascript">
  $(function () {
    $("#sidebar-wrap").css("top", $(".navbar").height());
    $("#sidebar-wrap").niceScroll({ smoothscroll: true, cursoropacitymax: 0 });
  });
</script>

<div class="col-md-3" id="sidebar-wrap">
  <div class="row list" >
    <div class="choosetext"><strong>Choose Source</strong> </div>
      <div class="chooseimgyoutub ">
        <a href="#"><img alt="" src="images/youtube.jpg" class="yousportimg"></a><a href="#"><img alt="" src="images/espn.jpg"></a><a href="#"><img alt="" src="images/cbs-sport.jpg"></a><a href="#"><img alt="" src="images/nba.jpg"></a><a href="#"><img alt="" src="images/fox-sport.jpg"></a>
      </div>

      <div class="choosetext">
        <strong>Related Articles</strong>
        <div class="view"><a href="#">View all</a></div>
      </div>
      <!--<div class="scrolbar">-->
      <?php foreach ($response['relatedArticles'] as $row):?>
      <div class="row">
        <div class="col-xs-12" style="">
          <div class="article up" style="height: auto">
            <a href="?article_id=<?php echo $row['id']; ?>">
                <!--<img src="<?php echo $row['imagePath'];?>" class="height-107 mbtm" />-->
                <div class="image" style="background-image:url(<?= $row['imagePath'] ?>); min-height: 300px">&nbsp;</div>
                <div class="text <?php echo $row['color'];?>" style="height: auto">
                  <div class="heading"><?php echo $row['title'];?></div>
                  <p class="detalils"> <?php echo $row['excerpt'];?></p>
                  <!--<a href="#" class="remove_icon">&nbsp;</a>-->
                </div>
              </a>
            </div>
          </div>
        </div>
      <?php endforeach; ?>              
    </div>
  </div>
</div>		
