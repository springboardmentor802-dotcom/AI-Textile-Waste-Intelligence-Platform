import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Lock, Bell, Palette, LogOut, Check, AlertCircle, ChevronDown, ChevronUp,
} from 'lucide-react';
import { getCurrentUser, logoutUser, changePassword } from '../services/api';
import { paletteVars } from '../constants/palette';
import Topbar from '../components/Topbar';
import './Dashboard.css';
import './Setting.css';

/* ---------------------------------------------------------
   Notifications and Appearance are NOT backed by any server
   API -- there is no notification system and no theme system
   in this backend today. Both are stored as per-user
   localStorage preferences only, keyed by the logged-in
   user's id so switching accounts on the same browser doesn't
   leak one user's preference into another's view.
---------------------------------------------------------- */
function notificationsKey(userId) {
  return `notifications_enabled_${userId ?? 'anon'}`;
}
function appearanceKey(userId) {
  return `appearance_${userId ?? 'anon'}`;
}

function Settings() {
  const navigate = useNavigate();
  const user = getCurrentUser();

  // ---- Change Password ----
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwSaving, setPwSaving] = useState(false);
  const [pwSuccess, setPwSuccess] = useState('');
  const [pwError, setPwError] = useState('');
  const [pwFieldErrors, setPwFieldErrors] = useState({});

  // ---- Notifications (local preference only) ----
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [notifSaved, setNotifSaved] = useState(false);

  // ---- Appearance (local preference only, scoped to this page) ----
  const [appearance, setAppearance] = useState('light');

  useEffect(() => {
    const storedNotif = localStorage.getItem(notificationsKey(user?.id));
    if (storedNotif !== null) {
      setNotificationsEnabled(storedNotif === 'true');
    }
    const storedAppearance = localStorage.getItem(appearanceKey(user?.id));
    if (storedAppearance === 'dark' || storedAppearance === 'light') {
      setAppearance(storedAppearance);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleToggleNotifications() {
    const next = !notificationsEnabled;
    setNotificationsEnabled(next);
    localStorage.setItem(notificationsKey(user?.id), String(next));
    setNotifSaved(true);
    setTimeout(() => setNotifSaved(false), 1500);
  }

  function handleAppearanceChange(value) {
    setAppearance(value);
    localStorage.setItem(appearanceKey(user?.id), value);
  }

  function validatePasswordForm() {
    const errors = {};
    if (!currentPassword) {
      errors.currentPassword = 'Current password is required.';
    }
    if (!newPassword) {
      errors.newPassword = 'New password is required.';
    } else if (newPassword.length < 8) {
      errors.newPassword = 'New password must be at least 8 characters.';
    }
    if (!confirmPassword) {
      errors.confirmPassword = 'Please confirm your new password.';
    } else if (newPassword && confirmPassword !== newPassword) {
      errors.confirmPassword = 'Passwords do not match.';
    }
    setPwFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleChangePassword(e) {
    e.preventDefault();
    setPwSuccess('');
    setPwError('');

    if (!validatePasswordForm()) {
      return;
    }

    setPwSaving(true);
    try {
      await changePassword(currentPassword, newPassword);
      setPwSuccess('Password changed successfully.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setPwFieldErrors({});
    } catch (err) {
      setPwError(err.message || 'Failed to change password.');
    } finally {
      setPwSaving(false);
    }
  }

  function handleLogout() {
    logoutUser();
    navigate('/login');
  }

  const pageClass = `dashboard-section settings-page ${appearance === 'dark' ? 'appearance-dark' : ''}`;

  return (
    <div className="dash-shell">
      <Topbar />

      <main className="dash-page">
        

        <section className={pageClass} style={paletteVars('teal')}>
          <div className="section-heading">
            <div>
              <h2>Account Settings</h2>
              <p>Manage your password, notifications, appearance, and session.</p>
            </div>
          </div>

          {/* CHANGE PASSWORD */}
          <div className="settings-card">
            <button
              type="button"
              className="settings-row"
              onClick={() => setShowPasswordForm((v) => !v)}
              aria-expanded={showPasswordForm}
            >
              <span className="settings-row-icon">
                <Lock size={18} strokeWidth={1.8} />
              </span>
              <span className="settings-row-text">
                <span className="settings-row-title">Change Password</span>
                <span className="settings-row-desc">Update your password and keep your account secure.</span>
              </span>
              {showPasswordForm ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </button>

            {showPasswordForm && (
              <form className="settings-password-form" onSubmit={handleChangePassword}>
                {pwSuccess && (
                  <div className="settings-alert settings-alert-success">
                    <Check size={16} />
                    <span>{pwSuccess}</span>
                  </div>
                )}
                {pwError && (
                  <div className="settings-alert settings-alert-error">
                    <AlertCircle size={16} />
                    <span>{pwError}</span>
                  </div>
                )}

                <label className="settings-form-field">
                  <span className="settings-field-label">Current Password</span>
                  <input
                    type="password"
                    className={`settings-input ${pwFieldErrors.currentPassword ? 'settings-input-error' : ''}`}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    autoComplete="current-password"
                  />
                  {pwFieldErrors.currentPassword && (
                    <span className="settings-field-error">{pwFieldErrors.currentPassword}</span>
                  )}
                </label>

                <label className="settings-form-field">
                  <span className="settings-field-label">New Password</span>
                  <input
                    type="password"
                    className={`settings-input ${pwFieldErrors.newPassword ? 'settings-input-error' : ''}`}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    autoComplete="new-password"
                  />
                  {pwFieldErrors.newPassword && (
                    <span className="settings-field-error">{pwFieldErrors.newPassword}</span>
                  )}
                </label>

                <label className="settings-form-field">
                  <span className="settings-field-label">Confirm New Password</span>
                  <input
                    type="password"
                    className={`settings-input ${pwFieldErrors.confirmPassword ? 'settings-input-error' : ''}`}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    autoComplete="new-password"
                  />
                  {pwFieldErrors.confirmPassword && (
                    <span className="settings-field-error">{pwFieldErrors.confirmPassword}</span>
                  )}
                </label>

                <div className="settings-form-actions">
                  <button type="submit" className="settings-primary-btn" disabled={pwSaving}>
                    {pwSaving ? 'Changing…' : 'Change Password'}
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* NOTIFICATIONS */}
          <div className="settings-card">
            <div className="settings-row settings-row-static">
              <span className="settings-row-icon">
                <Bell size={18} strokeWidth={1.8} />
              </span>
              <span className="settings-row-text">
                <span className="settings-row-title">Notifications</span>
                <span className="settings-row-desc">
                  Manage in-app notification preferences on this device. This is a local
                  display preference only — the platform does not currently send email or
                  push notifications.
                </span>
              </span>
              <button
                type="button"
                role="switch"
                aria-checked={notificationsEnabled}
                className={`settings-toggle ${notificationsEnabled ? 'settings-toggle-on' : ''}`}
                onClick={handleToggleNotifications}
              >
                <span className="settings-toggle-knob" />
              </button>
            </div>
            {notifSaved && <div className="settings-inline-saved">Preference saved.</div>}
          </div>

          {/* APPEARANCE */}
          <div className="settings-card">
            <div className="settings-row settings-row-static">
              <span className="settings-row-icon">
                <Palette size={18} strokeWidth={1.8} />
              </span>
              <span className="settings-row-text">
                <span className="settings-row-title">Appearance</span>
                <span className="settings-row-desc">
                  Customize the appearance of this Profile and Settings page. Other pages
                  are unaffected.
                </span>
              </span>
            </div>
            <div className="settings-appearance-options">
              <button
                type="button"
                className={`settings-appearance-btn ${appearance === 'light' ? 'settings-appearance-active' : ''}`}
                onClick={() => handleAppearanceChange('light')}
              >
                Light
              </button>
              <button
                type="button"
                className={`settings-appearance-btn ${appearance === 'dark' ? 'settings-appearance-active' : ''}`}
                onClick={() => handleAppearanceChange('dark')}
              >
                Dark
              </button>
            </div>
          </div>

          {/* LOG OUT */}
          <div className="settings-card">
            <div className="settings-row settings-row-static">
              <span className="settings-row-icon">
                <LogOut size={18} strokeWidth={1.8} />
              </span>
              <span className="settings-row-text">
                <span className="settings-row-title">Log Out</span>
                <span className="settings-row-desc">Sign out from your account.</span>
              </span>
              <button type="button" className="settings-logout-btn" onClick={handleLogout}>
                Log Out
              </button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default Settings;
