import { useState } from 'react'
import SearchIcon from '@mui/icons-material/Search'
import MapIcon from '@mui/icons-material/Map'
import GridViewIcon from '@mui/icons-material/GridView'
import DarkModeIcon from '@mui/icons-material/DarkMode'

function Bar1() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="bar1">
      <img className="logo" src={isOpen ? '/freeRoomsLogo.png' : '/freeroomsDoorClosed.png'} onClick={() => setIsOpen(!isOpen)} />
      <p className="title">Freerooms</p>
      <div className="right">
        <div className="icons"><SearchIcon /></div>
        <div className="icons active"><GridViewIcon /></div>
        <div className="icons"><MapIcon /></div>
        <div className="icons"><DarkModeIcon /></div>
      </div>
    </div>
  )
}

export default Bar1
