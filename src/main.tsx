import { createRoot } from 'react-dom/client'
import { ChakraProvider } from '@chakra-ui/react';
import system  from './theme'
import '@fontsource-variable/space-grotesk';
import './index.css'
import App from './App.tsx'
import './i18n'; 
import { StrictMode } from "react";
import { BrowserRouter } from 'react-router-dom';

createRoot(document.getElementById("root")!).render(
  
    <ChakraProvider value={system}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ChakraProvider>
  
);
