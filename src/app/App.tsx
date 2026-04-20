import { RouterProvider } from 'react-router';
import { router } from './routes';
import { AuthProvider } from './context/AuthContext';
import { DataProvider } from './context/DataContext';
import { AestheticProvider } from './context/ThemeContext';
import { Toaster } from 'sonner';

export default function App() {
  return (

    <AuthProvider>
      <AestheticProvider>
        <DataProvider>
          <RouterProvider router={router} />
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#ffffff',
              color: '#0f172a',
              border: '1px solid #e2e8f0',
              borderRadius: '16px',
              fontSize: '14px',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
            },
          }}
        />
      </DataProvider>
      </AestheticProvider>
    </AuthProvider>
  );
}
