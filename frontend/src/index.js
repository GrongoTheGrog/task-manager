import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './components/app/App';
import { SiteDefinitions } from './context/siteDefinitions';
import { BrowserRouter } from 'react-router-dom';


const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <SiteDefinitions>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </SiteDefinitions>
);
