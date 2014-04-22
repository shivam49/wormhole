				<div class="col-md-3" id="sidebar-wrap">
					<div class="row list" >
                    <div class="choosetext"><strong>Choose Source</strong> </div>
                <div class="chooseimgyoutub ">
                <a href="#"><img alt="" src="images/youtube.jpg" class="yousportimg"></a><a href="#"><img alt="" src="images/espn.jpg"></a><a href="#"><img alt="" src="images/cbs-sport.jpg"></a><a href="#"><img alt="" src="images/nba.jpg"></a><a href="#"><img alt="" src="images/fox-sport.jpg"></a></div>
             
			<div class="choosetext"><strong>Related Articles</strong>
                <div class="view"><a href="#">View all</a></div>
              </div>
               <!--<div class="scrolbar">-->
			   <div>
			   <?php foreach ($response['relatedArticles'] as $row):?>
                 <div class="box <?php echo $row['color'];?>"> <a href="?article_id=<?php echo $row['id']; ?>"><img src="<?php echo $row['imagePath'];?>" class="height-107 mbtm" /></a>
                <div class="heading"><?php echo $row['title'];?></div>
               <p class="detalils"> <?php echo $row['excerpt'];?></p> <a href="#" class="remove_icon"></a></div>  
			   <?php endforeach; ?>              
               </div>
					</div>
				</div>		
