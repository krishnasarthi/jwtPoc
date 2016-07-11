//app.js

(function(){
	var app = angular.module('authModule',['ui.router']);

	app.config(['$stateProvider',function($stateProvider){
		$stateProvider
			.state('home',{
				url : '/',
				/*controller : 'HomeController',
				controllerAs : 'home',
				templateUrl : 'app/templates/home.html'*/
				template : '<h1>This is an inline template</h1>'
			});
	}]);
}());