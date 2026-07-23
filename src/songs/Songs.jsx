import React, { useEffect, useState } from "react";
import "./Songs.css";
import Navbar from "../components/Navbar/Navbar";
import Footer from "../components/Footer/Footer";

const YOUTUBE_API_KEY = "AIzaSyDj7weRNVltsSLp8RHHD-iEs5rQQPrQ63A";
const DEFAULT_SEARCH = "Top Telugu Songs 2026";
const MAX_RESULTS = 50;

async function fetchSongsFromYouTube(query) {
  const url =
    `https://www.googleapis.com/youtube/v3/search` +
    `?part=snippet&type=video&maxResults=${MAX_RESULTS}` +
    `&q=${encodeURIComponent(query)}&key=${YOUTUBE_API_KEY}`;

  const response = await fetch(url);
  const data = await response.json();

  if (!data.items) return [];

  return data.items.map((item) => ({
    videoId: item.id.videoId,
    title: item.snippet.title,
    channel: item.snippet.channelTitle,
    thumbnail: item.snippet.thumbnails.high ? item.snippet.thumbnails.high.url : item.snippet.thumbnails.medium.url,
  }));
}

const Songs = () => {
  const [searchInput, setSearchInput] = useState("");
  const [songs, setSongs]             = useState([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState(null);
  const [playingSong, setPlayingSong] = useState(null);

  const loadSongs = async (query) => {
    try {
      setLoading(true);
      setError(null);
      const results = await fetchSongsFromYouTube(query);
      setSongs(results);
    } catch (err) {
      console.error("Failed to fetch songs:", err);
      setError("Something went wrong while loading songs.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSongs(DEFAULT_SEARCH);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchInput.trim() === "") return;
    loadSongs(`${searchInput} telugu song`);
  };

  return (
    <div className="songs-page-wrapper">
      <Navbar />

      <main className="song">
        <div className="song-bg-blob blob-1" />
        <div className="song-bg-blob blob-2" />
        <div className="song-bg-blob blob-3" />

        <h1 className="songs-title">Telugu Video Songs</h1>

        {/* ── Search Bar ─────────────────────── */}
        <form className="search-bar" onSubmit={handleSearch}>
          <input
            type="text"
            placeholder="Search any Telugu song or movie..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            aria-label="Search Telugu Songs"
          />
          <button type="submit" aria-label="Submit Search">Search</button>
        </form>

        {/* ── Status Messages ────────────────── */}
        {loading && <p className="song-status">Loading songs…</p>}
        {error && <p className="song-status error">{error}</p>}
        {!loading && !error && songs.length === 0 && (
          <p className="song-status">No songs found. Try a different search.</p>
        )}

        {/* ── Song Grid ──────────────────────── */}
        <div className="son">
          {!loading &&
            !error &&
            songs.map((song) => (
              <article
                className="song-card"
                key={song.videoId}
                onClick={() => setPlayingSong(song)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && setPlayingSong(song)}
                aria-label={`Play ${song.title}`}
              >
                <div className="thumb-wrap">
                  <img src={song.thumbnail} alt={song.title} loading="lazy" />
                  <span className="play-overlay" aria-hidden="true">▶</span>
                </div>
                <h2>{song.title}</h2>
                <p>{song.channel}</p>
              </article>
            ))}
        </div>

        {/* ── Video Modal ─── */}
        {playingSong && (
          <div className="modal-backdrop" onClick={() => setPlayingSong(null)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <button 
                className="modal-close" 
                onClick={() => setPlayingSong(null)}
                aria-label="Close Player Modal"
              >
                ✕
              </button>
              <div className="modal-iframe-wrap">
                <iframe
                  src={`https://www.youtube.com/embed/${playingSong.videoId}?autoplay=1`}
                  title={playingSong.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  frameBorder="0"
                  allowFullScreen
                />
              </div>
              <h2>{playingSong.title}</h2>
              <p>{playingSong.channel}</p>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Songs;