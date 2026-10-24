import { FaFacebookF, FaInstagram, FaLinkedinIn, FaXTwitter } from 'react-icons/fa6';
import OpenInNewRounded from '@mui/icons-material/OpenInNewRounded';
import { socialProfiles } from './portfolio';

const icons = { linkedin: FaLinkedinIn, facebook: FaFacebookF, instagram: FaInstagram, twitter: FaXTwitter };

export function SocialLinks() {
  return (
    <div className="social-links">
      <p className="social-intro">Let&apos;s connect. Example accounts are shown below.</p>
      <div className="social-grid">
        {socialProfiles.map((profile) => {
          const Icon = icons[profile.platform];
          return <a key={profile.platform} className={`social-card social-${profile.platform}`} href={profile.url} target="_blank" rel="noopener noreferrer" aria-label={`${profile.label} example profile (opens in a new tab)`}>
            <span className="social-icon"><Icon aria-hidden="true" /></span>
            <span className="social-details"><strong>{profile.label}</strong><span>{profile.handle}</span><small>Example profile</small></span>
            <OpenInNewRounded className="social-open" aria-hidden="true" />
          </a>;
        })}
      </div>
    </div>
  );
}
