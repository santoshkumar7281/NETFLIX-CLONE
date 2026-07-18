import React, { useEffect, useState } from "react";
import "./Songs.css";





const YOUTUBE_API_KEY = "AIzaSyDTc4barQulzFrrjLfVlUJJqkRNyI56E-k";

// What we show the very first time the page loads, before the user searches anything
const DEFAULT_SEARCH = "Top Telugu Songs 2026";

// How many results to fetch per search
const MAX_RESULTS = 500;




// ------------------------------------------------------------------
// Helper: ask YouTube for videos matching a search term
// ------------------------------------------------------------------
async function fetchSongsFromYouTube(query) {
  const url =
    `https://www.googleapis.com/youtube/v3/search` +
    `?part=snippet&type=video&maxResults=${MAX_RESULTS}` +
    `&q=${encodeURIComponent(query)}&key=${YOUTUBE_API_KEY}`;

  const response = await fetch(url);
  const data = await response.json();

  if (!data.items) return [];

  // Turn YouTube's raw response into simple objects our UI can use
  return data.items.map((item) => ({
    videoId: item.id.videoId,
    title: item.snippet.title,
    channel: item.snippet.channelTitle,
    thumbnail: item.snippet.thumbnails.high.url,
  }));
}

const Songs = () => {
  const [searchInput, setSearchInput] = useState("");   // what the user is typing
  const [songs, setSongs] = useState([]);                // songs currently shown in the grid
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [playingSong, setPlayingSong] = useState(null);  // song open in the modal player

  // Reusable function: fetch songs for any query and update the grid
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

  // Load the default "Top Telugu Songs" list once, when the page first opens
  useEffect(() => {
    loadSongs(DEFAULT_SEARCH);
  }, []);

  // Runs when the user submits the search bar
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchInput.trim() === "") return;
    loadSongs(`${searchInput} telugu song`);
  };

  return (
    <div className="song">
      <div className="song-bg-blob blob-1" />
      <div className="song-bg-blob blob-2" />
      <div className="song-bg-blob blob-3" />

      <h1>Telugu Video Songs</h1>

      {/* ── Search Bar ─────────────────────── */}
      <form className="search-bar" onSubmit={handleSearch}>
        <input
          type="text"
          placeholder="Search any Telugu song or movie..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
        />
        <button type="submit">Search</button>
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
            <div
              className="song-card"
              key={song.videoId}
              onClick={() => setPlayingSong(song)}
            >
              <div className="thumb-wrap">
                <img src={song.thumbnail} alt={song.title} />
                <span className="play-overlay">▶</span>
              </div>
              <h2>{song.title}</h2>
              <p>{song.channel}</p>
            </div>
          ))}
      </div>

      {/* ── Video Modal (opens when a card is clicked) ─── */}
      {playingSong && (
        <div className="modal-backdrop" onClick={() => setPlayingSong(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setPlayingSong(null)}>
              ✕
            </button>
            <iframe
              src={`https://www.youtube.com/embed/${playingSong.videoId}?autoplay=1`}
              title={playingSong.title}
              allow="autoplay; encrypted-media; fullscreen"
              allowFullScreen
            ></iframe>
            <h2>{playingSong.title}</h2>
            <p>{playingSong.channel}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Songs;