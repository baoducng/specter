angular.module('specter.tab.marcopolo.controller', [])
  .controller('marcopoloCtrl', [
      'heatmapService',
      'geoService',
      '$cordovaGeolocation',
      '$scope',
      'location',
      '$stateParams',
      'stacheService',
    function(heatmapService, geoService, $cordovaGeolocation, $scope, location, $stateParams, stacheService) {
      var self = this;
      self.location = {long: "", lat: ""};
      self.id = $stateParams.id.slice(1);
      self.location.long = location.coords.longitude;
      self.location.lat = location.coords.latitude;

      stacheService.getOne(self.id)
        .then(function(stache) {
          self.currentStache = stache;
        })
        .then(function(stache) {
          self.distance = geoService.calculateDistance(self.currentStache.loc[0], self.currentStache.loc[1], self.location.long, self.location.lat);
        })
        .catch(function(err) {
          return err;
        });

      $scope.map = {
        center: {
            latitude: self.location.lat,
            longitude: self.location.long
        },
        zoom: 17,
        options: {mapTypeId: google.maps.MapTypeId.SATELLITE }
      };

      var gradient = [
        'rgba(0, 255, 255, 0)',
        'rgba(0, 255, 255, 1)',
        'rgba(0, 191, 255, 1)',
        'rgba(0, 127, 255, 1)',
        'rgba(0, 63, 255, 1)',
        'rgba(0, 0, 255, 1)',
        'rgba(0, 0, 223, 1)',
        'rgba(0, 0, 191, 1)',
        'rgba(0, 0, 159, 1)',
        'rgba(0, 0, 127, 1)',
        'rgba(63, 0, 91, 1)',
        'rgba(127, 0, 63, 1)',
        'rgba(191, 0, 31, 1)',
        'rgba(255, 0, 0, 1)'
      ];

      // Create the heatmap overlay
      HeatLayer = function (heatLayer) {
        var map, pointarray, heatmap;

        var weight = heatmapService.weight(self.distance);
        
        // Set color of proximity indicator bar (below map)
        // var colorIndex = (Math.ceil(weight) / 11) * gradient.length;
        var colorIndex = Math.floor((Math.ceil(weight) / 11) * gradient.length);

        if (colorIndex < gradient.length - 1) {
          $scope.proximityColor = gradient[colorIndex];
        }

        // Add point to heatmap
        heatmapService.addPoint(self.id, self.location.lat, self.location.long, weight);
        // Get all data points for heatmap
        $scope.pointArray = heatmapService.getPoints(self.id);
        heatLayer.setData($scope.pointArray);

        heatLayer.set('gradient', heatLayer.get('gradient') ? null : gradient);
      
      //function changeRadius() {
      //    heatmap.set('radius', heatmap.get('radius') ? null : 20);
      //}
      //
      //function changeOpacity() {
      //    heatmap.set('opacity', heatmap.get('opacity') ? null : 0.2);
      //}
        return heatLayer;
      };

      $scope.heatLayerCallback = function (layer) {
        $scope.heatLayer = new HeatLayer(layer);
      };


      var watch = $cordovaGeolocation.watchPosition({
        frequency: 10000
      });
      watch.promise.then(function() {
      }, function(err) {
        return err;
      }, function(position) {
          self.location.long = position.coords.longitude;
          self.location.lat = position.coords.latitude;
          self.distance = geoService.calculateDistance(self.currentStache.loc[0], self.currentStache.loc[1], self.location.long, self.location.lat);
          var visited = heatmapService.contains(self.id, self.location.lat, self.location.long);
          

          // If user is within 3 meters, reveal stache
          if (self.distance < 3) {
            console.log("You found the stache!");
            // Route to mah' staches view, newest stache is highlighted and can be clicked on for viewing
          } else if (!visited) {
            console.log("User has traveled, adding new location to heatmap.");
            
            var weight = heatmapService.weight(self.distance);
            // Set color of proximity indicator bar (below map)
            // var colorIndex = Math.ceil(weight);
            var colorIndex = Math.floor((Math.ceil(weight) / 11) * gradient.length);

            if (colorIndex < gradient.length - 1) {
              $scope.proximityColor = gradient[colorIndex];
            }

            // Add current location to heatmap
            heatmapService.addPoint(self.id, self.location.lat, self.location.long, weight);
            $scope.pointArray = heatmapService.getPoints(self.id);
          }
      });

      // Rerender heatmap whenever new data has been added
      $scope.$watch('pointArray', function (pointArray) {
        console.log('watch on pointArray triggered');
        $scope.heatLayer.setData(pointArray);
      }, true);
  }]);
