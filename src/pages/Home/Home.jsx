import React from 'react'
import './Home.css'
import Navbar from '../../components/Navbar/Navbar'

import play_icon from '../../assets/play_icon.png'
import info_icon from '../../assets/info_icon.png'
import TitleCard from '../../components/TittleCards/TitleCard'
import Footer from '../../components/Footer/Footer'

const Home = () => {
  return (
    <div className="home-container">
      <Navbar />

      {/* ── HERO BANNER SECTION ───────────────────────────────────── */}
      <section className="hero">
        <img src="/hero_banner.jpg" alt="Featured Movie Banner" className="banner-img" />
        <div className="hero-caption">
          <img src="/hero_title.png" alt="Featured Movie Title" className="caption-img" />
          <p className="hero-description">
            Discovering his ties to a secret ancient order, a young man living in modern Istanbul embarks on an epic quest to save the city from an immortal enemy.
          </p>
          <div className="hero-btns">
            <button className="btn play-btn" aria-label="Play Movie">
              <img src={play_icon} alt="" aria-hidden="true" />
              <span>Play</span>
            </button>
            <button className="btn dark-btn" aria-label="More Information">
              <img src={info_icon} alt="" aria-hidden="true" />
              <span>More Info</span>
            </button>
          </div>
          <div className="hero-cards-wrap">
            <TitleCard />
          </div>
        </div>
      </section>

      {/* ── MORE CATEGORY MOVIE CARDS ──────────────────────────────── */}
      <main className="more-cards">
        <TitleCard title={"Blockbuster Movies"} category={"top_rated"} />
        <TitleCard title={"Upcoming"} category={"upcoming"} />
        <TitleCard title={"Telugu Movies"} category={"telugu"} />
        <TitleCard title={"Latest Telugu"} category={"telugu-latest"} />
        <TitleCard title={"Top Rated Telugu"} category={"telugu-top"} />
      </main>

      <Footer />
    </div>
  )
}

export default Home
