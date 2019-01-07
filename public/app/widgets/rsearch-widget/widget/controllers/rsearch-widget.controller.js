import 'angular-clock';
import 'angular-clock/dist/angular-clock.css';
import '../style/rsearch-widget.css';

import {cloneDeep} from 'lodash';

class RsearchWidget {
  constructor($scope, $state, UserProfile, $log, SearchService, $uibModal,
  CONFIGURATION, ModalHelper, ROUTER, TimeMachine) {
    'ngInject';
    this.$scope = $scope;
    this.$state = $state;
    this.UserProfile = UserProfile;
    this.$log = $log;
    this.SearchService = SearchService;
    this.$uibModal = $uibModal;
    this.CONFIGURATION = CONFIGURATION;
    this.ModalHelper = ModalHelper;
    this.ROUTER = ROUTER;
    this.TimeMachine = TimeMachine;
  }

  $onInit() {
    this._widget = cloneDeep(this.widget);
    this.newObject = this.UserProfile.profileScope.search;
    this.newResult = this.UserProfile.profileScope.result;
    this.newResult.limit = this.newResult.limit || this.UserProfile.profileScope.limit;
    this.timerange = this.UserProfile.profileScope.timerange;                                         
    this.newObject['limit'] = 100;
  }

  get locationName() {
    return this._widget.config.location.desc.toUpperCase() || 'unknown';
  }

  delete() {
    this.onDelete({uuid: this._widget.uuid});
  }

  update(widget) {
    this._widget = widget;
    console.log("WIDGTET", this._widget);
    this.onUpdate({uuid: this._widget.uuid, widget});
  }
  
  
  // process the form
  processSearchForm() {

    if (this.newObject instanceof Array) {
      this.newObject = {};
    }

    this.searchObject = {};
    this.nsObject = {};
    this.searchObject['searchvalue'] =  this.newObject['searchvalue'];
    this.nsObject['query'] =  this.newObject['searchvalue'];    
    this.searchObject['limit'] =  this.newObject['limit'];

    this.UserProfile.setProfile('search', this.searchObject);
    this.UserProfile.setProfile('result', this.newResult);
    this.UserProfile.setProfile('limit', this.searchObject['limit']);
    this.isBusy = true;
        
    let protoID = 'loki';
    this.searchForProtocol(protoID);    

  }

  searchForProtocol(protoID) {
    const { from, to, custom } = this.TimeMachine.getTimerangeUnix();

    this.$state.go(this.ROUTER.REMOTE.NAME, {
      protoID,
      search: this.nsObject,
      limit: this.searchObject['limit'],
      server: this._widget.server,
      timezone: this.TimeMachine.getTimezone(),
      from,
      to,
      custom,
    });    
  }


  clearSearchForm() {
    this.UserProfile.profileScope.search = {};
    this.UserProfile.setProfile('search', this.newObject);
    this._nullifyObjectKeys(this.newObject);
  }

  openSettings() {
    this.$uibModal.open({
      component: 'rsearchWidgetSettings',
      resolve: {
        widget: () => {
          return cloneDeep(this._widget);
        },
        timezones: () => {
          return this.TIMEZONES;
        },
      },
    }).result.then((widget) => {
      this.update(widget);
    }).catch((error) => {
      if (this.ModalHelper.isError(error)) {
        this.$log.error(['ResearchWidget', 'settings'], error);
      }
    });
  }
}

export default RsearchWidget;
