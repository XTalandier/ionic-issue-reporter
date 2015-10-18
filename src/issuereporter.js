if (typeof navigator.screenshot == 'undefined') {
	navigator.screenshot = {
		save: function (cb) {
			html2canvas(document.body, {
				onrendered: function (canvas) {
					var img = canvas.toDataURL('image/png');
					cb(false, {
						success: true,
						filePath: img
					})
				}
			});

		}
	}
}

angular.module('nablaware',
	['ionic', 'ngTouch'])
	.factory('$issueReporter',
	['$q', '$rootScope', '$ionicModal', '$timeout',
		function ($q, $rootScope, $ionicModal, $timeout) {

			function report() {
				var def = $q.defer();
				console.log('REPORT !');
				var modal = null;

				navigator.screenshot.save(function (error, res) {
					if (error) {
						console.error(error);
					} else {
						console.log(res);
						$rootScope.issueScreenshot = res.filePath;
						$ionicModal
							.fromTemplateUrl(
							'issuereporter.html', {
								scope: $rootScope,
								animation: 'slide-in-up'
							})
							.then(function (_modal) {
								$rootScope.$issueModal = _modal;
								console.log('modal.show();');
								$rootScope.$issueModal.show();
							});
					}
				}, 'jpg', 100, 'foo');


				return def.promise;
			}

			function close() {
				$rootScope.$issueModal.remove();
				$rootScope.$issueModal = null;
			}

			return {
				report: report,
				close: close
			}
		}])
	.controller('$issueReporterController',
	['$rootScope', '$scope', '$issueReporter', '$timeout',
		function ($rootScope, $scope, $issueReporter, $timeout) {

			$scope.curStep = 0;
			$scope.comment = {value: ''};
			$scope.isReady = false;

			$scope.step = {
				backStep: 'Cancel',
				nextStep: 'Next'
			};


			$scope.nextStep = function () {
				$scope.curStep++;
				if ($scope.curStep == 1) {
					$scope.step = {
						backStep: 'Previous',
						nextStep: 'Send report'
					};
					var imgData = drawer.getData('image/jpeg');
					document.getElementById('myImageReport').src = imgData;
				} else if ($scope.curStep == 2) {
					console.log('END OF REPORT');
					$issueReporter.close();
					$rootScope.$broadcast('issuereporter:send', {
						image: drawer.getData('image/jpeg'),
						comment: $scope.comment.value
					});
				}
			};

			$scope.backStep = function () {
				$scope.curStep--;
				if ($scope.curStep == -1) {
					$issueReporter.close();
				} else {
					$scope.step = {
						backStep: 'Cancel',
						nextStep: 'Next'
					};
				}
			};

			var drawer = null;

			$timeout(function () {
				drawer = new Drawer($rootScope.issueScreenshot);
				$scope.isReady = true;
			}, 1000);

			$scope.drawertouchstart = function ($event) {
				drawer.start();
			};

			$scope.drawertouchend = function ($event) {
				drawer.end();
			};

			$scope.drawertouchmove = function ($event) {
				var x = $event.touches[0].clientX;
				var y = $event.touches[0].clientY;
				drawer.move(x, y);
			};


			function Drawer(imagePath) {
				var canvas = document.getElementById('issueCanvas');
				canvas.width = window.screen.width;
				canvas.height = window.screen.height;
				//canvas.style.backgroundImage = 'url("%url")'.replace('%url', imagePath);
				//canvas.style.backgroundSize = 'cover';

				var imgIssue = new Image()
				var issueReportContext = null;
				imgIssue.onload = function () {
					context.drawImage(imgIssue,
						0, 0,
						imgIssue.width, imgIssue.height,
						0, 0,
						canvas.width, canvas.height
					);
				};
				imgIssue.src = imagePath;

				var context = canvas.getContext('2d');
				context.lineJoin = "round";

				var delta = _getPosOffsetY();
				_initPointsOfColor();

				var isStarted = false;
				var curPoints = [];
				var history = [];

				var curColor = '#000';
				var curSize = 5;

				function start() {
					isStarted = true;
				}

				function end() {
					isStarted = false;
					if (curPoints.length > 0) {
						history.push({
							color: curColor,
							size: curSize,
							points: curPoints
						});
						curPoints = [];
					}
				}

				function move(x, y) {
					if (!isStarted) {
						return;
					}

					curPoints.push({x: x, y: y - delta});
					_redraw();
				}

				function _initPointsOfColor() {
					var points = document.getElementsByClassName('issue-reporter-color');
					var setPointsEvent = function (el) {
						var color = el.getAttribute('data-color');
						var size = el.getAttribute('data-sier');
						el.style.background = color;

						el.addEventListener('click', function () {
							curColor = color;
							curSize = size || 5;
						});
					};

					for (var i = 0; i < points.length; i++) {
						setPointsEvent(points[i]);
					}
				}

				function _getPosOffsetY() {
					var bodyRect = document.body.getBoundingClientRect();
					var elemRect = canvas.getBoundingClientRect();
					var offset = elemRect.top - bodyRect.top;

					return offset;
				}


				function _redraw() {
					for (var i = 0; i < history.length; i++) {
						_drawPoints(history[i], context);
					}

					_drawPoints({
						color: curColor,
						size: curSize,
						points: curPoints
					}, context);

				}

				function _drawPoints(data, ctx) {

					ctx.strokeStyle = data.color;
					ctx.lineWidth = data.size || 5;
					var _pts = data.points;
					ctx.moveTo(_pts[0].x, _pts[0].y);
					for (var i = 1; i < _pts.length; i++) {
						ctx.beginPath();
						if (_pts[i] && i) {
							ctx.moveTo(_pts[i - 1].x, _pts[i - 1].y);
						} else {
							ctx.moveTo(_pts[i].y - 1, _pts[i].y);
						}
						ctx.lineTo(_pts[i].x, _pts[i].y);
						ctx.closePath();
						ctx.stroke();
					}
				}

				function getData(format) {
					return canvas.toDataURL(format);
				}


				return {
					start: start,
					end: end,
					move: move,
					getData: getData
				}
			}


		}]);
