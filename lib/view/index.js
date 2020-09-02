'use babel';

import React from 'react';

export default class Root extends React.PureComponent {
  constructor(props){
    super(props);
  }

  render() {
		return (
			<div className="jiosaavnframe">
        <iframe className="song"
        src="https://www.jiosaavn.com/"
        frameBorder="0"
        allowtransparency="true"
        allow="encrypted-media">
        </iframe>
			</div>
		);
	}
}
