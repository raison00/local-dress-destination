/**
   * Entry point for running the application.
   * Must export an object with a start() method.
   *
   * Since this is a feature, the entry point is only used for running it in isolation.
   * When consumed by a page, the entry point will be defined by the consumer.
   */
import $ from 'jquery';
import Backbone from 'backbone';
import Marionette from 'backbone.marionette';
import '@core/vendor/radio.shim'; // shim app.channel
import Campaign from './src/local-dress-destination';
import './src/scss/local-dress-destination.scss';

const PageApp = new Marionette.Application();

PageApp.getMeta = () => null;

PageApp.on('start', () => {
  if (Backbone.history) {
    PageApp.Feature = new Campaign();


    const mainObject = $('#main');
    if (mainObject.length > 0) {
      PageApp.Feature.init();
    }
  }
});

export default PageApp;
