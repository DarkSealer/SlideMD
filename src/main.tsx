import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import 'katex/dist/katex.min.css';
import './index.css';
import { registerSW } from 'virtual:pwa-register';

// Register PWA service worker with immediate check
registerSW({ immediate: true });

createRoot(document.getElementById('root')!).render(<App />);

