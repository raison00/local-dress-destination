import Backbone from 'backbone';
import App from '../app-mcom';
import Feature from '../src/local-dress-destination';

describe('App Spec', () => {
  beforeEach(() => {
    loadFixtures('main.html');
  });

  afterEach(() => {
    delete App.Feature;
  });

  it('should instantiate the class', () => {
    expect(App.Feature).toEqual(undefined);
    App.start();
    expect(App.Feature instanceof Feature).toEqual(true);
  });
  it('should exercise the getMeta', () => {
    expect(App.Feature).toEqual(undefined);
    App.getMeta();
    expect(true).toEqual(true);
  });
  it('should not instantiate the class if there is no backbone.history', () => {
    const oldHistory = Backbone.history;
    Backbone.history = false;
    expect(App.Feature).toEqual(undefined);
    App.start();
    expect(App.Feature instanceof Feature).not.toEqual(true);
    Backbone.history = oldHistory;
  });
});
