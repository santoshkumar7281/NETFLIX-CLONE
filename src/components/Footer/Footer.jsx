import React from 'react'
import './Footer.css'
import youtube_icon from '../../assets/youtube_icon.png'
import twitter_icon from '../../assets/twitter_icon.png'
import instagram_icon from '../../assets/instagram_icon.png'
import facebook_icon from '../../assets/facebook_icon.png'

const Footer = () => {
  return (
    <div className="footer">
      <div className="footer-icons">
        <img src={facebook_icon} alt="" />
       <a
    href="https://www.instagram.com/santosh_kumar7012/"
    target="_blank"
    
  >
    <img src={instagram_icon} alt="Instagram" />
  </a>
      <img src={twitter_icon} alt="" />
      <img src={youtube_icon} alt="" />
      
      </div>
      <ul>
        <li>Audio Description</li>
        <li>Help Centre</li>
        <li>Gift cards</li>
        <li>Media Centre</li>
        <li>Investor Relations</li>
        <li>Jobs</li>
        <li>terms of use</li>
        <li>privacy</li>
        <li>legal Notices</li>
        <li>Cookie Preferences</li>
        <li>Corporate Information</li>
        <li>Contact us</li>
      
      </ul>
      <p className="copyright-text">@copyright text</p>
    </div>
  )
}

export default Footer
