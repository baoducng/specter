angular.module('specter.tab.profile.controller', [])
.controller("loginCtrl", function($scope, $rootScope, $firebase, $firebaseSimpleLogin, UserService) {
  // Get a reference to the Firebase
  var firebaseRef = new Firebase("https://specter-app.firebaseio.com/");
  // Create a Firebase Simple Login object
  $scope.auth = $firebaseSimpleLogin(firebaseRef);
  // Initially set no user to be logged in
  $scope.user = UserService;
  // Logs a user in with inputted provider
  $scope.login = function(provider) {
    $scope.auth.$login(provider);
    $scope.$apply();
  };
  // Logs a user out
  $scope.logout = function() {
    $scope.auth.$logout();
    $scope.$apply();
  };
});
