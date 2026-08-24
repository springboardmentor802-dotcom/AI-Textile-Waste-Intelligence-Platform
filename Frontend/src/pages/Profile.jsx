import { useState } from 'react';
import { User, Mail, Shield, Hash, Check, AlertCircle } from 'lucide-react';
import { getCurrentUser, updateCurrentUser } from '../services/api';
import './Dashboard.css';
import Topbar from '../components/Topbar';
import './Profile.css';

/* ---------------------------------------------------------
   Converts backend role values (users.role column) into the
   human-readable labels used everywhere else user-facing --
   same four roles as schemas.UserRole in the backend.
---------------------------------------------------------- */
const ROLE_LABELS = {
  administrator: 'Administrator',
  recycling_facility_operator: 'Recycling Facility Operator',
  sustainability_manager: 'Sustainability Manager',
  textile_manufacturer: 'Textile Manufacturer',
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function Profile() {
  const storedUser = getCurrentUser();

  const [fullName, setFullName] = useState(storedUser?.full_name || '');
  const [email, setEmail] = useState(storedUser?.email || '');
  const [role] = useState(storedUser?.role || '');
  const [userId] = useState(storedUser?.id ?? '');

  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  const displayRole = ROLE_LABELS[role] || role || 'User';

  function validate() {
    const errors = {};
    const trimmedName = fullName.trim();
    const trimmedEmail = email.trim();

    if (!trimmedName) {
      errors.fullName = 'Full name is required.';
    } else if (trimmedName.length > 100) {
      errors.fullName = 'Full name is too long (max 100 characters).';
    }

    if (!trimmedEmail) {
      errors.email = 'Email is required.';
    } else if (!EMAIL_PATTERN.test(trimmedEmail)) {
      errors.email = 'Enter a valid email address.';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleSave(e) {
    e.preventDefault();
    setSuccessMsg('');
    setErrorMsg('');

    if (!validate()) {
      return;
    }

    setSaving(true);
    try {
      const updated = await updateCurrentUser({
        full_name: fullName.trim(),
        email: email.trim(),
      });
      setFullName(updated.full_name);
      setEmail(updated.email);
      setSuccessMsg('Profile updated successfully.');
    } catch (err) {
      setErrorMsg(err.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="dash-shell">
      <Topbar className="topbar-profile" />
      <main className="dash-page">
        <section className="dashboard-section profile-page">
          <div className="section-heading">
            <div>
              <h2>Profile Information</h2>
              <p>Update your personal information. These details are used across the platform.</p>
            </div>
          </div>

          <form className="profile-card" onSubmit={handleSave}>
            <div className="profile-card-header">
              <div className="profile-avatar">
                <User size={26} />
              </div>
              <div>
                <div className="profile-name">{fullName || 'User'}</div>
                <div className="profile-role-badge">{displayRole}</div>
              </div>
            </div>

            {successMsg && (
              <div className="profile-alert profile-alert-success">
                <Check size={16} />
                <span>{successMsg}</span>
              </div>
            )}
            {errorMsg && (
              <div className="profile-alert profile-alert-error">
                <AlertCircle size={16} />
                <span>{errorMsg}</span>
              </div>
            )}

            <div className="profile-form-fields">
              <label className="profile-form-field">
                <span className="profile-field-label">
                  <User size={15} strokeWidth={1.8} /> Full Name
                </span>
                <input
                  type="text"
                  className={`profile-input ${fieldErrors.fullName ? 'profile-input-error' : ''}`}
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Your full name"
                  maxLength={100}
                />
                {fieldErrors.fullName && (
                  <span className="profile-field-error">{fieldErrors.fullName}</span>
                )}
              </label>

              <label className="profile-form-field">
                <span className="profile-field-label">
                  <Mail size={15} strokeWidth={1.8} /> Email Address
                </span>
                <input
                  type="email"
                  className={`profile-input ${fieldErrors.email ? 'profile-input-error' : ''}`}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                />
                {fieldErrors.email && (
                  <span className="profile-field-error">{fieldErrors.email}</span>
                )}
              </label>

              <label className="profile-form-field">
                <span className="profile-field-label">
                  <Shield size={15} strokeWidth={1.8} /> Role
                </span>
                <input
                  type="text"
                  className="profile-input profile-input-readonly"
                  value={displayRole}
                  readOnly
                  disabled
                />
              </label>

              <label className="profile-form-field">
                <span className="profile-field-label">
                  <Hash size={15} strokeWidth={1.8} /> User ID
                </span>
                <input
                  type="text"
                  className="profile-input profile-input-readonly"
                  value={userId}
                  readOnly
                  disabled
                />
              </label>
            </div>

            <div className="profile-actions">
              <button type="submit" className="profile-save-btn" disabled={saving}>
                {saving ? 'Saving…' : 'Save Changes'}
              </button>
            </div>
          </form>
        </section>
      </main>
    </div>
  );
}

export default Profile;