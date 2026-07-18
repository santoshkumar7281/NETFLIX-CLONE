import React, { useState, useEffect, useRef } from 'react'
import './Navbar.css'
import logo from '../../assets/logo.png'
import search_icon from '../../assets/search_icon.svg'
import bell_icon from '../../assets/bell_icon.svg'
import caret_icon from '../../assets/caret_icon.svg'
import profile_img from '../../assets/profile_img.png'
import { useNavigate, useLocation, Link } from 'react-router-dom'

const NAV_LINKS = [
  { label: 'Home',              path: '/' },
  { label: 'TV Shows',          path: '/tvshows' },
  { label: 'Movies',            path: '/movies' },
  { label: 'New & Popular',     path: '/newpopular' },
  { label: 'songs',             path: '/songs' },
  
]

const Navbar = () => {
  const [searchOpen, setSearchOpen]     = useState(false)
  const [searchQuery, setSearchQuery]   = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [isSearching, setIsSearching]   = useState(false)
  const [scrolled, setScrolled]         = useState(false)

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

  // Solid background after scroll
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Toggle search open/close
  const handleSearchIconClick = () => {
    setSearchOpen(prev => {
      if (!prev) {
        setTimeout(() => inputRef.current?.focus(), 50)
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

  // Close when clicking outside
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
    <nav className={`navbar ${scrolled ? 'navbar-solid' : ''}`}>
      {/* ── LEFT ─────────────────────────────── */}
      <div className="navbar-left">
        <Link to="/">
          <img src={logo} alt="Netflix" className="nav-logo" />
        </Link>

        {/* Desktop links */}
        <ul className="nav-links">
          {NAV_LINKS.map(link => (
            <li key={link.path}>
              <Link
                to={link.path}
                className={`nav-link ${isActive(link.path) ? 'nav-link-active' : ''}`}
              >
                {link.label}
                {isActive(link.path) && <span className="nav-link-dot" />}
              </Link>
            </li>
          ))}
        </ul>

        {/* Mobile browse dropdown */}
        <div className="navbar-browse">
          <p>Browse</p>
          <img src={caret_icon} alt="" />
          <div className="browse-dropdown">
            {NAV_LINKS.map(link => (
              <Link key={link.path} to={link.path} className="browse-item">
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* ── RIGHT ────────────────────────────── */}
      <div className="navbar-right">

        {/* Search */}
        <div className={`search-container ${searchOpen ? 'open' : ''}`} ref={searchRef}>
          <div className="search-bar">
            <img
              src={search_icon}
              alt="Search"
              className={`icons search-icon-btn ${searchOpen ? 'active' : ''}`}
              onClick={handleSearchIconClick}
            />
            <input
              ref={inputRef}
              type="text"
              className="search-input"
              placeholder="Titles, people, genres"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              onKeyDown={e => e.key === 'Escape' && handleSearchIconClick()}
            />
          </div>

          {searchOpen && searchQuery.trim() !== '' && (
            <div className="search-results-dropdown">
              {isSearching ? (
                <div className="search-status">
                  <div className="search-spinner" />
                  <span>Searching…</span>
                </div>
              ) : searchResults.length === 0 ? (
                <div className="search-status no-results">
                  <span>No results for "<strong>{searchQuery}</strong>"</span>
                </div>
              ) : (
                <>
                  <p className="results-label">Movies</p>
                  {searchResults.map(movie => (
                    <div
                      key={movie.id}
                      className="search-result-item"
                      onClick={() => handleResultClick(movie.id)}
                    >
                      <img
                        src={`https://image.tmdb.org/t/p/w92/${movie.poster_path || movie.backdrop_path}`}
                        alt={movie.title}
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
                </>
              )}
            </div>
          )}
        </div>

        <p className="children-text">Children</p>
        <img src={bell_icon} alt="" className="icons" />

        {/* Profile + dropdown */}
        <div className="navbar-profile">
          <img src={profile_img} alt="" className="profile" />
          <img src={caret_icon} alt="" className="caret-small" />
          <div className="dropdown">
            <Link to="/login" className="dropdown-item">Sign In / Sign Up</Link>
            <span className="dropdown-divider" />
            <p className="dropdown-item">Account</p>
            <p className="dropdown-item">Help Center</p>
          </div>
        </div>

        {/* Sign In button (visible on desktop) */}
        <Link to="/login" className="signin-btn">Sign In</Link>
      </div>
    </nav>
  )
}

export default Navbar
