'use babel';

import React from 'react';
import ReactDOM from 'react-dom';
import Root from './view/index'

export default class JiosaavnView {

  constructor(serializedState) {
    // Create root element
    this.element = document.createElement('div');

    this.element.classList.add('jiosaavn');

    ReactDOM.render(<div> <Root/></div>, this.element);
  }

  serialize() {}

  destroy() {
    var btn = this.element.children[0].children[0].children[0];
    btn.click();
    this.element.remove();
  }

  getElement() {
    return this.element;
  }

  getTitle() {
    return 'JioSaavn';
  }

  getURI() {
    return 'atom://jiosaavn';
  }

  getDefaultLocation() {
    return 'right';
  }

  getAllowedLocations() {
    return ['left', 'right'];
  }
}
