import React, { useEffect, useState } from 'react'
import './Player.css'
import back_arrow_icon from '../../assets/back_arrow_icon.png'
import { useNavigate, useParams } from 'react-router-dom'

const OPTIONS = {
  method: 'GET',
  headers: {
    accept: 'application/json',
    Authorization:
      'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJkZWY4ZjMwNGZlNWU0ZTU4N2U0ZTk4MzdjYzRmMTU0OSIsIm5iZiI6MTc0MDkyNTY1NS43Nywic3ViIjoiNjdjNDZhZDc4YWMzOGM3Yjg1NGUzYzJlIiwic2NvcGVzIjpbImFwaV9yZWFkIl0sInZlcnNpb24iOjF9.n_MgttJOoFZU9SZKU0snnYZPt8TgxudrNm12B2kRBmo',
  },
}

/* Priority order for picking the best video */
const VIDEO_PRIORITY = ['Trailer', 'Teaser', 'Clip', 'Featurette', 'Behind the Scenes']

/** Pick the best YouTube video from a results array */
const pickBestVideo = (results = []) => {
  const ytVideos = results.filter(v => v.site === 'YouTube' && v.key)
  if (!ytVideos.length) return null

  for (const type of VIDEO_PRIORITY) {
    const found = ytVideos.find(v => v.type === type)
    if (found) return found
  }
  return ytVideos[0]
}

const Player = () => {
  const { id }       = useParams()
  const navigate     = useNavigate()
  const [videoData, setVideoData]   = useState(null)
  const [mediaInfo, setMediaInfo]   = useState(null)
  const [loading, setLoading]       = useState(true)
  const [mediaType, setMediaType]   = useState('movie')

  useEffect(() => {
    if (!id) return
    setLoading(true)
    setVideoData(null)
    setMediaInfo(null)

    const tryFetch = async () => {
      try {
        /* ── 1. Try MOVIE endpoint first ───────────────── */
        const movieRes  = await fetch(
          `https://api.themoviedb.org/3/movie/${id}/videos?language=en-US`,
          OPTIONS
        )
        const movieData = await movieRes.json()
        const movieVideo = pickBestVideo(movieData.results)

        if (movieVideo) {
          const detailRes  = await fetch(
            `https://api.themoviedb.org/3/movie/${id}?language=en-US`,
            OPTIONS
          )
          const detail = await detailRes.json()
          setMediaInfo(detail)
          setMediaType('movie')
          setVideoData(movieVideo)
          setLoading(false)
          return
        }

        /* ── 2. Try TV endpoint ───────────────────────── */
        const tvRes  = await fetch(
          `https://api.themoviedb.org/3/tv/${id}/videos?language=en-US`,
          OPTIONS
        )
        const tvData = await tvRes.json()
        const tvVideo = pickBestVideo(tvData.results)

        if (tvVideo) {
          const detailRes = await fetch(
            `https://api.themoviedb.org/3/tv/${id}?language=en-US`,
            OPTIONS
          )
          const detail = await detailRes.json()
          setMediaInfo(detail)
          setMediaType('tv')
          setVideoData(tvVideo)
          setLoading(false)
          return
        }

        /* ── 3. Try broader search ───────────────────── */
        const broadRes  = await fetch(
          `https://api.themoviedb.org/3/movie/${id}/videos`,
          OPTIONS
        )
        const broadData = await broadRes.json()
        const broadVideo = pickBestVideo(broadData.results)

        if (broadVideo) {
          setVideoData(broadVideo)
        } else {
          setVideoData(null)
        }

        const detailRes = await fetch(
          `https://api.themoviedb.org/3/movie/${id}?language=en-US`,
          OPTIONS
        ).catch(() => null)
        if (detailRes?.ok) setMediaInfo(await detailRes.json())

      } catch (err) {
        console.error('Player fetch error:', err)
        setVideoData(null)
      }
      setLoading(false)
    }

    tryFetch()
  }, [id])

  const title    = mediaInfo?.title || mediaInfo?.name || 'Unknown Title'
  const year     = (mediaInfo?.release_date || mediaInfo?.first_air_date || '').slice(0, 4)
  const rating   = mediaInfo?.vote_average?.toFixed(1)
  const overview = mediaInfo?.overview

  return (
    <div className="player">
      {/* ── Back Button ─────────────────────── */}
      <button 
        className="player-back-btn" 
        onClick={() => navigate(-1)} 
        title="Go back"
        aria-label="Go back to previous page"
      >
        <img src={back_arrow_icon} alt="" aria-hidden="true" />
        <span>Back</span>
      </button>

      {/* ── Video Area ──────────────────────── */}
      {loading ? (
        <div className="player-loading">
          <div className="player-spinner" aria-hidden="true" />
          <p>Finding the best trailer…</p>
        </div>
      ) : videoData && videoData.key ? (
        <div className="player-iframe-wrap">
          <iframe
            src={`https://www.youtube.com/embed/${videoData.key}?autoplay=1&rel=0`}
            title={videoData.name || `${title} Trailer`}
            allowFullScreen
            allow="autoplay; encrypted-media; picture-in-picture"
          />
        </div>
      ) : (
        <div className="no-video">
          <div className="no-video-icon" aria-hidden="true">🎬</div>
          <h3>Trailer Not Available</h3>
          <p>No official trailer was found for this title on YouTube.</p>
          <button className="no-video-back" onClick={() => navigate(-1)}>
            ← Go Back &amp; Try Another
          </button>
        </div>
      )}

      {/* ── Info Bar ────────────────────────── */}
      {!loading && (
        <div className="player-info">
          <h2 className="video-title">{title}</h2>
          <div className="video-meta">
            {videoData?.type && (
              <span className="meta-tag type">{videoData.type}</span>
            )}
            {year && <span className="meta-tag date">{year}</span>}
            {rating && rating !== '0.0' && (
              <span className="meta-tag rating">⭐ {rating}</span>
            )}
            <span className="meta-tag source">{mediaType === 'tv' ? '📺 TV Show' : '🎬 Movie'}</span>
          </div>
          {overview && <p className="video-overview">{overview}</p>}
        </div>
      )}
      
     
    </div>
  )
}

export default Player