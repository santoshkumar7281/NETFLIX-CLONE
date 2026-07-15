import React, { useEffect,useState } from 'react'
import './TitleCard.css'
import cards_data from '../../assets/cards/Cards_data'
import { useRef } from 'react'
import { Link } from 'react-router'

const TitleCard = ({title,category}) => {

  const[apiData,setApiData] = useState([])

  const cardsRef = useRef()

  const options = {
  method: 'GET',
  headers: {
    accept: 'application/json',
    Authorization: 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJkZWY4ZjMwNGZlNWU0ZTU4N2U0ZTk4MzdjYzRmMTU0OSIsIm5iZiI6MTc0MDkyNTY1NS43Nywic3ViIjoiNjdjNDZhZDc4YWMzOGM3Yjg1NGUzYzJlIiwic2NvcGVzIjpbImFwaV9yZWFkIl0sInZlcnNpb24iOjF9.n_MgttJOoFZU9SZKU0snnYZPt8TgxudrNm12B2kRBmo'
  }
};



const handleWheel = (event)=>{
  event.preventDefault();
  cardsRef.current.scrollLeft +=event.deltaY
}

// useEffect(()=>{
//   fetch(
//   `https://api.themoviedb.org/3/discover/movie?with_original_language=te&sort_by=popularity.desc&page=1`,
//   options
// )
//   .then(res => res.json())
//   .then(res => setApiData(res.results))
//   .catch(err => console.error(err));


//   cardsRef.current.addEventListener('wheel',handleWheel);
// },[])

useEffect(() => {
  const today = new Date().toISOString().split('T')[0];
  let url = "";

  switch (category) {
    case "top_rated":
      url = "https://api.themoviedb.org/3/movie/top_rated?language=en-US&page=1";
      break;

    case "popular":
      url = "https://api.themoviedb.org/3/movie/popular?language=en-US&page=1";
      break;

    case "upcoming":
      url = "https://api.themoviedb.org/3/movie/upcoming?language=en-US&page=2";
      break;

    case "now_playing":
      url = "https://api.themoviedb.org/3/movie/now_playing?language=en-US&page=1";
      break;

    case "telugu":
      url =
        "https://api.themoviedb.org/3/discover/movie?with_original_language=te&sort_by=popularity.desc";
      break;

    case "telugu-top":
      url =
        "https://api.themoviedb.org/3/discover/movie?with_original_language=te&sort_by=vote_average.desc&vote_count.gte=100";
      break;

    case "telugu-latest":
      url =
        `https://api.themoviedb.org/3/discover/movie?with_original_language=te&sort_by=release_date.desc&primary_release_date.lte=${today}`;
      break;

    default:
      url = "https://api.themoviedb.org/3/movie/now_playing?language=en-US&page=1";
  }

  fetch(url, options)
    .then((res) => res.json())
    .then((res) => {
      // Filter out movies that have absolutely no backdrop or poster path
      const filtered = (res.results || []).filter(movie => movie.backdrop_path || movie.poster_path);
      setApiData(filtered);
    })
    .catch((err) => console.error(err));

}, [category]);

  return (
    <div className="title-cards">
      <h2>{title?title:"Popular on Netflix"}</h2>
      <div className="card-list" ref={cardsRef}>
       {apiData.map((card,index)=>{
        const imgPath = card.backdrop_path || card.poster_path;
        return <Link to={`/player/${card.id}`} className="card" key={index}>
          <img src={`https://image.tmdb.org/t/p/w500/${imgPath}`} alt={card.original_title} />
          <p>{card.original_title}</p>
        </Link>
       })
       } 
      </div>
      
    </div>
  )
}

export default TitleCard
