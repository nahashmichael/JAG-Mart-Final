import { useEffect } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider } from './components/auth/AuthProvider';
import { AppRoutes } from './routes';
import { useNavigationStore } from './lib/store/navigation';

function App() {
  const fetchNavigation = useNavigationStore((state) => state.fetchNavigation);

  useEffect(() => {
    fetchNavigation();
  }, [fetchNavigation]);

  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
}

export default App;