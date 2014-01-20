'use strict';

angular.module('pack', ['dataProvider', 'd3'])
  //just an angularjs directive. Entry point for all interactions with radial control
    .directive('d3Pack', ['d3PackLink',
      function (d3PackLink) {
        return {
          restrict: 'EA',
          scope: {
            //variables binding
            displayDepth: '='
          },
          link: d3PackLink
        };
      }])

    .service('d3PackLink', ['$q', 'clusteredData', '$rootScope', 'itemsSelectionService',
      function ($q, clusteredData, $rootScope, itemsSelectionService) {
        return function (scope, element) {

          var width = d3.select(element[0]).node().offsetWidth;
          var height = d3.select(element[0]).node().offsetHeight;
          var center = { x: width / 2, y: height / 2 };
          var radius = Math.min(width, height) / 2.4;

          var svg = d3.select(element[0])
              .append('svg')
              .attr('width', width)
              .attr('height', height);

          $q.all(clusteredData).then(function (cluster, infobox) {
            var pack = d3.layout.pack()
                .size([radius * 2 , radius * 2])
                .value(function (d) {
                  return d.commonNumericProperties &&
                      d.commonNumericProperties.length > 0 &&
                      d.averageNumericValues &&
                      d.averageNumericValues[d.commonNumericProperties[0]] ?
                      d.averageNumericValues[d.commonNumericProperties[0]] : 0;
                })
                .children(function (d) {
                  return d.nodes;
                });

            render(pack, cluster);

            $rootScope.$watch(function () {
              return scope.displayDepth;
            }, function () {
              hideCircles();
            });

            itemsSelectionService.onHierarchySelectionChanged(function () {
              svg.selectAll('circle')
                  .attr('fill', getColor);
            });
          });

          var render = function (pack, cluster) {
            svg.selectAll('circle')
                .data(pack.nodes(cluster))
                .enter()
                .append('svg:circle')
                .attr('cx', function (d) {
                  return d.x + center.x - radius;
                })
                .attr('data-x', function (d) {
                  return d.x + center.x - radius;
                })
                .attr('cy', function (d) {
                  return d.y + 20;
                })
                .attr('r', function (d) {
                  return d.r;
                })
                .attr('opacity', function (d) {
                  return d.depth <= 2 ? 0.6 : 1;
                })
                .attr('stroke', 'black')
                .attr('fill', getColor)
                .on('click', function (d) {
                  onClusterClick(d);
                });
          };

          var hideCircles = function () {

            //var transform = d3.svg.transform()
            //    .scale(function () {
            //      return scope.displayDepth;
            //    });
//
            svg.selectAll('circle')
                .attr('display', function (d) {
                  return d.depth <= scope.displayDepth ? '' : 'none';
                });

            //svg.selectAll('circle')
            //    .transition()
            //    .duration(500)
            //    .attr('r', function (d) {
            //      return d.r* scope.displayDepth/5;
            //    });
          };

          var colorScale = d3.scale.category20b();
          var getColor = function (item) {
            if (item.isSelected()) {
              return 'yellow';
            }

            var id = item.id;
            var elem = item;
            while (elem.parent !== null && elem.parent.nodes[0].id === elem.id) {
              id = elem.parent.id;
              elem = elem.parent;
            }
            return colorScale(id);
          };

          var selectionIsUpdationg = false;

          function onClusterClick(node) {
            selectionIsUpdationg = true;
            itemsSelectionService.toggleClusterSelection(node);
            selectionIsUpdationg = false;

            svg.selectAll('circle')
                .attr('fill', getColor);

          }
        };
      }]);


