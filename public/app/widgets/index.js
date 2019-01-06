import angular from 'angular';
import Services from './services';
import Clock from './clock-widget';
// import Quicksearch from './quicksearch-widget';
import Influxdbchart from './influxdbchart-widget';
import Protosearch from './protosearch-widget';
import Remotesearch from './rsearch-widget';

export default angular.module('hepicApp.widgets', [
  Services.name,
  Clock.name,
  Influxdbchart.name,
  Protosearch.name,
  Remotesearch.name,
]);

/*   Quicksearch.name, */
