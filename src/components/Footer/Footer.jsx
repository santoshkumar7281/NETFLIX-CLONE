import React from 'react'
import './Footer.css'
import youtube_icon from '../../assets/youtube_icon.png'
import twitter_icon from '../../assets/twitter_icon.png'
import instagram_icon from '../../assets/instagram_icon.png'
import facebook_icon from '../../assets/facebook_icon.png'

const FOOTER_LINKS = [
  'Audio Description',
  'Help Centre',
  'Gift Cards',
  'Media Centre',
  'Investor Relations',
  'Jobs',
  'Terms of Use',
  'Privacy',
  'Legal Notices',
  'Cookie Preferences',
  'Corporate Information',
  'Contact Us',
]

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-icons">
        <a href="https://www.facebook.com" target="_blank" rel="noreferrer" aria-label="Facebook">
          <img src={facebook_icon} alt="Facebook" />
        </a>
        <a href="https://www.instagram.com/santosh_kumar7012/" target="_blank" rel="noreferrer" aria-label="Instagram">
          <img src={instagram_icon} alt="Instagram" />
        </a>
        <a href="https://www.twitter.com" target="_blank" rel="noreferrer" aria-label="Twitter">
          <img src={twitter_icon} alt="Twitter" />
        </a>
        <a href="https://www.youtube.com" target="_blank" rel="noreferrer" aria-label="YouTube">
          <img src={youtube_icon} alt="YouTube" />
        </a>
      </div>

      <ul className="footer-links-grid">
        {FOOTER_LINKS.map((link, idx) => (
          <li key={idx}>
            <span role="button" tabIndex={0}>{link}</span>
          </li>
        ))}
      </ul>

      <p className="copyright-text">&copy; 1997-2026 Netflix Clone, Inc.</p>
    </footer>
  )
}

export default Footer
