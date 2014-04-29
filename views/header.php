<!doctype html>
<html>
	<head>
		<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
		<meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1">
		<meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
		<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
		<title>Welcome to eekoh</title>

		<!-- Call dem styles h8r's -->
    <link rel="stylesheet" href="css/bootstrap.css" type="text/css">
		<link href="css/styles.css" rel="stylesheet">
		<link href="css/article.css" rel="stylesheet">
		<link href="css/mason.css" rel="stylesheet">
		<script src="//code.jquery.com/jquery-1.11.0.min.js"></script>
		<script src="//code.jquery.com/jquery-migrate-1.2.1.min.js"></script>
		<!-- Strap it up if your gonna hit it SMART -->
		<script src="//netdna.bootstrapcdn.com/bootstrap/3.1.1/js/bootstrap.min.js"></script>
		<script src="js/ftellipsis.js"></script>
		<script src="js/jquery.nicescroll.min.js"></script>
		<script type="text/javascript">
        function Redirect(keyword)
        {
         window.location="?keyword="+keyword;
        }
        $(function () {
          $('.text').each(function () {
            var el = new Ellipsis($(this)[0]);
            el.calc();
            el.set();
          });
        });
        </script>
	</head>
	<body ng-app="myApp">
		<div id="header">
	    	<div class="container-fluid">
				<nav class="navbar navbar-default navbar-fixed-top" role="navigation">
					<div class="navbar-header col-md-2">
						<div class="logo">
							<a class="navbar-brand" href="<?php echo implode('/', explode('/', $_SERVER['SCRIPT_NAME'], -1)) ?>">
								<img src="images/logo.png" alt="Logo"/>
							</a>
						</div>
					</div>
					<div class="col-md-10">
						<div class="row">
							<div class="col-md-6">
								<div class="row">
						        	<form class="navbar-form navbar-left" role="search">
							        	<div class="input-group">
											<input type="text" class="form-control" name="keyword" value="<?= in_array('keyword', $_GET) ? $_GET['keyword'] : '' ?>">
											<span class="input-group-btn">
									        	<button class="btn btn-default" type="button" onClick="Redirect(keyword.value)">
									        		<img id="search-icon" src="http://vps.eekoh.me/images/submit-btn.png">
									        	</button>
											</span>
									    </div>
									</form>
								</div>
							</div>
							<div class="col-md-6">
                           <ul class="nav navbar-nav actions marginRight4" >
						        	<li>
										<a href="#" class="print">
											&nbsp;
										</a>
									</li>
									<li>
										<a href="#" class="msg">
											&nbsp;
										</a>
									</li>
									<li>
										<a href="#" class="price">
											&nbsp;
										</a>
									</li>
									<li>
										<a href="#" class="setting">
											&nbsp;
										</a>
									</li>					
								</ul>
                                 <img src="images/tree-small.png" class="tree pull-right marginRight30"  />
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
		<div class="container-fluid">
			<div class="row">		
