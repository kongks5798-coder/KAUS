import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { logEnvironmentStatus } from './services/envValidator';
import { jobQueueService } from './services/jobQueue';

logEnvironmentStatus();

jobQueueService.startWorker(2000);

jobQueueService.processJobs().catch(error => {
  console.error('Initial job processing failed:', error);
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
