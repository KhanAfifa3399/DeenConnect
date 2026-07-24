import { logout } from '../utils/auth';
import { useNavigate } from 'react-router-dom';
import Button from '../components/Button/Button';

function Dashboard() {
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <div style={{ padding: '40px' }}>
      <h1>Dashboard</h1>
      <p>Welcome, Admin. This is a placeholder — we'll build the real dashboard next.</p>
      <Button variant="outline" onClick={handleLogout}>Log Out</Button>
    </div>
  );
}

export default Dashboard;