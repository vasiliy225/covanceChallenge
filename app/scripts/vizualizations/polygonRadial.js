'use strict';

angular.module('polygonRadial', ['dataProvider', 'd3'])
  //just an angularjs directive. Entry point for all interactions with radial control
  .directive('d3PolygonRadial', ['d3PolygonRadialLink',
    function (d3PolygonRadialLink) {

      return {
        restrict: 'EA',
        scope: {
          //variables binding
          displayDepth: '=',
          enableFisheye: '='
        },

        link: d3PolygonRadialLink
      };
    }])

  .service('d3PolygonRadialLink', ['$q', 'd3', 'clusteredData', '$rootScope', 'itemsSelectionService', 'infoBoxLoader', 'initializeArea',
    function ($q, d3, clusteredData, $rootScope, itemsSelectionService, infoBoxLoader, initializeArea) {
      return function (scope, element) {

        initializeArea(scope, element);

        var infoBoxLoading = infoBoxLoader(scope, element);
        $q.all(clusteredData, infoBoxLoading).then(function (cluster, infobox) {
          scope.cluster = cluster;
          scope.infobox = infobox;
        });
      };
    }])

  .service('initializeArea', ['d3',
    function (d3) {
      return function (scope, element) {
        scope.width = d3.select(element[0]).node().offsetWidth;
        scope.height = scope.width;

        scope.svg = d3.select(element[0])
          .append('svg')
          .style('height', scope.height + 'px')
          .style('width', '100%');

        scope.area = scope.svg.append('g')
          .attr('transform', 'translate(' + scope.width / 2 + ',' + scope.height / 2 + ')');
      };
    }])

  .service('infoBoxLoader', ['$compile, $http, $q',
    function ($compile, $http, $q) {
      return function (scope, element) {

        var deferred = $q.defer();

        var loader = $http.get('/views/partials/clusterInfo.html');
        loader.then(function (html) {
          var box = angular.element(html.data);
          element[0].appendChild(box);
          $compile(box)(scope);
          deferred.resolve(box);
        }, function (error) {
          deferred.reject(error);
        });

        return deferred.promise;
      };
    }]);