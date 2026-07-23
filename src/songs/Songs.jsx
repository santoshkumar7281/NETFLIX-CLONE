import React, { useEffect, useState, useRef } from "react";
import "./Songs.css";
import Navbar from "../components/Navbar/Navbar";
import Footer from "../components/Footer/Footer";

const YOUTUBE_API_KEY = "AIzaSyDj7weRNVltsSLp8RHHD-iEs5rQQPrQ63A";
const DEFAULT_SEARCH = "Top Telugu Songs 2026";
const MAX_RESULTS = 50;

/* Curated Blockbuster Telugu Hits — verified YouTube video IDs */
const BLOCKBUSTER_SONGS = [
  {
    videoId: "m7gCn9u9bM4",
    title: "Peelings - Pushpa 2 The Rule | Allu Arjun, Rashmika | DSP",
    channel: "T-Series Telugu",
  },
  {
    videoId: "GWNrPJyRTcA",
    title: "Chuttamalle - Devara | Jr NTR, Janhvi Kapoor | Anirudh Ravichander",
    channel: "T-Series Telugu",
  },
  {
    videoId: "h-hj5UAa3qQ",
    title: "Jaragandi - Game Changer | Ram Charan, Kiara Advani | Thaman S",
    channel: "Saregama Telugu",
  },
  {
    videoId: "gh3FyLT7WVg",
    title: "Kurchi Madathapetti - Guntur Kaaram | Mahesh Babu, Sreeleela | Thaman S",
    channel: "Aditya Music",
  },
  {
    videoId: "7WYcMZXic_w",
    title: "Bhairava Anthem - Kalki 2898 AD | Prabhas, Diljit Dosanjh | Santhosh Narayanan",
    channel: "Saregama Telugu",
  },
  {
    videoId: "4_eEgJhsBMo",
    title: "Naatu Naatu - RRR | NTR, Ram Charan | M.M. Keeravaani",
    channel: "Lahari Music",
  },
  {
    videoId: "BfpW9rwPwIE",
    title: "Ticket Eh Konakunda - Tillu Square | Siddhu Jonnalagadda, Anupama",
    channel: "Aditya Music",
  },
  {
    videoId: "CKpbdCciELk",
    title: "Fear Song - Devara | Jr NTR | Anirudh Ravichander",
    channel: "T-Series Telugu",
  },
];

const THUMB_QUALITIES = ["hqdefault", "mqdefault", "sddefault"];

const getYouTubeThumbnail = (videoId, quality = "hqdefault") =>
  `https://i.ytimg.com/vi/${videoId}/${quality}.jpg`;

const normalizeSong = (song) => ({
  ...song,
  thumbnail: song.thumbnail || getYouTubeThumbnail(song.videoId),
});

const SongThumbnail = ({ song, className = "", loading = "lazy" }) => {
  const [qualityIndex, setQualityIndex] = useState(0);
  const videoId = song?.videoId;

  if (!videoId) {
    return <div className={`thumb-fallback ${className}`} aria-hidden="true">🎵</div>;
  }

  const src =
    qualityIndex < THUMB_QUALITIES.length
      ? getYouTubeThumbnail(videoId, THUMB_QUALITIES[qualityIndex])
      : null;

  if (!src) {
    return <div className={`thumb-fallback ${className}`} aria-hidden="true">🎵</div>;
  }

  return (
    <img
      className={className}
      src={src}
      alt={song.title || "Song thumbnail"}
      loading={loading}
      onError={() => setQualityIndex((prev) => prev + 1)}
    />
  );
};

async function fetchSongsFromYouTube(query) {
  try {
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
  } catch (err) {
    console.error("YouTube API fetch error:", err);
    return [];
  }
}

const NEW_SONGS_QUERY = "Latest New Telugu Songs 2026";

/** Pull movie/show name from titles like "Song - Movie | Artist" */
const extractMovieQuery = (title = "") => {
  const dashPart = title.split(/\s[-–|]\s/);
  if (dashPart.length >= 2) {
    return dashPart[1].replace(/\|.*/g, "").trim().slice(0, 40);
  }
  return title.replace(/[^a-zA-Z0-9 ]/g, " ").trim().slice(0, 30);
};

const dedupeSongs = (list = [], excludeId = null) => {
  const seen = new Set();
  return list.filter((song) => {
    if (!song?.videoId || song.videoId === excludeId || seen.has(song.videoId)) return false;
    seen.add(song.videoId);
    return true;
  });
};

const Songs = () => {
  const [searchInput, setSearchInput]   = useState("");
  const [songs, setSongs]               = useState([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState(null);
  const [playingSong, setPlayingSong]   = useState(null);
  const [relatedSongs, setRelatedSongs] = useState([]);
  const [newSongs, setNewSongs]         = useState([]);
  const [songEnded, setSongEnded]       = useState(false);
  const [isModalFS, setIsModalFS]       = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeTab, setActiveTab]       = useState("all"); // 'all' | 'blockbusters'

  const modalIframeWrapRef = useRef(null);
  const modalContentRef = useRef(null);
  const ytPlayerRef = useRef(null);

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

  /* Listen to Fullscreen state changes */
  useEffect(() => {
    const handleFSChange = () => {
      setIsModalFS(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFSChange);
    document.addEventListener("webkitfullscreenchange", handleFSChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFSChange);
      document.removeEventListener("webkitfullscreenchange", handleFSChange);
    };
  }, []);

  /* Fetch related + new songs when a song starts playing */
  useEffect(() => {
    if (!playingSong) {
      setRelatedSongs([]);
      setNewSongs([]);
      setSongEnded(false);
      return;
    }

    setSongEnded(false);

    const movieQuery = extractMovieQuery(playingSong.title);
    const excludeId = playingSong.videoId;

    Promise.all([
      fetchSongsFromYouTube(`${movieQuery} telugu songs`),
      fetchSongsFromYouTube(NEW_SONGS_QUERY),
    ]).then(([relatedResults, latestResults]) => {
      const related = dedupeSongs(relatedResults, excludeId).slice(0, 8);
      const fresh = dedupeSongs(
        [
          ...BLOCKBUSTER_SONGS,
          ...latestResults,
          ...songs,
        ],
        excludeId
      ).slice(0, 12);

      setRelatedSongs(related.length ? related : dedupeSongs(BLOCKBUSTER_SONGS, excludeId).slice(0, 6));
      setNewSongs(fresh.length ? fresh : dedupeSongs(BLOCKBUSTER_SONGS, excludeId));
    });

    // Load YouTube iFrame API for detecting video completion (ended state)
    if (!window.YT) {
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      const firstScriptTag = document.getElementsByTagName("script")[0];
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    }

    let intervalId;
    const initYTPlayer = () => {
      if (window.YT && window.YT.Player) {
        try {
          ytPlayerRef.current = new window.YT.Player("song-iframe-element", {
            events: {
              onStateChange: (event) => {
                // YT.PlayerState.ENDED is 0
                if (event.data === 0) {
                  setSongEnded(true);
                }
              },
            },
          });
        } catch (e) {
          console.log("YT Player init note:", e);
        }
      }
    };

    if (window.YT && window.YT.Player) {
      initYTPlayer();
    } else {
      intervalId = setInterval(() => {
        if (window.YT && window.YT.Player) {
          initYTPlayer();
          clearInterval(intervalId);
        }
      }, 500);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
      if (ytPlayerRef.current && ytPlayerRef.current.destroy) {
        try {
          ytPlayerRef.current.destroy();
        } catch (e) {}
      }
    };
  }, [playingSong, songs]);

  const mixedSuggestions = dedupeSongs([...relatedSongs, ...newSongs], playingSong?.videoId);

  const renderSuggestionCard = (relSong, keyPrefix) => (
    <div
      key={`${keyPrefix}-${relSong.videoId}`}
      className={`related-card ${relSong.videoId === playingSong?.videoId ? "playing" : ""}`}
      onClick={() => selectSongToPlay(relSong)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && selectSongToPlay(relSong)}
    >
      <div className="rel-thumb">
        <img src={relSong.thumbnail} alt={relSong.title} />
        <span className="rel-play">▶</span>
      </div>
      <div className="rel-info">
        <p className="rel-title">{relSong.title}</p>
        <p className="rel-channel">{relSong.channel}</p>
      </div>
    </div>
  );

  useEffect(() => {
    if (songEnded) setShowSuggestions(true);
  }, [songEnded]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchInput.trim() === "") return;
    loadSongs(`${searchInput} telugu song`);
  };

  const toggleModalFullscreen = () => {
    if (!modalIframeWrapRef.current) return;
    if (!document.fullscreenElement && !document.webkitFullscreenElement) {
      if (modalIframeWrapRef.current.requestFullscreen) {
        modalIframeWrapRef.current.requestFullscreen().catch(() => {});
      } else if (modalIframeWrapRef.current.webkitRequestFullscreen) {
        modalIframeWrapRef.current.webkitRequestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      }
    }
  };

  const selectSongToPlay = (song) => {
    setPlayingSong(song);
    setSongEnded(false);
    setShowSuggestions(false);
    if (modalContentRef.current) {
      modalContentRef.current.scrollTop = 0;
    }
  };

  const handleModalScroll = () => {
    const el = modalContentRef.current;
    if (!el) return;
    const scrolledPastPlayer = el.scrollTop > 80;
    setShowSuggestions(scrolledPastPlayer || songEnded);
  };

  const displaySongsList = activeTab === "blockbusters" ? BLOCKBUSTER_SONGS : songs;

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

        {/* ── Tab Switcher: All vs Blockbusters ─────────────────────── */}
        <div className="songs-tab-bar">
          <button
            className={`tab-pill ${activeTab === 'all' ? 'active' : ''}`}
            onClick={() => setActiveTab('all')}
          >
            🎵 All Songs ({songs.length})
          </button>
          <button
            className={`tab-pill ${activeTab === 'blockbusters' ? 'active' : ''}`}
            onClick={() => setActiveTab('blockbusters')}
          >
            🔥 Blockbuster Hits ({BLOCKBUSTER_SONGS.length})
          </button>
        </div>

        {/* ── Status Messages ────────────────── */}
        {loading && <p className="song-status">Loading Telugu songs…</p>}
        {error && <p className="song-status error">{error}</p>}
        {!loading && !error && displaySongsList.length === 0 && (
          <p className="song-status">No songs found. Try searching another song!</p>
        )}

        {/* ── Main Song Grid ──────────────────────── */}
        <div className="son">
          {!loading &&
            !error &&
            displaySongsList.map((song) => (
              <article
                className="song-card"
                key={song.videoId}
                onClick={() => selectSongToPlay(song)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && selectSongToPlay(song)}
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

        {/* ── Blockbuster Showcase Section (Scrollable Recommendations) ── */}
        {activeTab === 'all' && BLOCKBUSTER_SONGS.length > 0 && (
          <section className="blockbuster-section">
            <div className="section-header-row">
              <h2 className="section-title">🔥 Blockbuster Telugu Chartbusters</h2>
              <span className="section-sub">Must Watch Trending Hits</span>
            </div>
            <div className="blockbuster-scroll-row">
              {BLOCKBUSTER_SONGS.map((song) => (
                <div
                  className="blockbuster-card"
                  key={`bb-${song.videoId}`}
                  onClick={() => selectSongToPlay(song)}
                  role="button"
                  tabIndex={0}
                >
                  <div className="bb-thumb-wrap">
                    <img src={song.thumbnail} alt={song.title} loading="lazy" />
                    <span className="bb-play-icon">▶</span>
                  </div>
                  <h3>{song.title}</h3>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── Video Modal Player ─── */}
        {playingSong && (
          <div className="modal-backdrop" onClick={() => setPlayingSong(null)}>
            <div
              className="modal-content"
              ref={modalContentRef}
              onScroll={handleModalScroll}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-top-bar">
                <span className="now-playing-badge">▶ Now Playing in App</span>
                <button 
                  className="modal-close" 
                  onClick={() => setPlayingSong(null)}
                  aria-label="Close Player Modal"
                  title="Close"
                >
                  ✕
                </button>
              </div>

              {/* ── iFrame Container with Full Screen Button ── */}
              <div className="modal-iframe-wrap" ref={modalIframeWrapRef}>
                <iframe
                  key={playingSong.videoId}
                  id="song-iframe-element"
                  src={`https://www.youtube.com/embed/${playingSong.videoId}?autoplay=1&modestbranding=1&rel=0&iv_load_policy=3&fs=0&controls=1&disablekb=1&playsinline=1&enablejsapi=1&origin=${encodeURIComponent(window.location.origin)}`}
                  title={playingSong.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
                  frameBorder="0"
                  allowFullScreen
                />
                
                <button
                  className="modal-fs-btn"
                  onClick={toggleModalFullscreen}
                  title={isModalFS ? "Exit Fullscreen" : "Full Screen Mode"}
                  aria-label="Toggle Fullscreen"
                >
                  {isModalFS ? '🗗 Exit Full Screen' : '⛶ Full Screen'}
                </button>

                {/* Overlaid recommendations when video finishes */}
                {songEnded && (
                  <div className="song-ended-overlay">
                    <h3>🎉 Song Finished!</h3>
                    <p>Up Next: Blockbuster & Related Telugu Songs</p>
                    <div className="ended-suggestions-row">
                      {mixedSuggestions.slice(0, 3).map((item) => (
                        <div
                          key={`ended-${item.videoId}`}
                          className="ended-card"
                          onClick={() => selectSongToPlay(item)}
                        >
                          <img src={item.thumbnail} alt={item.title} />
                          <span>{item.title}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="modal-song-info">
                <h2>{playingSong.title}</h2>
                <p>{playingSong.channel}</p>
              </div>

              {/* ── Scrollable Related / Blockbuster Songs Suggestions Row ── */}
              {!showSuggestions && !songEnded && (
                <p className="scroll-hint" aria-hidden="true">↑ Scroll for Suggested &amp; Blockbuster Songs</p>
              )}

              <div className={`related-songs-container ${showSuggestions || songEnded ? 'visible' : ''}`}>
                {relatedSongs.length > 0 && (
                  <section className="suggestion-section">
                    <div className="related-header">
                      <h3>🎬 Related to This Song</h3>
                      <span>More from the same movie / artist vibe</span>
                    </div>
                    <div className="related-songs-grid">
                      {relatedSongs.map((relSong) => renderSuggestionCard(relSong, "related"))}
                    </div>
                  </section>
                )}

                {newSongs.length > 0 && (
                  <section className="suggestion-section">
                    <div className="related-header">
                      <h3>✨ New &amp; Blockbuster Telugu Songs</h3>
                      <span>Fresh hits and trending chartbusters</span>
                    </div>
                    <div className="related-songs-grid">
                      {newSongs.map((relSong) => renderSuggestionCard(relSong, "new"))}
                    </div>
                  </section>
                )}
              </div>

            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Songs;