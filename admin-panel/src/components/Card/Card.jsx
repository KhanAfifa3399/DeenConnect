import styles from './Card.module.css';

function Card({ children, glass = false, hoverable = false, className = '', ...rest }) {
  const classNames = [
    styles.card,
    glass ? styles.glass : '',
    hoverable ? styles.hoverable : '',
    className,
  ].filter(Boolean).join(' ');

  return (
    <div className={classNames} {...rest}>
      {children}
    </div>
  );
}

export default Card;