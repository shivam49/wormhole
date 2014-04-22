<?php
  include "header.php";
  include "left-sidebar.php";
?>

<div class="col-md-10" id="content-wrap">

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
