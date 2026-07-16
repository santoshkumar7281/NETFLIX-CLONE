import React, { useState } from 'react'
import './Login.css'
import logo from '../../assets/logo.png'
import { useNavigate } from 'react-router-dom'

const Login = () => {
  const [signinState, setSigninState] = useState('Sign In')
  const [email, setEmail]             = useState('')
  const [password, setPassword]       = useState('')
  const [name, setName]               = useState('')
  const [loading, setLoading]         = useState(false)
  const navigate = useNavigate()

  const handleSubmit = (e) => {
    e.preventDefault()
    setLoading(true)
    // Simulate async auth (replace with real Firebase / auth logic)
    setTimeout(() => {
      setLoading(false)
      navigate('/')
    }, 1200)
  }

  return (
    <div className="login-page">
      {/* top logo */}
      <div className="login-nav">
        <img
          src={logo}
          className="login-logo"
          alt="Netflix"
          onClick={() => navigate('/')}
        />
      </div>

      {/* Card */}
      <div className="login-card">
        <h1>{signinState}</h1>

        <form onSubmit={handleSubmit} className="login-form-inner">
          {signinState === 'Sign Up' && (
            <div className="input-group">
              <input
                id="name"
                type="text"
                placeholder=" "
                value={name}
                onChange={e => setName(e.target.value)}
                required
              />
              <label htmlFor="name">Your Name</label>
            </div>
          )}

          <div className="input-group">
            <input
              id="email"
              type="email"
              placeholder=" "
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
            <label htmlFor="email">Email address</label>
          </div>

          <div className="input-group">
            <input
              id="password"
              type="password"
              placeholder=" "
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
            <label htmlFor="password">Password</label>
          </div>

          <button type="submit" className={`login-btn ${loading ? 'loading' : ''}`} disabled={loading}>
            {loading ? <span className="btn-spinner" /> : signinState}
          </button>

          <div className="form-help">
            <label className="remember-label">
              <input type="checkbox" /> Remember me
            </label>
            <span className="help-link">Need Help?</span>
          </div>
        </form>

        <div className="form-switch">
          {signinState === 'Sign In' ? (
            <p>
              New to Netflix?{' '}
              <span onClick={() => setSigninState('Sign Up')}>Sign up now</span>
            </p>
          ) : (
            <p>
              Already have an account?{' '}
              <span onClick={() => setSigninState('Sign In')}>Sign in</span>
            </p>
          )}
        </div>

        <p className="login-disclaimer">
          This page is protected by Google reCAPTCHA to ensure you&apos;re not a bot.
        </p>
      </div>
    </div>
  )
}

export default Login
