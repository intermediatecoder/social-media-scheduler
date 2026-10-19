import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import './index.css';

async function enableMocking() {
  const { worker } = await import('./mocks/browser');
  return worker.start({
    onUnhandledRequest(request) {
      if (new URL(request.url).pathname.startsWith('/api/')) {
        console.error(`No mock API handler found for ${request.method} ${request.url}`);
      }
    },
  });
}

enableMocking().then(() => {
  ReactDOM.createRoot(document.getElementById('app')!).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
});
