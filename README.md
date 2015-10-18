# ionic-issue-reporter

Allow user to send you screenshot with annoted content.

## how to install

```
$ bower install --save ionic-issue-reporter
$ cordova plugin add cordova-plugin-shake
$ cordova plugin add https://github.com/gitawego/cordova-screenshot.git
```

## how to use


```
var app = angular.module("demoapp", ["nablaware"]);

app.controller('MainController',
	['$rootScope', '$issueReporter'
	function($rootScope, $issueReporter){
		shake.startWatch(function () {
			$issueReporter.report();
		}, 30, function () {
			console.error('Shake error');
		});
		
		$rootScope.$on('issuereporter:send', function(evt, data){
			console.log('Data from issue reporter:', data);
			
			/* Example:
			$http
				.post('http://mysite.com/api/issue.php', data)
				.success(function(){
					console.log('Issue reported !');
				})
				.error(function(){
					console.error('Error with issue reporter...');
				});
			*/
		});

		
		
	}]);


```
