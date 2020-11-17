import FormValidation from '@component/form-validation/src/FormValidation';
import StoreView from './js/StoreView';

const RULES = {
  location: {
    required: true,
  },
};

const ERROR_MSG = {
  location: {
    required: 'Please provide a city, state or ZIP Code.',
  },
};

export default class Feature {
  init() {
    const storeView = new StoreView();
    storeView.render();
    this.view = new FormValidation({
      el: '#location-input',
      rules: RULES,
      errorMessage: ERROR_MSG,
    });
  }
}
