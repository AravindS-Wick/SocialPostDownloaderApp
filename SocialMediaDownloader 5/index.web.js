import { registerRootComponent } from 'expo';
import { createRoot } from 'react-dom/client';
import App from './App';
import 'react-native-gesture-handler';

// Register for Expo Go
registerRootComponent(App);

// For web direct rendering
const root = createRoot(document.getElementById('root') || document.createElement('div'));
root.render(<App />);