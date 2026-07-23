import React, { useEffect, useState, useRef } from 'react'
import './TitleCard.css'
import { Link } from 'react-router-dom'

const TitleCard = ({ title, category }) => {
  const [apiData, setApiData] = useState([])
  const cardsRef = useRef(null)

  const options = {
    method: 'GET',
    headers: {
      accept: 'application/json',
      Authorization:
        'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJkZWY4ZjMwNGZlNWU0ZTU4N2U0ZTk4MzdjYzRmMTU0OSIsIm5iZiI6MTc0MDkyNTY1NS43Nywic3ViIjoiNjdjNDZhZDc4YWMzOGM3Yjg1NGUzYzJlIiwic2NvcGVzIjpbImFwaV9yZWFkIl0sInZlcnNpb24iOjF9.n_MgttJOoFZU9SZKU0snnYZPt8TgxudrNm12B2kRBmo',
    },
  }

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0]
    let url = ''

    switch (category) {
      case 'top_rated':
        url = 'https://api.themoviedb.org/3/movie/top_rated?language=en-US&page=1'
        break

      case 'popular':
        url = 'https://api.themoviedb.org/3/movie/popular?language=en-US&page=1'
        break

      case 'upcoming':
        url = 'https://api.themoviedb.org/3/movie/upcoming?language=en-US&page=2'
        break

      case 'now_playing':
        url = 'https://api.themoviedb.org/3/movie/now_playing?language=en-US&page=1'
        break

      case 'telugu':
        url =
          'https://api.themoviedb.org/3/discover/movie?with_original_language=te&sort_by=popularity.desc'
        break

      case 'telugu-top':
        url =
          'https://api.themoviedb.org/3/discover/movie?with_original_language=te&sort_by=vote_average.desc&vote_count.gte=100'
        break

      case 'telugu-latest':
        url = `https://api.themoviedb.org/3/discover/movie?with_original_language=te&sort_by=release_date.desc&primary_release_date.lte=${today}`
        break

      default:
        url = 'https://api.themoviedb.org/3/movie/now_playing?language=en-US&page=1'
    }

    fetch(url, options)
      .then((res) => res.json())
      .then((res) => {
        const filtered = (res.results || []).filter(
          (movie) => movie.backdrop_path || movie.poster_path
        )
        setApiData(filtered)
      })
      .catch((err) => console.error(err))
  }, [category])

  return (
    <section className="title-cards">
      <h2>{title ? title : 'Popular on Netflix'}</h2>
      <div className="card-list" ref={cardsRef}>
        {apiData.map((card) => {
          const imgPath = card.backdrop_path || card.poster_path
          const movieTitle = card.title || card.original_title || 'Movie'
          return (
            <Link 
              to={`/player/${card.id}`} 
              className="card" 
              key={card.id}
              aria-label={`Watch trailer for ${movieTitle}`}
            >
              <div className="card-img-wrap">
                <img
                  src={`https://image.tmdb.org/t/p/w500/${imgPath}`}
                  alt={movieTitle}
                  loading="lazy"
                />
              </div>
              <p className="card-title-text">{movieTitle}</p>
            </Link>
          )
        })}
      </div>
    </section>
  )
}

export default TitleCard
