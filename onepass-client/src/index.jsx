import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import store from './store';
import { Provider } from 'react-redux';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import WebSessionHandler from './webSessionHandler';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
	<BrowserRouter>
		<React.StrictMode>
			<Provider store={store}>
				<WebSessionHandler app={<App />} />
			</Provider>
		</React.StrictMode>
	</BrowserRouter>
);
