import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/Button/Button';
import { login } from '../api/authApi';
import styles from './Login.module.css';
import cardImg from '../assets/login-card-img.png';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await login(email, password);
      localStorage.setItem('token', result.data.token);
      localStorage.setItem('user', JSON.stringify(result.data.user));
      navigate('/dashboard');
    } catch (err) {
      const message = err.response?.data?.message || 'Invalid credentials';
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.page}>

      <div className={styles.composition}>
        <div className={styles.photoCard}>
          <img
            src={cardImg}
            alt=""
            className={styles.photoImage}
          />
          <div className={styles.photoOverlay} />
          <h1 className={styles.photoHeading}>Marhaba to<br />Rehman Foundation</h1>
          <span className={styles.photoLink}>Sign In  </span>
        </div>

        <div className={styles.formCard}>
          

          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.field}>
              <label htmlFor="email" className={styles.underlineLabel}>E-MAIL</label>
              <input
                id="email"
                type="email"
                className={styles.underlineInput}
                placeholder="Your email goes here"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className={styles.field}>
              <label htmlFor="password" className={styles.underlineLabel}>PASSWORD</label>
              <input
                id="password"
                type="password"
                className={styles.underlineInput}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {error && <p className={styles.errorText}>{error}</p>}

            <Button type="submit" variant="secondary" disabled={loading} className={styles.submitButton}>
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Login;