import { createRoot } from 'react-dom/client'
import { ChakraProvider } from '@chakra-ui/react';
import system  from './theme'
import '@fontsource-variable/space-grotesk';
import './index.css'
import App from './App.tsx'
import './i18n'; 
import { StrictMode } from "react";
import { BrowserRouter } from 'react-router-dom';
import { PasskeyProvider } from './parent-app/context/passkeyContext.tsx';
import { AuthdStudentDataProvider } from './student-app/context/studentDataContext.tsx';
import { DataProvider } from './student-app/context/dataContext.tsx';


createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <PasskeyProvider>
      <AuthdStudentDataProvider>
        <DataProvider>
          <ChakraProvider value={system}>
            <BrowserRouter>
              <App />
            </BrowserRouter>
          </ChakraProvider>
        </DataProvider>
      </AuthdStudentDataProvider>
    </PasskeyProvider>
  </StrictMode>
);
