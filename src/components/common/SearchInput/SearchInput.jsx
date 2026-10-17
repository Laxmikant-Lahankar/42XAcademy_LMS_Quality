import Icon from "../Icon/Icon";
import "./SearchInput.css";

// Search box used on list pages (courses, resources, admin tables).
function SearchInput({ id, value, onChange, placeholder = "Search" }) {
  return (
    <div className="search-input">
      <Icon name="search" size={17} />
      <label htmlFor={id} className="visually-hidden">{placeholder}</label>
      <input
        id={id}
        type="search"
        className="input"
        placeholder={placeholder}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  );
}

export default SearchInput;
