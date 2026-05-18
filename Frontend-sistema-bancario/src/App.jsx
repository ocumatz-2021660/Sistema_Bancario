import { RouterProvider } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { router } from './app/router';
import './index.css';

function App() {
  return (
    <>
      <RouterProvider router={router} />
      <Toaster 
        position="top-right" 
        toastOptions={{
          style: {
            borderRadius: '12px',
            background: '#ffffff',
            color: '#1e293b',
            fontFamily: 'Inter, sans-serif',
            fontSize: '14px',
            fontWeight: '600',
            boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
            border: '1px solid #e2e8f0',
          },
        }}
      />
    </>
  );
}

export default App;
