<?php include "header.php";?>
<?php include "left-sidebar.php";?>	
				<div class="col-md-7" id="content-wrap">
					<div class="row list">
						<div id="content">
							<img src="<?php echo $article['imagePath'];?>" />
                            <div class="scrobar">
                            <h2><?php echo $article['title'];?></h2>
                            <p><?php echo $article['description'];?></p>
						    </div>
                          <div class="greenSlider <?php echo $article['color'];?>">
                                
                                <div class="col-md-4"><a href="#"><img class="img_first" src="images/dot.png" />add to eekoh-system</a></div>

                                <div class="col-md-4"><a href="#"><img class="img_second" src="images/dot.png" />go to eekoh page</a></div>

                                <div class="col-md-4"><a href="#"><img class="img_third" src="images/dot.png" />share</a></div>
                           </div>
					</div>
					</div>
				</div>
<?php include "right-sidebar.php";?>
<?php include "footer.php";?>