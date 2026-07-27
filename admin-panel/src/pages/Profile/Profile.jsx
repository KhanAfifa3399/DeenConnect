import { useState, useRef } from 'react';
import { FiCamera, FiMail, FiPhone, FiCalendar, FiShield } from 'react-icons/fi';
import Card from '../../components/Card/Card';
import Input from '../../components/Input/Input';
import Button from '../../components/Button/Button';
import { getUser } from '../../utils/auth';
import { getFileUrl } from '../../utils/urls';
import { updateUser, changePassword, uploadProfilePhoto } from '../../api/usersApi';
import styles from '../Subjects/Subjects.module.css';
import profileStyles from './Profile.module.css';

function Profile() {
  const [user, setUser] = useState(getUser());
  const fileInputRef = useRef(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  const [fullName, setFullName] = useState(user?.full_name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [profileMsg, setProfileMsg] = useState('');
  const [profileError, setProfileError] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordMsg, setPasswordMsg] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);

  function persistUser(patch) {
    const updated = { ...user, ...patch };
    setUser(updated);
    localStorage.setItem('user', JSON.stringify(updated));
  }

  async function handlePhotoSelect(e) {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingPhoto(true);
    const formData = new FormData();
    formData.append('photo', file);

    try {
      const result = await uploadProfilePhoto(formData);
      persistUser({ profile_picture: result.profile_picture });
    } catch (err) {
      alert('Failed to upload photo');
    } finally {
      setUploadingPhoto(false);
    }
  }

  async function handleProfileSubmit(e) {
    e.preventDefault();
    setProfileError('');
    setProfileMsg('');
    setSavingProfile(true);
    try {
      const updated = await updateUser(user.id, { full_name: fullName, phone });
      persistUser({ full_name: updated.full_name, phone: updated.phone });
      setProfileMsg('Profile updated successfully.');
    } catch (err) {
      setProfileError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSavingProfile(false);
    }
  }

  async function handlePasswordSubmit(e) {
    e.preventDefault();
    setPasswordError('');
    setPasswordMsg('');

    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }

    setSavingPassword(true);
    try {
      await changePassword(currentPassword, newPassword);
      setPasswordMsg('Password changed successfully.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setPasswordError(err.response?.data?.message || 'Failed to change password');
    } finally {
      setSavingPassword(false);
    }
  }

  return (
    <div className={profileStyles.wrapper}>
      <Card className={profileStyles.headerCard}>
        <div className={profileStyles.avatarWrapper}>
          {user?.profile_picture ? (
            <img src={getFileUrl(user.profile_picture)} alt={user.full_name} className={profileStyles.avatarImg} />
          ) : (
            <div className={profileStyles.avatarFallback}>{user?.full_name?.charAt(0) || 'A'}</div>
          )}
          <button
            type="button"
            className={profileStyles.cameraButton}
            onClick={() => fileInputRef.current.click()}
            disabled={uploadingPhoto}
          >
            <FiCamera />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handlePhotoSelect}
            className={profileStyles.hiddenInput}
          />
        </div>

        <div className={profileStyles.headerInfo}>
          <h2 className={profileStyles.name}>{user?.full_name}</h2>
          <span className={profileStyles.roleBadge}>{user?.role}</span>

          <div className={profileStyles.metaGrid}>
            <div className={profileStyles.metaItem}>
              <FiMail className={profileStyles.metaIcon} />
              <span>{user?.email}</span>
            </div>
            <div className={profileStyles.metaItem}>
              <FiPhone className={profileStyles.metaIcon} />
              <span>{user?.phone || 'No phone on file'}</span>
            </div>
            <div className={profileStyles.metaItem}>
              <FiShield className={profileStyles.metaIcon} />
              <span>Account active</span>
            </div>
          </div>
        </div>
      </Card>

      <div className={profileStyles.formsRow}>
        <Card className={profileStyles.formCard}>
          <h3 className={profileStyles.sectionTitle}>Edit Profile</h3>
          <form onSubmit={handleProfileSubmit} className={styles.modalForm}>
            <Input label="Full Name" id="pFullName" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
            <Input label="Phone" id="pPhone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Add a phone number" />
            {profileMsg && <p className={profileStyles.successText}>{profileMsg}</p>}
            {profileError && <p className={styles.errorText}>{profileError}</p>}
            <Button type="submit" variant="primary" disabled={savingProfile}>
              {savingProfile ? 'Saving...' : 'Save Profile'}
            </Button>
          </form>
        </Card>

        <Card className={profileStyles.formCard}>
          <h3 className={profileStyles.sectionTitle}>Change Password</h3>
          <form onSubmit={handlePasswordSubmit} className={styles.modalForm}>
            <Input label="Current Password" id="pCurrent" type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required />
            <Input label="New Password" id="pNew" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
            <Input label="Confirm New Password" id="pConfirm" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
            {passwordMsg && <p className={profileStyles.successText}>{passwordMsg}</p>}
            {passwordError && <p className={styles.errorText}>{passwordError}</p>}
            <Button type="submit" variant="primary" disabled={savingPassword}>
              {savingPassword ? 'Updating...' : 'Change Password'}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}

export default Profile;