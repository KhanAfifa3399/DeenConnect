import styles from './Select.module.css';

function Select({ label, error, id, options = [], placeholder, ...rest }) {
  const selectClass = [styles.select, error ? styles.errorSelect : ''].filter(Boolean).join(' ');

  return (
    <div className={styles.wrapper}>
      {label && <label htmlFor={id} className={styles.label}>{label}</label>}
      <select id={id} className={selectClass} {...rest}>
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      {error && <span className={styles.errorText}>{error}</span>}
    </div>
  );
}

export default Select;