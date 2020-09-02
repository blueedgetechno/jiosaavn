'use babel';

import JiosaavnView from './jiosaavn-view';
import JiosaavnViewIcon from './jiosaavn-view-icon'

import {
  CompositeDisposable,
  Disposable
} from 'atom';

export default {

  subscriptions: null,

  activate(state) {
    this.subscriptions = new CompositeDisposable(
      atom.workspace.addOpener(uri => {
        if (uri === 'atom://jiosaavn')
          return new JiosaavnView();
      }),

      atom.commands.add('atom-workspace', {
        'jiosaavn:toggle': () => this.toggle()
      }),

      new Disposable(() => {
        atom.workspace.getPaneItems().forEach(item => {
          if (item instanceof JiosaavnView) {
            item.destroy();
          }
        })
      })
    );
  },

  consumeStatusBar(statusBar) {
     this.statusBar = statusBar
     this.toggleIcon()
  },

  toggleIcon() {
    console.log("Yep");
    this.icon = new JiosaavnViewIcon({ onClick: this.toggle.bind(this) })
    this.statusBar.addRightTile({
       item: this.icon.element,
       priority: -500
    })
  },

  deactivate() {
    this.subscriptions.dispose();
  },

  toggle() {
    atom.workspace.toggle('atom://jiosaavn');
  }
};
