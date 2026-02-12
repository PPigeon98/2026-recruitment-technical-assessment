function Card({ name, rooms_available, file }) {
  return (
    <>
      <div className="card">
        <img src={file} />
        <button>{name}</button>
        <div className="rooms">
          <div className="dot"></div>
          <span className="count">{rooms_available}</span>
          <span className="count2">rooms available</span>
          <span className="count3">/{rooms_available}</span>
        </div>
      </div>
    </>
  )
}

export default Card
