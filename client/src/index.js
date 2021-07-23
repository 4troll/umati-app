import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import registerServiceWorker from './registerServiceWorker';


import LogRocket from 'logrocket';
LogRocket.init('os3mrd/umati-app');

ReactDOM.render(<App />, document.getElementById('root'));
registerServiceWorker();
