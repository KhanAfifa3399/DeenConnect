import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../api/authApi';
import toast from 'react-hot-toast';

// Simplified Button import or use a local component
import Button from '../components/Button/Button';

// Import updated CSS
import styles from './Login.module.css';

// Assuming you keep an image for the gradient overlay effect, 
// but we will generate the gradient with CSS.
import cardImg from '../assets/login-card-img.png';

function Login() {
  const [email, setEmail] = useState(); // Placeholder from reference
  const [password, setPassword] = useState(); // Placeholder from reference
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Logic from your original code
      const result = await login(email, password);
      localStorage.setItem('token', result.data.token);
      localStorage.setItem('user', JSON.stringify(result.data.user));
      toast.success(`Welcome back, ${result.data.user.full_name}!`);
      navigate('/dashboard');
    } catch (err) {
      const message = err.response?.data?.message || 'Something went wrong. Please try again.';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.container}>

        {/* LEFT SIDE - BRAND CARD */}
        <div className={styles.brandCard}>
          <div className={styles.brandCardContent}>
            <div className={styles.brandText}>
              <p className={styles.brandSubHeading}>RF LEARNING • ADMIN</p>
              <h1 className={styles.brandHeading}>
                Seek Knowledge. <br />
                Grow with Maqsad.
              </h1>
            </div>
          </div>
        </div>

        {/* RIGHT SIDE - FORM */}
        <div className={styles.formCard}>
          <div className={styles.formContent}>

            <div className={styles.logoIcon} style={{ color: 'var(--color-primary)' }}>
              {/* Same logo, now colored for the form side */}
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2V22M2 12H22M19.07 4.93L4.93 19.07M19.07 19.07L4.93 4.93" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>

            <h2 className={styles.formTitle}>Marhaba, Admin</h2>
            <p className={styles.formSubtitle}>
              Sign in to manage your learning platform and keep everything running smoothly.          </p>

            <form onSubmit={handleSubmit} className={styles.form}>

              {/* Field 1: Email */}
              <div className={styles.field}>
                <label htmlFor="email" className={styles.label}>Your email</label>
                <input
                  id="email"
                  type="email"
                  className={styles.input}
                  placeholder="Enter your admin email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              {/* Field 2: Password with eye icon */}
              <div className={styles.field}>
                <div className={styles.labelRow}>
                  <label htmlFor="password" className={styles.label}>Password</label>
                </div>
                <div className={styles.inputWrapper}>
  <input
    id="password"
    type={showPassword ? 'text' : 'password'}
    className={styles.input}
    placeholder="••••••••"
    value={password}
    onChange={(e) => setPassword(e.target.value)}
    required
  />
  <button 
    type="button" 
    className={styles.eyeButton}
    onClick={() => setShowPassword((prev) => !prev)}
    aria-label={showPassword ? "Hide password" : "Show password"}
  >
    {showPassword ? (
      /* Eye Off Icon */
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
        <line x1="1" y1="1" x2="23" y2="23"></line>
      </svg>
    ) : (
      /* Eye Icon */
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    )}
  </button>
</div>
              </div>

              {error && <p className={styles.errorText}>{error}</p>}

              {/* Primary Action Button - Uses brand color */}
              <Button
                type="submit"
                variant="primary" // Assuming primary uses --color-primary
                disabled={loading}
                className={styles.submitButton}
              >
                {loading ? 'Starting...' : 'Get Started'}
              </Button>
            </form>

            {/* Social Logins - As seen in image */}
            <div className={styles.separator}>
              <span className={styles.separatorText}>RF Learning Admin Portal</span>
            </div>

            

            {/* Footer */}
            <p className={styles.formFooter}>
              Don't have an account? <a href="/signup" className={styles.footerLink}>Sign up</a>
            </p>

          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;