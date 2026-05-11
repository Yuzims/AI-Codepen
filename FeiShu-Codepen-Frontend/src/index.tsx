import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { perf } from './services/perfSDK';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

reportWebVitals((metric) => {
  perf.record(metric.name.toLowerCase() as any, metric.value);
  if (process.env.NODE_ENV === 'development') {
    console.log(`[WebVitals] ${metric.name}: ${metric.value.toFixed(1)}ms`);
  }
});
