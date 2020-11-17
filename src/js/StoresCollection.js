import $ from 'jquery';
import { Collection } from 'backbone';


let url = '';
export default Collection.extend({
  url() {
    let searchParam = this.searchLocation;
    /* change search param to zip code 10001 since 10120 and 10015 are not working with stores API */
    if (searchParam === '10120' || searchParam === '10015') {
      searchParam = 10001;
    }
    // use case if the user enters location data
    if (searchParam) {
      url = `https://www.macys.com/CE/api/store/v2/stores?searchAddress=${searchParam}`;
    } else {
      // if the users location can be determined by the cookie from Akamai
      url = `https://www.macys.com/CE/api/store/v2/stores?latitude=${this.latLong.split(',')[0]}&longitude=${this.latLong.split(',')[1]}`;
    }
    return url;
  },
  parse(response) {
    const StoreList = JSON.parse($('script[data-bootstrap="campaign/make-good-cents"]').html() || '{}');
    const dressFinderLocation = [];
    if (response && response.stores && response.stores.store) {
      response.stores.store.forEach((storeData) => {
        if (StoreList && StoreList[storeData.storeNumber]) {
          dressFinderLocation.push(storeData);
        }
      });
    }
    if (dressFinderLocation.length === 0) {
      dressFinderLocation.push({ nostore: true });
    }
    return dressFinderLocation;
  },
});
