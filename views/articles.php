<?php
  include "header.php";
  include "left-sidebar.php";
?>

<style type="text/css">
  #timeline { padding-bottom: 2pt; font-family: 'ProximaNovaBold'; }
  #timeline div.pad { padding: 6.3pt 0; }
  #timeline div.color { background-color: #4E4F50; color: #ffffff; }
  #timeline-selector > div.row { position: absolute; left: 15px; right: 17.5px; }
  #timeline-selector div.center { margin: 0 auto; padding: 0; }
  #timeline div.row { text-align: center; }
  #timeline div.col-xs-1 { padding: 0; }
  @media (min-width: @screen-md-min) { #timeline-dates { display: none; } }
</style>

<div class="col-xs-10" id="timeline">
  <div class="row">
    <div id="timeline-selector" class="col-xs-1">
      <div class="row pad color">
        <div class="col-xs-12">
          <div class="row">
            <div class="center col-xs-9">Timeline</div>
            <div class="center col-xs-2 col-xs-offset-1"><img src="images/hamburger.svg" /></div>
          </div>
        </div>
      </div>
    </div>
    <div class="col-xs-11" id="timeline-dates">
      <div class="row pad color">
        <div class="col-xs-1"><img src="images/arrow-left.svg" /></div>
        <div class="col-xs-1">April 29</div>
        <div class="col-xs-1">April 30</div>
        <div class="col-xs-1">April 01</div>
        <div class="col-xs-1">April 02</div>
        <div class="col-xs-1">April 03</div>
        <div class="col-xs-1">April 04</div>
        <div class="col-xs-1">April 05</div>
        <div class="col-xs-1">April 06</div>
        <div class="col-xs-1">April 07</div>
        <div class="col-xs-1">April 08</div>
        <div class="col-xs-1"><img src="images/arrow-right.svg" /></div>
      </div>
    </div>
  </div>
</div>

<div class="col-md-offset-2  col-md-10" id="content-wrap">

<?php
  $templates = [
    '1' => 4,
    '2' => 4,
    '3' => 5,
    '4' => 3
  ];

  $rows = 4;
  for ($i = 0; $i < $rows; $i ++) {
    $template = rand(1, count($templates)) - 1;
    $key = array_keys($templates)[$template];
    $articles = array_splice($all, 0, $templates[$key]);
    include 'template-' . $key . '.php';
  }
?>

</div>
			
<?php
  include "footer.php";
?>
