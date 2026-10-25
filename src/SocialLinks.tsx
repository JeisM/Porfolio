import { FaFacebookF, FaGithub, FaInstagram, FaLinkedinIn, FaXTwitter } from 'react-icons/fa6';
import OpenInNewRounded from '@mui/icons-material/OpenInNewRounded';
import EmailOutlined from '@mui/icons-material/EmailOutlined';
import PhoneOutlined from '@mui/icons-material/PhoneOutlined';
import { portfolio, socialProfiles } from './portfolio';

const icons = { linkedin: FaLinkedinIn, facebook: FaFacebookF, instagram: FaInstagram, twitter: FaXTwitter, github: FaGithub };

export function SocialLinks() {
  return (
    <div className="social-links">
      <p className="social-intro">Let&apos;s connect. Find me on LinkedIn, Facebook, and GitHub, or reach me directly by email or phone.</p>
      <div className="social-grid">
        <a className="social-card social-email" href={`mailto:${portfolio.email}`}>
          <span className="social-icon"><EmailOutlined aria-hidden="true" /></span>
          <span className="social-details"><strong>Email</strong><span>{portfolio.email}</span></span>
        </a>
        <a className="social-card social-phone" href={`tel:${portfolio.phone}`}>
          <span className="social-icon"><PhoneOutlined aria-hidden="true" /></span>
          <span className="social-details"><strong>Phone</strong><span>{portfolio.phone}</span></span>
        </a>
        {socialProfiles.map((profile) => {
          const Icon = icons[profile.platform];
          return <a key={profile.platform} className={`social-card social-${profile.platform}`} href={profile.url} target="_blank" rel="noopener noreferrer" aria-label={`${profile.label} (opens in a new tab)`}>
            <span className="social-icon"><Icon aria-hidden="true" /></span>
            <span className="social-details"><strong>{profile.label}</strong><span>{profile.handle}</span><small>Opens in a new tab</small></span>
            <OpenInNewRounded className="social-open" aria-hidden="true" />
          </a>;
        })}
      </div>
    </div>
  );
}
