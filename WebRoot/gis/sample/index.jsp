<%@ page language="java" import="java.util.*" pageEncoding="UTF-8"%>
<html>
<head>
	<script type="text/javascript" src="/yxjk/config/config.js"></script>
	<script type="text/javascript">
		function clickShow(){
			//alert($config.gisConfig.ip);
		}
		clickShow();
	</script>
</head>
<body>
<h2>Hello World!</h2>
<form action="/yxjk/uploadFile" method="post" enctype="multipart/form-data">
	<input type="text" name="fileName"/>
	<input type="file" name="file"/>
	<input type="submit" text="提交"/>
</form>

<form action="/yxjk/ServletDemo?http://www.163.com" method="post" enctype="application/x-www-form-urlencoded" accept-charset="Unicode">
	<input type="text" name="fileName"/>
	<input type="text" name="fileType"/>
	<input type="submit" text="提交"/>
</form>

<form action="/yxjk/jsp/proxy.jsp?http://www.163.com" method="post" enctype="application/x-www-form-urlencoded">
	<input type="text" name="fileName"/>
	<input type="text" name="fileType"/>
	<input type="submit" text="提交"/>
</form>
</body>
</html>
