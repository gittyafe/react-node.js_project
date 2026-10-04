import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from './App';
import { LoadingSpinner } from './components/LoadingSpinner';
import { NotFound } from './pages/NotFound';

const navigateTo = (route: string) => {
  window.history.pushState({}, '', route);
};

describe('Frontend UX and route behavior', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('renders the login page heading', () => {
    navigateTo('/login');
    render(<App />);

    expect(screen.getByRole('heading', { name: /התחברות/i })).toBeInTheDocument();
  });

  it('shows the register link on the login page', () => {
    navigateTo('/login');
    render(<App />);

    expect(screen.getByRole('link', { name: /הירשם כאן/i })).toBeInTheDocument();
  });

  it('renders the not found page for an unknown route', () => {
    navigateTo('/missing-page');
    render(<App />);

    expect(screen.getByRole('heading', { name: /עמוד לא נמצא/i })).toBeInTheDocument();
  });

  it('shows a friendly loading state while auth is preparing', () => {
    render(<LoadingSpinner label="Preparing your session..." />);

    expect(screen.getByRole('status')).toHaveTextContent(/Preparing your session/i);
  });

  it('renders the not found fallback with a helpful CTA', () => {
    render(
      <MemoryRouter>
        <NotFound />
      </MemoryRouter>
    );

    expect(screen.getByRole('link', { name: /חזרה לדשבורד/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /להתחברות/i })).toBeInTheDocument();
  });
});
