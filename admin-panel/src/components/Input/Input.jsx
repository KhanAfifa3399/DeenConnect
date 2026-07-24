import styles from './Input.module.css';

function Input({ label, error, id, ...rest }) {
  const inputClass = [styles.input, error ? styles.errorInput : ''].filter(Boolean).join(' ');

  return (
    <div className={styles.wrapper}>
      {label && <label htmlFor={id} className={styles.label}>{label}</label>}
      <input id={id} className={inputClass} {...rest} />
      {error && <span className={styles.errorText}>{error}</span>}
    </div>
  );
}

export default Input;