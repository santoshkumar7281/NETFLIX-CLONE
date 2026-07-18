// import React, { useEffect, useState } from 'react'
// import './Player.css'
// import back_arrow_icon from '../../assets/back_arrow_icon.png'
// import { useNavigate, useParams } from 'react-router'

// const OPTIONS = {
//   method: 'GET',
//   headers: {
//     accept: 'application/json',
//     Authorization:
//       'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJkZWY4ZjMwNGZlNWU0ZTU4N2U0ZTk4MzdjYzRmMTU0OSIsIm5iZiI6MTc0MDkyNTY1NS43Nywic3ViIjoiNjdjNDZhZDc4YWMzOGM3Yjg1NGUzYzJlIiwic2NvcGVzIjpbImFwaV9yZWFkIl0sInZlcnNpb24iOjF9.n_MgttJOoFZU9SZKU0snnYZPt8TgxudrNm12B2kRBmo',
//   },
// }

// /* Priority order for picking the best video */
// const VIDEO_PRIORITY = ['Trailer', 'Teaser', 'Clip', 'Featurette', 'Behind the Scenes']

// /** Pick the best YouTube video from a results array */
// const pickBestVideo = (results = []) => {
//   // Filter to YouTube only
//   const ytVideos = results.filter(v => v.site === 'YouTube' && v.key)
//   if (!ytVideos.length) return null

//   for (const type of VIDEO_PRIORITY) {
//     const found = ytVideos.find(v => v.type === type)
//     if (found) return found
//   }
//   // Fallback: just return the first YouTube video
//   return ytVideos[0]
// }

// const Player = () => {
//   const { id }       = useParams()
//   const navigate     = useNavigate()
//   const [videoData, setVideoData]   = useState(null)
//   const [mediaInfo, setMediaInfo]   = useState(null)   // title/name of the movie or show
//   const [loading, setLoading]       = useState(true)
//   const [mediaType, setMediaType]   = useState('movie') // 'movie' | 'tv'

//   useEffect(() => {
//     if (!id) return
//     setLoading(true)
//     setVideoData(null)
//     setMediaInfo(null)

//     const tryFetch = async () => {
//       try {
//         /* ── 1. Try MOVIE endpoint first ───────────────── */
//         const movieRes  = await fetch(
//           `https://api.themoviedb.org/3/movie/${id}/videos?language=en-US`,
//           OPTIONS
//         )
//         const movieData = await movieRes.json()
//         const movieVideo = pickBestVideo(movieData.results)

//         if (movieVideo) {
//           // Also fetch movie details for the title
//           const detailRes  = await fetch(
//             `https://api.themoviedb.org/3/movie/${id}?language=en-US`,
//             OPTIONS
//           )
//           const detail = await detailRes.json()
//           setMediaInfo(detail)
//           setMediaType('movie')
//           setVideoData(movieVideo)
//           setLoading(false)
//           return
//         }

//         /* ── 2. No movie video → try TV endpoint ───────── */
//         const tvRes  = await fetch(
//           `https://api.themoviedb.org/3/tv/${id}/videos?language=en-US`,
//           OPTIONS
//         )
//         const tvData = await tvRes.json()
//         const tvVideo = pickBestVideo(tvData.results)

//         if (tvVideo) {
//           const detailRes = await fetch(
//             `https://api.themoviedb.org/3/tv/${id}?language=en-US`,
//             OPTIONS
//           )
//           const detail = await detailRes.json()
//           setMediaInfo(detail)
//           setMediaType('tv')
//           setVideoData(tvVideo)
//           setLoading(false)
//           return
//         }

//         /* ── 3. Try without language filter (broader search) */
//         const broadRes  = await fetch(
//           `https://api.themoviedb.org/3/movie/${id}/videos`,
//           OPTIONS
//         )
//         const broadData = await broadRes.json()
//         const broadVideo = pickBestVideo(broadData.results)

//         if (broadVideo) {
//           setVideoData(broadVideo)
//         } else {
//           setVideoData(null)
//         }

//         // Still get the title
//         const detailRes = await fetch(
//           `https://api.themoviedb.org/3/movie/${id}?language=en-US`,
//           OPTIONS
//         ).catch(() => null)
//         if (detailRes?.ok) setMediaInfo(await detailRes.json())

//       } catch (err) {
//         console.error('Player fetch error:', err)
//         setVideoData(null)
//       }
//       setLoading(false)
//     }

//     tryFetch()
//   }, [id])

  

//   const title    = mediaInfo?.title || mediaInfo?.name || 'Unknown Title'
//   const year     = (mediaInfo?.release_date || mediaInfo?.first_air_date || '').slice(0, 4)
//   const rating   = mediaInfo?.vote_average?.toFixed(1)
//   const overview = mediaInfo?.overview

//   return (
//     <div className="player">

//       {/* ── Back Button ─────────────────────── */}
//       <button className="player-back-btn" onClick={() => navigate(-1)} title="Go back">
//         <img src={back_arrow_icon} alt="Back" />
//         <span>Back</span>
//       </button>

//       {/* ── Video Area ──────────────────────── */}
//       {loading ? (
//         <div className="player-loading">
//           <div className="player-spinner" />
//           <p>Finding the best trailer…</p>
//         </div>
//       ) : videoData && videoData.key ? (
//         <iframe
//           src={`https://www.youtube.com/embed/${videoData.key}?autoplay=1&rel=0`}
//           title={videoData.name || 'Trailer'}
//           allowFullScreen
//           allow="autoplay; encrypted-media; picture-in-picture"
//         />
//       ) : (
//         <div className="no-video">
//           <div className="no-video-icon">🎬</div>
//           <h3>Trailer Not Available</h3>
//           <p>No official trailer was found for this title on YouTube.</p>
//           <button className="no-video-back" onClick={() => navigate(-1)}>
//             ← Go Back &amp; Try Another
//           </button>
//         </div>
//       )}

//       {/* ── Info Bar ────────────────────────── */}
//       {!loading && (
//         <div className="player-info">
//           <h2 className="video-title">{title}</h2>
//           <div className="video-meta">
//             {videoData?.type && (
//               <span className="meta-tag type">{videoData.type}</span>
//             )}
//             {year && <span className="meta-tag date">{year}</span>}
//             {rating && rating !== '0.0' && (
//               <span className="meta-tag rating">⭐ {rating}</span>
//             )}
//             <span className="meta-tag source">{mediaType === 'tv' ? '📺 TV Show' : '🎬 Movie'}</span>
//           </div>
//           {overview && <p className="video-overview">{overview}</p>}
//         </div>
//       )}
//       <iframe class="rumble" width="640" height="360" src="https://rumble.com/embed/v6nvxxe/?pub=4" frameborder="0" allowfullscreen></iframe>
//     </div>
    
//   )
// }

// export default Player


import React, { useEffect, useState } from 'react'
import './Player.css'
import back_arrow_icon from '../../assets/back_arrow_icon.png'
import { useNavigate, useParams } from 'react-router'

// This is the API key we send with every request to TheMovieDB
const API_OPTIONS = {
  method: 'GET',
  headers: {
    accept: 'application/json',
    Authorization:
      'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJkZWY4ZjMwNGZlNWU0ZTU4N2U0ZTk4MzdjYzRmMTU0OSIsIm5iZiI6MTc0MDkyNTY1NS43Nywic3ViIjoiNjdjNDZhZDc4YWMzOGM3Yjg1NGUzYzJlIiwic2NvcGVzIjpbImFwaV9yZWFkIl0sInZlcnNpb24iOjF9.n_MgttJOoFZU9SZKU0snnYZPt8TgxudrNm12B2kRBmo',
  },
}

// We prefer a "Trailer" video, but if there isn't one, we'll take
// whatever is next best in this list.
const VIDEO_PRIORITY_ORDER = ['Trailer', 'Teaser', 'Clip', 'Featurette', 'Behind the Scenes']

// -----------------------------------------------------------------
// Small helper functions (each one does ONE simple job)
// -----------------------------------------------------------------

// Ask TheMovieDB for the list of videos for a movie or tv show
async function getVideos(mediaType, id) {
  const url = `https://api.themoviedb.org/3/${mediaType}/${id}/videos?language=en-US`
  const response = await fetch(url, API_OPTIONS)
  const data = await response.json()
  return data.results || []
}

// Ask TheMovieDB for the details (title, year, rating, overview) of a movie or tv show
async function getDetails(mediaType, id) {
  const url = `https://api.themoviedb.org/3/${mediaType}/${id}?language=en-US`
  const response = await fetch(url, API_OPTIONS)
  return response.json()
}

// Out of a list of videos, pick the best YouTube one to show
function pickBestVideo(videos) {
  // Only keep videos that are hosted on YouTube
  const youtubeVideos = videos.filter(video => video.site === 'YouTube' && video.key)

  if (youtubeVideos.length === 0) {
    return null
  }

  // Look for the first type we prefer (Trailer, then Teaser, etc.)
  for (const preferredType of VIDEO_PRIORITY_ORDER) {
    const match = youtubeVideos.find(video => video.type === preferredType)
    if (match) return match
  }

  // If none of our preferred types exist, just use the first YouTube video
  return youtubeVideos[0]
}

// -----------------------------------------------------------------
// The main component
// -----------------------------------------------------------------

const Player = () => {
  const { id } = useParams()
  const navigate = useNavigate()

  const [videoData, setVideoData] = useState(null)
  const [mediaInfo, setMediaInfo] = useState(null)
  const [mediaType, setMediaType] = useState('movie') // 'movie' or 'tv'
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return

    // Reset everything whenever the id changes
    setLoading(true)
    setVideoData(null)
    setMediaInfo(null)

    async function loadTrailer() {
      try {
        // Step 1: try to find a video assuming this id is a MOVIE
        const movieVideos = await getVideos('movie', id)
        const bestMovieVideo = pickBestVideo(movieVideos)

        if (bestMovieVideo) {
          const details = await getDetails('movie', id)
          setMediaInfo(details)
          setMediaType('movie')
          setVideoData(bestMovieVideo)
          return
        }

        // Step 2: no movie video found, try assuming it's a TV SHOW
        const tvVideos = await getVideos('tv', id)
        const bestTvVideo = pickBestVideo(tvVideos)

        if (bestTvVideo) {
          const details = await getDetails('tv', id)
          setMediaInfo(details)
          setMediaType('tv')
          setVideoData(bestTvVideo)
          return
        }

        // Step 3: still nothing, so just show the movie details
        // (even without a trailer) so the page isn't completely empty
        const fallbackDetails = await getDetails('movie', id)
        setMediaInfo(fallbackDetails)
        setMediaType('movie')
        setVideoData(null)

      } catch (error) {
        console.error('Player fetch error:', error)
        setVideoData(null)
      } finally {
        setLoading(false)
      }
    }

    loadTrailer()
  }, [id])

  // Pull out the fields we need for display, with safe fallbacks
  const title = mediaInfo?.title || mediaInfo?.name || 'Unknown Title'
  const year = (mediaInfo?.release_date || mediaInfo?.first_air_date || '').slice(0, 4)
  const rating = mediaInfo?.vote_average?.toFixed(1)
  const overview = mediaInfo?.overview
  const hasRating = rating && rating !== '0.0'

  return (
    <div className="player">

      {/* ── Back Button ─────────────────────── */}
      <button className="player-back-btn" onClick={() => navigate(-1)} title="Go back">
        <img src={back_arrow_icon} alt="Back" />
        <span>Back</span>
      </button>

      {/* ── Video Area ──────────────────────── */}
      {loading && (
        <div className="player-loading">
          <div className="player-spinner" />
          <p>Finding the best trailer…</p>
        </div>
      )}

      {!loading && videoData?.key && (
        <iframe
          src={`https://www.youtube.com/embed/${videoData.key}?autoplay=1&rel=0`}
          title={videoData.name || 'Trailer'}
          allowFullScreen
          allow="autoplay; encrypted-media; picture-in-picture"
        />
      )}

      {!loading && !videoData?.key && (
        <div className="no-video">
          <div className="no-video-icon">🎬</div>
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
            {videoData?.type && <span className="meta-tag type">{videoData.type}</span>}
            {year && <span className="meta-tag date">{year}</span>}
            {hasRating && <span className="meta-tag rating">⭐ {rating}</span>}
            <span className="meta-tag source">
              {mediaType === 'tv' ? '📺 TV Show' : '🎬 Movie'}
            </span>
          </div>
          {overview && <p className="video-overview">{overview}</p>}
        </div>
      )}

      
    </div>
  )
}

export default Player