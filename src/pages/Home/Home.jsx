import React from 'react'
import './Home.css'
import Navbar from '../../components/Navbar/Navbar'

import play_icon from '../../assets/play_icon.png'
import info_icon from '../../assets/info_icon.png'
import TitleCard from '../../components/TittleCards/TitleCard'
import Footer from '../../components/Footer/Footer'




const Home = () => {
  return (
    <div>
        <Navbar/>
        <div className="hero">
            <img src="/hero_banner.jpg" alt="Hero Banner" className="banner-img" />
            <div className="hero-caption">
                <img src="/hero_title.png" alt="Hero Title" className="caption-img" />
                <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Natus maxime eligendi nostrum repellat eum consectetur quae dicta explicabo atque cum corporis sit quas quaerat non a dolorum, fugit obcaecati consequatur.</p>
                <div className="hero-btns">
                  <button className="btn"><img src={play_icon} alt="" />play</button>
                  <button className="btn dark-btn"><img src={info_icon} alt="" />More Info</button>
                </div>
                <TitleCard/>
            </div>
        </div>
        <div className="more-cards">
          <TitleCard title={"Blockbuster Movies"} category={"top_rated"}/>
          <TitleCard title={"Upcoming"}  category={"upcoming"}/>
          
          <TitleCard title={"Telugu Movies"} category={"telugu"} />
          <TitleCard title={"Latest Telugu"} category={"telugu-latest"} />
          <TitleCard title={"Top Rated Telugu"} category={"telugu-top"} />

        <Footer/>
        </div>
      
    </div>
  )
}

export default Home
