<?php 
	$file_contents = file_get_contents('BGem3.js');
	$file_contents = str_replace("<", "&lt;", $file_contents);
	$file_contents = str_replace(">", "&gt;", $file_contents);
?>
<!DOCTYPE HTML>
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
	<title>BGem3.js</title>
	<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
	<script type="text/javascript" src="src/jquery-1.11.1.min.js"></script>

	<script type="text/javascript" src="src/highlight.min.js"></script>
	<style type="text/css">
		body {
			background:#161b1d;
		}
		#container {
			display:block;
			position:fixed;
			left:0px;
			top:0px;
			width:100%;
			height:100%;
			margin:0px;
			padding:0px;
			box-sizing:border-box;
			overflow:scroll;
		}
		pre, code {
			width:99%;
			word-break:break-all;
			white-space:pre-wrap; 
			display:inline-block;
			margin:0px;
			padding-left:10px;
			font-family:Menlo, Monaco, Consolas, monospace;
			font-size:16px;
			text-shadow:2px 2px 2px #000;
		}
		@media only screen and (max-device-width : 375px) {
			pre, code {
				width:200%;
				font-size:32px;
				text-shadow:4px 4px 4px #000;
			}
			#container {
				padding-right:20px;
			}
		}
	</style>
	<link rel="stylesheet" href="src/atelier-savannah-dark.css">
	<script>
		hljs.initHighlightingOnLoad();
		hljs.configure({tabReplace:'  '});
	</script>
</head>
<body>
	<div id="container">
		<pre><code><?php echo $file_contents;?></code></pre>
	</div>
</body>
</html>