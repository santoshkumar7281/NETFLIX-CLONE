import React from 'react'
import './Player.css'
import back_arrow_icon from '../../assets/back_arrow_icon.png'

import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router'

const Player = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [apiData, setApiData] = useState({
    name: "",
    key: "",
    published_act: "",
    typeof: ""
  })
  const options = {
    method: 'GET',
    headers: {
      accept: 'application/json',
      Authorization: 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJkZWY4ZjMwNGZlNWU0ZTU4N2U0ZTk4MzdjYzRmMTU0OSIsIm5iZiI6MTc0MDkyNTY1NS43Nywic3ViIjoiNjdjNDZhZDc4YWMzOGM3Yjg1NGUzYzJlIiwic2NvcGVzIjpbImFwaV9yZWFkIl0sInZlcnNpb24iOjF9.n_MgttJOoFZU9SZKU0snnYZPt8TgxudrNm12B2kRBmo'
    }
  };

  useEffect(() => {
    fetch(`https://api.themoviedb.org/3/movie/${id}/videos?language=en-US`, options)
      .then(res => res.json())
      .then(res => {
        if (res.results && res.results.length > 0) {
          setApiData(res.results[0]);
        } else {
          setApiData({
            name: "Trailer not available",
            key: "",
            published_act: "N/A",
            typeof: "Trailer"
          });
        }
      })
      .catch(err => {
        console.error(err);
        setApiData({
          name: "Error loading video",
          key: "",
          published_act: "N/A",
          typeof: "Trailer"
        });
      });
  }, [id])

  return (
    <div className="player">
      <img src={back_arrow_icon} className="player-back" alt="Back" onClick={() => { navigate(-2) }} />
      {apiData && apiData.key ? (
        <iframe 
          src={`https://www.youtube.com/embed/${apiData.key}`} 
          title="trailer" 
          allowFullScreen
        ></iframe>
      ) : (
        <div className="no-video">
          <p>No trailer or video preview is available for this title.</p>
        </div>
      )}
      <div className="player-info">
        <h2 className="video-title">{apiData.name}</h2>
        <div className="video-meta">
          {apiData.published_act && apiData.published_act !== "N/A" && (
            <span className="meta-tag date">{apiData.published_act}</span>
          )}
          {apiData.typeof && (
            <span className="meta-tag type">{apiData.typeof}</span>
          )}
        </div>
      </div>
    </div>
  )
}

export default Player;