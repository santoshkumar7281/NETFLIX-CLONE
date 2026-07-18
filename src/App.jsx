import React from 'react'
import Home from './pages/Home/Home'
import Login from './pages/Login/Login'
import { Routes, Route } from 'react-router-dom'
import Player from './pages/Player/Player'
import Movies from './pages/Movies/Movies'
import Songs from './songs/Songs'

const App = () => {
  return (
    <div>
      <Routes>
        <Route path='/'           element={<Home />} />
        <Route path='/login'      element={<Login />} />
        <Route path='/player/:id' element={<Player />} />
        <Route path='/movies'     element={<Movies />} />
        <Route path='/tvshows'    element={<Movies />} />
        <Route path='/newpopular' element={<Movies />} />
        <Route path='/songs'      element={<Songs />} />
      </Routes>
    </div>
  )
}

export default App
