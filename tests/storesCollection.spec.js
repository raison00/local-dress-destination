import $ from 'jquery';
import StoresCollection from '../src/js/StoresCollection';

let storeCollection;
const validResponse = {
  stores: {
    store: [{
      storeNumber: '001',
    }],
  },
};
const invalidResponse = {
  stores: {
    store: [{
      storeNumber: '002',
    }],
  },
};
describe('Store collection', () => {
  beforeEach(() => {
    $('body').html('<script type="application/json" data-bootstrap="campaign/make-good-cents">{"001":true}</script>');
    storeCollection = new StoresCollection();
  });
  it('parse with valid response', () => {
    const result = storeCollection.parse(validResponse);
    expect(result[0].storeNumber).toBe('001');
  });
  it('parse with invalid response', () => {
    const result = storeCollection.parse(invalidResponse);
    expect(result[0].nostore).toBe(true);
  });
});
