import React, { useState, useEffect, useRef } from 'react'
import './Navbar.css'
import logo from '../../assets/logo.png'
import search_icon from '../../assets/search_icon.svg'
import { useNavigate, useLocation, Link } from 'react-router-dom'

const NAV_LINKS = [
  { label: 'Home',          path: '/',           icon: '🏠' },
  { label: 'TV Shows',      path: '/tvshows',    icon: '📺' },
  { label: 'Movies',        path: '/movies',     icon: '🎬' },
  { label: 'New & Popular', path: '/newpopular', icon: '🔥' },
  { label: 'Songs',         path: '/songs',      icon: '🎵' },
]

const Navbar = () => {
  const [searchOpen, setSearchOpen]         = useState(false)
  const [searchQuery, setSearchQuery]       = useState('')
  const [searchResults, setSearchResults]   = useState([])
  const [isSearching, setIsSearching]       = useState(false)
  const [scrolled, setScrolled]             = useState(false)

  const searchRef = useRef(null)
  const inputRef  = useRef(null)
  const navigate  = useNavigate()
  const location  = useLocation()

  const options = {
    method: 'GET',
    headers: {
      accept: 'application/json',
      Authorization: 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJkZWY4ZjMwNGZlNWU0ZTU4N2U0ZTk4MzdjYzRmMTU0OSIsIm5iZiI6MTc0MDkyNTY1NS43Nywic3ViIjoiNjdjNDZhZDc4YWMzOGM3Yjg1NGUzYzJlIiwic2NvcGVzIjpbImFwaV9yZWFkIl0sInZlcnNpb24iOjF9.n_MgttJOoFZU9SZKU0snnYZPt8TgxudrNm12B2kRBmo'
    }
  }

  // Scroll threshold check
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Toggle search open/close
  const handleSearchIconClick = () => {
    setSearchOpen(prev => {
      if (!prev) {
        setTimeout(() => inputRef.current?.focus(), 80)
      } else {
        setSearchQuery('')
        setSearchResults([])
      }
      return !prev
    })
  }

  // Debounced TMDB search
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([])
      setIsSearching(false)
      return
    }
    setIsSearching(true)
    const timer = setTimeout(() => {
      fetch(
        `https://api.themoviedb.org/3/search/movie?query=${encodeURIComponent(searchQuery)}&language=en-US&page=1`,
        options
      )
        .then(res => res.json())
        .then(res => {
          const filtered = (res.results || [])
            .filter(m => m.poster_path || m.backdrop_path)
            .slice(0, 8)
          setSearchResults(filtered)
          setIsSearching(false)
        })
        .catch(() => setIsSearching(false))
    }, 400)
    return () => clearTimeout(timer)
  }, [searchQuery])

  // Close search when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setSearchOpen(false)
        setSearchQuery('')
        setSearchResults([])
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleResultClick = (id) => {
    setSearchOpen(false)
    setSearchQuery('')
    setSearchResults([])
    navigate(`/player/${id}`)
  }

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/'
    return location.pathname.startsWith(path)
  }

  return (
    <>
      {/* ── FLOATING TOP NAVBAR (Clean: Netflix Logo on Left + Sign In on Right) ────── */}
      <nav className={`floating-navbar ${scrolled ? 'navbar-scrolled' : ''}`} aria-label="Main Floating Top Navigation Bar">
        <div className="navbar-pill-container">
          
          {/* Left: Netflix Logo + Desktop Nav Links */}
          <div className="navbar-left">
            <Link to="/" className="logo-link" aria-label="Netflix Home">
              <img src={logo} alt="Netflix" className="nav-logo" />
            </Link>

            <ul className="desktop-pill-links">
              {NAV_LINKS.map(link => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className={`pill-nav-item ${isActive(link.path) ? 'active' : ''}`}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Right: Clean Sign In Pill Button */}
          <div className="navbar-right">
            <Link to="/login" className="join-pill-btn">
              Sign In
            </Link>
          </div>

        </div>
      </nav>

      {/* ── MOBILE FULL-SCREEN SEARCH OVERLAY (When Search is triggered from Bottom Nav) ── */}
      {searchOpen && (
        <div className="mobile-search-overlay" ref={searchRef}>
          <div className="mobile-search-header">
            <div className="mobile-search-input-wrap">
              <img src={search_icon} alt="Search" className="mobile-search-icon" />
              <input
                ref={inputRef}
                type="text"
                className="mobile-search-input"
                placeholder="Search movies, TV shows, genres..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                autoFocus
              />
              {searchQuery && (
                <button className="clear-search-btn" onClick={() => setSearchQuery('')}>✕</button>
              )}
            </div>
            <button className="close-search-btn" onClick={() => setSearchOpen(false)}>Cancel</button>
          </div>

          {searchQuery.trim() !== '' && (
            <div className="mobile-search-results">
              {isSearching ? (
                <div className="search-status">
                  <div className="search-spinner" />
                  <span>Searching…</span>
                </div>
              ) : searchResults.length === 0 ? (
                <div className="search-status no-results">
                  <span>No titles found for "<strong>{searchQuery}</strong>"</span>
                </div>
              ) : (
                <div className="search-results-list">
                  {searchResults.map(movie => (
                    <div
                      key={movie.id}
                      className="search-result-item"
                      onClick={() => handleResultClick(movie.id)}
                    >
                      <img
                        src={`https://image.tmdb.org/t/p/w92/${movie.poster_path || movie.backdrop_path}`}
                        alt={movie.title || 'Poster'}
                        className="result-poster"
                        onError={e => { e.target.style.display = 'none' }}
                      />
                      <div className="result-info">
                        <p className="result-title">{movie.title}</p>
                        <p className="result-year">
                          {movie.release_date ? movie.release_date.slice(0, 4) : 'N/A'}
                          {movie.vote_average > 0 && (
                            <span className="result-rating">⭐ {movie.vote_average.toFixed(1)}</span>
                          )}
                        </p>
                      </div>
                      <span className="result-play-icon">▶</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ── MOBILE FLOATING BOTTOM APP NAVIGATION BAR ─── */}
      <nav className="mobile-bottom-nav" aria-label="Mobile Bottom Navigation Bar">
        <div className="mobile-nav-pill">
          {NAV_LINKS.map(link => (
            <Link
              key={link.path}
              to={link.path}
              className={`mobile-nav-item ${isActive(link.path) ? 'active' : ''}`}
            >
              <span className="mobile-nav-icon">{link.icon}</span>
              <span className="mobile-nav-label">{link.label}</span>
            </Link>
          ))}
          <button 
            className={`mobile-nav-item search-trigger ${searchOpen ? 'active' : ''}`}
            onClick={handleSearchIconClick}
            aria-label="Search"
          >
            <span className="mobile-nav-icon">🔍</span>
            <span className="mobile-nav-label">Search</span>
          </button>
        </div>
      </nav>
    </>
  )
}

export default Navbar
