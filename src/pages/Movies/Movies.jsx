import React, { useState, useEffect, useCallback } from 'react'
import './Movies.css'
import Navbar from '../../components/Navbar/Navbar'
import Footer from '../../components/Footer/Footer'
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom'

/* ── TMDB API options ─────────────────────────────────── */
const OPTIONS = {
  method: 'GET',
  headers: {
    accept: 'application/json',
    Authorization:
      'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJkZWY4ZjMwNGZlNWU0ZTU4N2U0ZTk4MzdjYzRmMTU0OSIsIm5iZiI6MTc0MDkyNTY1NS43Nywic3ViIjoiNjdjNDZhZDc4YWMzOGM3Yjg1NGUzYzJlIiwic2NvcGVzIjpbImFwaV9yZWFkIl0sInZlcnNpb24iOjF9.n_MgttJOoFZU9SZKU0snnYZPt8TgxudrNm12B2kRBmo',
  },
}

/* ── Build URL for a given category + page ────────────── */
const buildUrl = (key, page = 1) => {
  const p = `&page=${page}`
  switch (key) {
    case 'popular':     return `https://api.themoviedb.org/3/movie/popular?language=en-US${p}`
    case 'top_rated':   return `https://api.themoviedb.org/3/movie/top_rated?language=en-US${p}`
    case 'now_playing': return `https://api.themoviedb.org/3/movie/now_playing?language=en-US${p}`
    case 'upcoming':    return `https://api.themoviedb.org/3/movie/upcoming?language=en-US${p}`
    case 'telugu':      return `https://api.themoviedb.org/3/discover/movie?with_original_language=te&sort_by=popularity.desc${p}`
    case 'telugu-top':  return `https://api.themoviedb.org/3/discover/movie?with_original_language=te&sort_by=vote_average.desc&vote_count.gte=100${p}`
    /* TV Shows */
    case 'tv-popular':    return `https://api.themoviedb.org/3/tv/popular?language=en-US${p}`
    case 'tv-top':        return `https://api.themoviedb.org/3/tv/top_rated?language=en-US${p}`
    case 'tv-airing':     return `https://api.themoviedb.org/3/tv/on_the_air?language=en-US${p}`
    case 'tv-today':      return `https://api.themoviedb.org/3/tv/airing_today?language=en-US${p}`
    default:            return `https://api.themoviedb.org/3/movie/popular?language=en-US${p}`
  }
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

/* ─────────────────────────────────────────────────────── */

const Movies = () => {
  const location        = useLocation()
  const isTVPage        = location.pathname === '/tvshows'

  const CATEGORIES      = isTVPage ? TV_CATS : MOVIE_CATS
  const pageTitle       = isTVPage ? 'Browse All TV Shows' : 'Browse All Movies'
  const pageTagline     = isTVPage ? 'Stream top TV series & episodes' : 'Unlimited movies, blockbusters & more'

  const [searchParams, setSearchParams] = useSearchParams()
  const initialCat      = searchParams.get('category') || CATEGORIES[0].key

  const [activeCategory, setActiveCategory] = useState(initialCat)
  const [movies, setMovies]                 = useState([])
  const [page, setPage]                     = useState(1)
  const [totalPages, setTotalPages]         = useState(1)
  const [initialLoading, setInitialLoading] = useState(true)
  const [loadingMore, setLoadingMore]       = useState(false)
  const [hoveredId, setHoveredId]           = useState(null)
  const navigate                            = useNavigate()

  const currentCat = CATEGORIES.find(c => c.key === activeCategory) || CATEGORIES[0]

  /* ── Fetch ONE page and return results ──────────────── */
  const fetchPage = useCallback(async (catKey, pageNum) => {
    const res  = await fetch(buildUrl(catKey, pageNum), OPTIONS)
    const data = await res.json()
    const items = (data.results || []).filter(
      m => m.poster_path || m.backdrop_path
    )
    return { items, totalPages: data.total_pages || 1 }
  }, [])

  /* ── Initial load: fetch INITIAL_PAGES pages at once ── */
  useEffect(() => {
    setInitialLoading(true)
    setMovies([])
    setPage(INITIAL_PAGES)

    const fetches = Array.from({ length: INITIAL_PAGES }, (_, i) =>
      fetchPage(activeCategory, i + 1)
    )

    Promise.all(fetches).then(results => {
      const all        = results.flatMap(r => r.items)
      const maxPages   = results[0]?.totalPages || 1
      // Deduplicate by id
      const unique = all.filter((m, i, arr) => arr.findIndex(x => x.id === m.id) === i)
      setMovies(unique)
      setTotalPages(maxPages)
      setInitialLoading(false)
    }).catch(() => setInitialLoading(false))
  }, [activeCategory, fetchPage])

  /* ── "Load More" — fetch next page and APPEND ───────── */
  const handleLoadMore = async () => {
    if (loadingMore) return
    const nextPage = page + 1
    if (nextPage > totalPages) return

    setLoadingMore(true)
    try {
      const { items } = await fetchPage(activeCategory, nextPage)
      setMovies(prev => {
        const existing = new Set(prev.map(m => m.id))
        return [...prev, ...items.filter(m => !existing.has(m.id))]
      })
      setPage(nextPage)
    } catch (_) { /* ignore */ }
    setLoadingMore(false)
  }

  /* ── Switch category ────────────────────────────────── */
  const handleCategoryClick = (key) => {
    if (key === activeCategory) return
    setActiveCategory(key)
    setSearchParams({ category: key })
  }

  const handleMovieClick = (id) => navigate(`/player/${id}`)

  const hasMore = page < totalPages

  /* ─────────────────────────────────────────────────────── */
  return (
    <div className="movies-page">
      <Navbar />

      {/* ── Hero ──────────────────────────────── */}
      <div className="movies-hero">
        {/* Back button */}
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
              <span className="stat-pill">
                🎬 {movies.length}+ titles loaded
              </span>
            )}
            <span className="stat-pill">Page {page} / {totalPages}</span>
          </div>
        </div>
        <div className="movies-hero-overlay" />
      </div>

      {/* ── Category Tabs ─────────────────────── */}
      <div className="movies-tabs-wrap">
        <div className="movies-tabs">
          {CATEGORIES.map(cat => (
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

        {/* Skeleton on first load */}
        {initialLoading ? (
          <div className="movies-loading">
            {Array.from({ length: 18 }).map((_, i) => (
              <div key={i} className="skeleton-card" />
            ))}
          </div>
        ) : (
          <>
            <div className="movies-grid">
              {movies.map(movie => {
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
                        {date && (
                          <span className="badge year">{date.slice(0, 4)}</span>
                        )}
                        {movie.vote_average > 0 && (
                          <span className="badge rating">
                            ⭐ {movie.vote_average.toFixed(1)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}

              {/* Skeleton appended at end while loading more */}
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
                      <span className="lm-count">
                        (Page {page + 1} of {totalPages})
                      </span>
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
