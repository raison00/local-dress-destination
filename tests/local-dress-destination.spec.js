import $ from 'jquery';
import mockjax from 'jquery-mockjax';
import CampaignClass from '../src/local-dress-destination';
import StoreView from '../src/js/StoreView';
import StoresCollection from '../src/js/StoresCollection';


mockjax($, window);

loadFixtures('googlemaps.html');
// loadFixtures('main.html');
const storesData = loadJSONFixtures('stores-search-response.json')['stores-search-response.json'];

describe('make-good-cents', () => {
  beforeEach((done) => {
    $.mockjax.clear();
    $.mockjax({
      url: '*',
      dataType: 'json',
      status: 200,
      type: 'GET',
      responseText: JSON.stringify(storesData),
    });

    loadFixtures('main.html'); // vanilla to not have google maps errors
    done();
  });

  it('should fetch collection on init', () => {
    $.mockjax({
      url: '*',
      dataType: 'json',
      status: 200,
      type: 'GET',
      success() { return 'success'; },
      responseText: JSON.stringify(storesData),
      onAfterSuccess() {
        expect(StoreView.prototype.render).toHaveBeenCalled();
      },
    });
    spyOn(StoreView.prototype, 'initialize').and.callFake(() => {
    });
    const storeView = new StoreView(); // {collection: jasmine.createSpyObj('collection',['fetch'])});
    expect(storeView.initialize).toHaveBeenCalled();
  });

  it('should not overwrite content when class is instantiated', () => {
    expect($('#floatingList li').length).toEqual(0);
    const campaignClass = new CampaignClass();
    campaignClass.init();
    expect($('#floatingList li').length).toEqual(0);
  });

  // async to allow init > collection fetch > render
  it('should render individual store content when clicked', () => {
    spyOn(StoreView.prototype, 'onClickChild').and.callThrough();

    const storeView = new StoreView();

    $.mockjax({
      url: '*',
      dataType: 'json',
      status: 200,
      type: 'GET',
      success() { return 'success'; },
      responseText: JSON.stringify(storesData),
      onAfterSuccess() {
        $('.floatingList li:first').trigger('click');
        expect(storeView.onClickChild).toHaveBeenCalled();
        expect($('.floatingList.map').length(1));
        // done();
      },
    });
  });


  it('should trigger a re-render of the content with new stores', () => {
    const storeView = new StoreView();
    spyOn(storeView, 'fetchData').and.callFake(() => {
      const foo = 1;
      return foo;
    });

    spyOn(storeView, 'updateSearch').and.callFake(() => {
      const foo = 1;
      return foo;
    });

    $('#profile_location').val('95677');
    $('#submit-location').trigger('click');
    expect(storeView.fetchData).toHaveBeenCalled();
    expect(storeView.updateSearch).toHaveBeenCalled();
  });

  it('should update the views on mobile when form is submitted', () => {
    spyOn(StoreView.prototype, 'updateSearch').and.callThrough();
    const storeView = new StoreView();
    storeView.initialize();

    $('#submit-location').trigger('click');

    // this is the bad test
    expect($('.mgc-search-input.mgc-show').length).toEqual(0);
    expect($('.floatingList.mgc-show').length).toEqual(1);
  });

  it('should show the info window when store is clicked', () => {
    window.google = {
      maps: {
        MapTypeControlStyle: {
          HORIZONTAL_BAR: true,
        },
        MapTypeId: {
          ROADMAP: true,
        },
        Map() {},
        Marker() {},
        InfoWindow() {
          return {
            open() { },
          };
        },
      },
    };

    const storeView = new StoreView();
    storeView.initialize();

    storeView.collection = new StoresCollection(loadJSONFixtures('stores-search-response.json')['stores-search-response.json'].stores.store);

    storeView.render();

    $('div.mgc-store-wrapper').trigger('click');

    expect($('#charities-map').hasClass('mgc-show')).toEqual(true);
    expect($('.mgc-banner-1').hasClass('map')).toEqual(true);
  });

  it('should show map and fetch data when button is clicked', () => {
    const storeView = new StoreView();
    spyOn(storeView, 'fetchData').and.callFake(() => {});
    spyOn(storeView, 'updateSearch').and.callFake(() => {});
    storeView.initialize();
    storeView.render();

    $('#viewOnMap').trigger('click');
    expect(storeView.fetchData).toHaveBeenCalled();
    expect(storeView.updateSearch).toHaveBeenCalled();
  });

  it('should return stores based off user input', () => {
    const storesCollection = new StoresCollection();
    storesCollection.searchLocation = 94017;

    expect(storesCollection.url()).toEqual('https://www.macys.com/CE/api/store/v2/stores?searchAddress=94017');
  });

  it('should search zip 10001 instead of 10120', () => {
    const storesCollection = new StoresCollection();
    storesCollection.searchLocation = '10120';

    expect(storesCollection.url()).toEqual('https://www.macys.com/CE/api/store/v2/stores?searchAddress=10001');
  });
});
