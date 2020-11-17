
import $ from 'jquery';
import { CompositeView, ItemView } from 'backbone.marionette';
import cookie from '@component/common/src/util/Cookie';
import storesListTemplate from '../templates/partials/storeTemplate.hbs';
import singleStoreTemplate from '../templates/partials/singleTemplate.hbs';
import floatingStoresList from '../templates/partials/floating-stores-list.hbs';
import StoresCollection from './StoresCollection';


// default lat and longitude are center America
const usersGeoLocation = cookie.get('USERLL', 'MISCGCs') || '38.0000,-97.0000';

let showSingleStore = false;
let reInitializeMap = false;
let showStoreList = true;
let selectedChildStore;
let selectedArrayPosition;
let self;
let showMap = true;

window.mapOptions = {
  // center: new google.maps.LatLng(33.848142,-84.361025), this is where we position the map
  center: { lat: Number(usersGeoLocation.split(',')[0]), lng: Number(usersGeoLocation.split(',')[1]) },
  zoom: 10,
  zoomControl: true,
  disableDoubleClickZoom: true,
  mapTypeControl: true,
  scaleControl: true,
  scrollwheel: false,
  panControl: true,
  streetViewControl: false,
  draggable: true,
  overviewMapControl: true,
  overviewMapControlOptions: {
    opened: false,
  },
  zoomControlOptions: {
    style: true,
  },
  mapTypeControlOptions: {
    style: true,
  },
  mapTypeId: true,
};

const storeView = CompositeView.extend({
  template: floatingStoresList,
  childViewContainer: 'ul.floatingList',
  el: '.elements',
  initialize() {
    this.collection = new StoresCollection({});
    // needs to be set as an attribute vs extending which just adds it to the model
    this.collection.latLong = usersGeoLocation;


    // needs to have the success funtion extended to call render once the API is returned
    self = this;
    this.collection.fetch({ success() { self.render(); } });
    this.activeCollection = this;

    // set event listener on submit button for user submitted data
    $('#submit-location').click(() => {
      reInitializeMap = true;
      this.fetchData();
      this.updateSearch();
    });
    /* eslint consistent-return: "error" */
    $('#profile_location').on('keypress', (e) => {
      if (e.keyCode === 13) {
        $('#submit-location').trigger('click');
        return false;
      }
      return true;
    });

    $('#viewOnMap').click(() => {
      reInitializeMap = true;
      showMap = true;
      this.fetchData();
      this.updateSearch();
    });
  },
  fetchData() {
    self.collection.searchLocation = $('#profile_location')[0].value;
    self.collection.fetch({
      success() {
        self.render();

        if (showMap === true) {
          $('.floatingList').addClass('map');
          $('.mgc-banner-1').addClass('map');
          $('#charities-map').addClass('mgc-show');
        }
      },
    });
  },
  updateSearch() {
    $('.mgc-search-input').addClass('mgc-show');
    $('.floatingList').addClass('mgc-show');
    showStoreList = true;
  },
  childView: ItemView.extend({
    // need to pass in either the stores list template, but if clicked render that stores details
    // Flattening the arg using ES6 syntax spread
    template(...args) {
      if (showSingleStore) {
        if (args[0].id === selectedChildStore || selectedArrayPosition === args[0].arrayPosition) {
          return singleStoreTemplate(...args);
        }
        return false;
      }
      return storesListTemplate(...args);
    },
    tagName: 'li',
    initialize() {
      if (showStoreList === true) {
        $('.floatingList').addClass('mgc-show');
        $('.mgc-banner-1').addClass('mgc-show');
      }
    },
    showInfoWindow(e) {
      const evTarget = e.currentTarget;

      // grabbing name
      const storeName = evTarget.attributes['data-name'].value;

      // grabbing lat and long
      const coordinates = evTarget.attributes['data-latlong'].value.split(',');

      const lat = parseFloat(coordinates[0], 10);
      const lng = parseFloat(coordinates[1], 10);

      // grabbing address
      const addrLine1 = evTarget.attributes['data-address'].value;
      const addrLine2 = evTarget.attributes['data-citystatezip'].value;

      // grabbing phone number
      const phoneNumber = evTarget.attributes['data-phonenumber'].value;

      const storeInfo = `<div class='store-info-window'><h4>${storeName}</h4>
                        <p class='address'>${addrLine1}</p>
                        <p class='address'>${addrLine2}</p>
                        <p class='phoneNumber'>${phoneNumber}</p>
                        <a href="https://l.macys.com/stores.html?cm_sp=navigation-_-bottom_nav-_-store_locations_hours?cm_sp=makegoodcents-_-staticpages-_-storedetails">Store Details</a></div>`;


      const infowindow = new window.google.maps.InfoWindow({
        maxWidth: 300,
        content: storeInfo,
      });

      const marker = new window.google.maps.Marker({
        position: { lat, lng },
        map: window.map,
      });

      $('#charities-map').addClass('mgc-show');
      infowindow.open(window.map, marker);
      $('.mgc-banner-1').addClass('map');
    },
    events() {
      return {
        'click div.mgc-store-wrapper': 'showInfoWindow',
      };
    },
  }),
  initMarkers() {
    // create each marker from model.lat and model.lng;
    window.markersSeedObj = [];
    let centerMoved = false;
    this.collection.models.forEach((model) => {
      const location = model.get('geoLocation');
      window.markersSeedObj.push(location);
      if (!centerMoved && location) {
        centerMoved = true;
        window.mapOptions.center.lat = location.latitude;
        window.mapOptions.center.lng = location.longitude;
      }
    });
    if ((this.collection.models.length === 1 && this.collection.models[0].get('id')) || this.collection.models.length > 1) {
      this.mapInitialized = true;
    } else {
      this.mapInitialized = false;
    }
  },
  mapInitialized: false,
  onRender() {
    // onRender is being called twice. Once when the above executes, then when the fetch is successful
    if ((!this.mapInitialized && this.collection.models.length >= 1) || reInitializeMap) {
      this.initMarkers();
      if (window.google && window.google.maps) {
        window.initGmaps();
      }
      reInitializeMap = false;
    }
  },
  events() {
    return {
      'click button.x': 'onClose',
      'click li': 'onClickChild',
      'click button.getDirections': 'getStoreDirections',
      'click button.store-directions': 'getStoreDirections',
    };
  },
  onClose(event) {
    event.stopPropagation();
    // sets the variable for the old view to be restored
    showSingleStore = false;
    this.render();

    $('#charities-map').removeClass('mgc-show');
    $('.mgc-banner-1').removeClass('map');
  },
  onClickChild(event) {
    // when one of these gets clicked,
    // update the marker to active
    // show the store details instead of all the store results
    showSingleStore = true;
    // trigger the render

    this.render();

    const storeNumber = $(event.currentTarget).children('div').data('storenum');

    $('.floatingList').addClass('map');

    this.$el.find('.floatingList .store-details-wrapper').each(function () {
      const storenum = $(this).data('storenum');
      if (storenum === storeNumber) {
        $(this).parent('li').addClass('active');
      } else {
        $(this).parent('li').addClass('hidden');
      }
    });
  },
});

export default storeView;
