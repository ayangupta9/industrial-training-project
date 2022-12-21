import React, { useContext } from 'react'
import RysylLogoSvg from './RysylLogoSvg'
import '../styles/Navbar.css'
import { InterviewContext } from '../contexts/InteviewContextProvider'
// import { NavLink } from 'react-router-dom'
function Navbar () {

  return (
    <nav className='navbar-utils container-fluid px-5 navbar'>
      <RysylLogoSvg />
    </nav>
  )
}

export default Navbar
