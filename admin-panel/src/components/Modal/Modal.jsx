import { FiX } from 'react-icons/fi';
import styles from './Modal.module.css';

function Modal({ title, onClose, children, wide = false }) {
  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={wide ? `${styles.modal} ${styles.modalWide}` : styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>{title}</h2>
          <button className={styles.closeButton} onClick={onClose}>
            <FiX />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export default Modal;