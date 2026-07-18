import React, { useState, useEffect, useCallback } from 'react'
import './Movies.css'
import Navbar from '../../components/Navbar/Navbar'
import Footer from '../../components/Footer/Footer'
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom'

/* ── TMDB API options ─────────────────────────────────── */
const API_OPTIONS = {
  method: 'GET',
  headers: {
    accept: 'application/json',
    Authorization:
      'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJkZWY4ZjMwNGZlNWU0ZTU4N2U0ZTk4MzdjYzRmMTU0OSIsIm5iZiI6MTc0MDkyNTY1NS43Nywic3ViIjoiNjdjNDZhZDc4YWMzOGM3Yjg1NGUzYzJlIiwic2NvcGVzIjpbImFwaV9yZWFkIl0sInZlcnNpb24iOjF9.n_MgttJOoFZU9SZKU0snnYZPt8TgxudrNm12B2kRBmo',
  },
}

/* ── One simple lookup table: category key → TMDB endpoint ──
   Much easier to read than a big switch statement.
   `page` gets added onto the end of every URL automatically. */
const CATEGORY_ENDPOINTS = {
  popular:     'movie/popular?language=en-US',
  top_rated:   'movie/top_rated?language=en-US',
  now_playing: 'movie/now_playing?language=en-US',
  upcoming:    'movie/upcoming?language=en-US',
  telugu:      'discover/movie?with_original_language=te&sort_by=popularity.desc',
  'telugu-top':'discover/movie?with_original_language=te&sort_by=vote_average.desc&vote_count.gte=100',

  /* TV Shows */
  'tv-popular': 'tv/popular?language=en-US',
  'tv-top':     'tv/top_rated?language=en-US',
  'tv-airing':  'tv/on_the_air?language=en-US',
  'tv-today':   'tv/airing_today?language=en-US',
}

// Build the full TMDB URL for a given category + page number
function buildUrl(categoryKey, page = 1) {
  const endpoint = CATEGORY_ENDPOINTS[categoryKey] || CATEGORY_ENDPOINTS.popular
  return `https://api.themoviedb.org/3/${endpoint}&page=${page}`
}

/* ── Category lists per page type ────────────────────── */
const MOVIE_CATS = [
  { label: 'All Popular',  key: 'popular' },
  { label: 'Top Rated',    key: 'top_rated' },
  { label: 'Now Playing',  key: 'now_playing' },
  { label: 'Upcoming',     key: 'upcoming' },
  { label: 'Telugu',       key: 'telugu' },
  { label: 'Top Telugu',   key: 'telugu-top' },
]

const TV_CATS = [
  { label: 'Popular',      key: 'tv-popular' },
  { label: 'Top Rated',    key: 'tv-top' },
  { label: 'On The Air',   key: 'tv-airing' },
  { label: 'Airing Today', key: 'tv-today' },
]

const INITIAL_PAGES = 3   // load 3 pages (~60 items) on first render

/* ── Small helper: remove movies that appear more than once ── */
function removeDuplicates(movieList) {
  const seenIds = new Set()
  return movieList.filter((movie) => {
    if (seenIds.has(movie.id)) return false
    seenIds.add(movie.id)
    return true
  })
}

/* ─────────────────────────────────────────────────────── */

const Movies = () => {
  const location  = useLocation()
  const isTVPage  = location.pathname === '/tvshows'

  const CATEGORIES  = isTVPage ? TV_CATS : MOVIE_CATS
  const pageTitle   = isTVPage ? 'Browse All TV Shows' : 'Browse All Movies'
  const pageTagline = isTVPage ? 'Stream top TV series & episodes' : 'Unlimited movies, blockbusters & more'

  const [searchParams, setSearchParams] = useSearchParams()
  const initialCategory = searchParams.get('category') || CATEGORIES[0].key

  const [activeCategory, setActiveCategory] = useState(initialCategory)
  const [movies, setMovies]                 = useState([])
  const [page, setPage]                     = useState(1)
  const [totalPages, setTotalPages]         = useState(1)
  const [initialLoading, setInitialLoading] = useState(true)
  const [loadingMore, setLoadingMore]       = useState(false)
  const [hoveredId, setHoveredId]           = useState(null)
  const navigate = useNavigate()

  const currentCat = CATEGORIES.find(c => c.key === activeCategory) || CATEGORIES[0]
  const hasMore    = page < totalPages

  /* ── Fetch ONE page from TMDB and return only movies that have an image ── */
  const fetchPage = useCallback(async (categoryKey, pageNumber) => {
    const response = await fetch(buildUrl(categoryKey, pageNumber), API_OPTIONS)
    const data = await response.json()

    const moviesWithPosters = (data.results || []).filter(
      (movie) => movie.poster_path || movie.backdrop_path
    )

    return {
      items: moviesWithPosters,
      totalPages: data.total_pages || 1,
    }
  }, [])

  /* ── Initial load: fetch the first few pages together ── */
  useEffect(() => {
    async function loadFirstPages() {
      setInitialLoading(true)
      setMovies([])
      setPage(INITIAL_PAGES)

      try {
        // Fetch pages 1, 2, 3 (etc.) all at the same time
        const pageNumbers = Array.from({ length: INITIAL_PAGES }, (_, i) => i + 1)
        const pageResults = await Promise.all(
          pageNumbers.map((pageNumber) => fetchPage(activeCategory, pageNumber))
        )

        // Combine all pages into one list and remove duplicates
        const allMovies = pageResults.flatMap((result) => result.items)
        setMovies(removeDuplicates(allMovies))
        setTotalPages(pageResults[0]?.totalPages || 1)
      } catch (error) {
        console.error('Failed to load movies:', error)
      }

      setInitialLoading(false)
    }

    loadFirstPages()
  }, [activeCategory, fetchPage])

  /* ── "Load More" — fetch the next page and add it to the list ── */
  const handleLoadMore = async () => {
    if (loadingMore) return

    const nextPage = page + 1
    if (nextPage > totalPages) return

    setLoadingMore(true)
    try {
      const { items } = await fetchPage(activeCategory, nextPage)
      setMovies((previousMovies) => removeDuplicates([...previousMovies, ...items]))
      setPage(nextPage)
    } catch (error) {
      console.error('Failed to load more movies:', error)
    }
    setLoadingMore(false)
  }

  /* ── Switch category ────────────────────────────────── */
  const handleCategoryClick = (categoryKey) => {
    if (categoryKey === activeCategory) return
    setActiveCategory(categoryKey)
    setSearchParams({ category: categoryKey })
  }

  const handleMovieClick = (id) => navigate(`/player/${id}`)

  /* ─────────────────────────────────────────────────────── */
  return (
    <div className="movies-page">
      <Navbar />

      {/* ── Hero ──────────────────────────────── */}
      <div className="movies-hero">
        <button className="movies-back-btn" onClick={() => navigate(-1)}>
          <span className="movies-back-arrow">←</span>
          Back
        </button>

        <div className="movies-hero-content">
          <p className="movies-tagline">{pageTagline}</p>
          <h1 className="movies-headline">{pageTitle}</h1>
          <p className="movies-sub">Pick a category · Click any title to watch the trailer</p>
          <div className="movies-stats">
            {!initialLoading && (
              <span className="stat-pill">🎬 {movies.length}+ titles loaded</span>
            )}
            <span className="stat-pill">Page {page} / {totalPages}</span>
          </div>
        </div>
        <div className="movies-hero-overlay" />
      </div>

      {/* ── Category Tabs ─────────────────────── */}
      <div className="movies-tabs-wrap">
        <div className="movies-tabs">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.key}
              className={`tab-btn ${activeCategory === cat.key ? 'active' : ''}`}
              onClick={() => handleCategoryClick(cat.key)}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Grid ──────────────────────────────── */}
      <div className="movies-grid-section">
        <div className="grid-header-row">
          <h2 className="grid-heading">{currentCat.label}</h2>
          {!initialLoading && (
            <span className="count-badge">{movies.length} titles</span>
          )}
        </div>

        {initialLoading ? (
          /* Skeleton placeholders while the first pages load */
          <div className="movies-loading">
            {Array.from({ length: 18 }).map((_, i) => (
              <div key={i} className="skeleton-card" />
            ))}
          </div>
        ) : (
          <>
            <div className="movies-grid">
              {movies.map((movie) => {
                const title = movie.title || movie.name
                const date  = movie.release_date || movie.first_air_date

                return (
                  <div
                    key={movie.id}
                    className={`movie-card ${hoveredId === movie.id ? 'hovered' : ''}`}
                    onMouseEnter={() => setHoveredId(movie.id)}
                    onMouseLeave={() => setHoveredId(null)}
                    onClick={() => handleMovieClick(movie.id)}
                  >
                    <div className="movie-poster-wrap">
                      <img
                        src={`https://image.tmdb.org/t/p/w342/${movie.poster_path || movie.backdrop_path}`}
                        alt={title}
                        className="movie-poster"
                        loading="lazy"
                      />
                      <div className="movie-overlay">
                        <div className="play-circle">▶</div>
                        <p className="overlay-label">Watch Trailer</p>
                      </div>
                    </div>
                    <div className="movie-meta">
                      <p className="movie-title">{title}</p>
                      <div className="movie-badges">
                        {date && <span className="badge year">{date.slice(0, 4)}</span>}
                        {movie.vote_average > 0 && (
                          <span className="badge rating">⭐ {movie.vote_average.toFixed(1)}</span>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}

              {loadingMore &&
                Array.from({ length: 6 }).map((_, i) => (
                  <div key={`sk-${i}`} className="skeleton-card" />
                ))}
            </div>

            {/* ── Load More / All Loaded button ─── */}
            <div className="load-more-wrap">
              {hasMore ? (
                <button
                  className={`load-more-btn ${loadingMore ? 'loading' : ''}`}
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                >
                  {loadingMore ? (
                    <>
                      <span className="lm-spinner" />
                      Loading more…
                    </>
                  ) : (
                    <>
                      <span className="lm-icon">↓</span>
                      Load More Movies
                      <span className="lm-count">(Page {page + 1} of {totalPages})</span>
                    </>
                  )}
                </button>
              ) : (
                <div className="all-loaded">
                  <span className="all-loaded-icon">✓</span>
                  All {movies.length} titles loaded
                </div>
              )}
            </div>
          </>
        )}
      </div>

      <Footer />
    </div>
  )
}

export default Movies