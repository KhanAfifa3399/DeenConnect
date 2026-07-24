import styles from './Button.module.css';

function Button({
  children,
  variant = 'primary',
  size,
  onClick,
  disabled = false,
  type = 'button',
  ...rest
}) {
  const classNames = [
    styles.button,
    styles[variant],
    size ? styles[size] : '',
  ].filter(Boolean).join(' ');

  return (
    <button
      type={type}
      className={classNames}
      onClick={onClick}
      disabled={disabled}
      {...rest}
    >
      {children}
    </button>
  );
}

export default Button;