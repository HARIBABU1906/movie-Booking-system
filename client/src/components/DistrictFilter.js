export default function DistrictFilter({ districts, district, setDistrict }) {
  return (
    <div className="filter">
      <label htmlFor="district" className="filter-label">
        Select District
      </label>
      <select
        id="district"
        value={district}
        onChange={(e) => setDistrict(e.target.value)}
      >
        {districts.map((item) => (
          <option key={item} value={item}>
            {item}
          </option>
        ))}
      </select>
    </div>
  );
}

