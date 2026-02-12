import FilterAltIcon from '@mui/icons-material/FilterAlt'
import FilterListIcon from '@mui/icons-material/FilterList'
import SearchIcon from '@mui/icons-material/Search'

function Bar2() {
  return (
    <>
      <div className="bar2">
        <div className="filter"><FilterAltIcon /> Filters</div>
        <div className="search">
          <SearchIcon />
          <input type="text" placeholder="Search for a building..." />
        </div>
        <div className="sort"><FilterListIcon /> Sort</div>
      </div>
    </>
  )
}

export default Bar2
