import Card from './Card'
import Data from '../../../data.json'

function Grid() {
  return (
    <>
      <div className="grid">
        {Data.map((building) => (
          <div key={building.name}>
            <Card name={building.name} rooms_available={building.rooms_available} file={building.building_picture} />
          </div>
        ))}
      </div>
    </>
  )
}

export default Grid
