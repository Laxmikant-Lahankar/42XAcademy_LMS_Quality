import { useId, useRef, useState } from "react";

import Icon from "../Icon/Icon";
import { formatDate, formatDateTimeLong, initials, matchesSearch } from "../../../utils/format";
import "./StudentPicker.css";

const MAX_RESULTS = 8;

// When the student was added: exact date + time when known, otherwise the join date.
function addedLabel(student) {
  return student.createdAt ? formatDateTimeLong(student.createdAt) : formatDate(student.joinedOn);
}

// Search-as-you-type student chooser (replaces a long dropdown).
// Each result shows name + email and, on the right, when the student was added,
// so two students with the same name are easy to tell apart.
//   <StudentPicker id="field-studentId" students={list} value={studentId} onChange={setStudentId} />
function StudentPicker({ id, students, value, onChange, placeholder = "Type a student's name or email" }) {
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef(null);
  const listId = useId();

  const selected = students.find((student) => student.id === value) ?? null;

  if (selected) {
    return (
      <div className="student-picker-selected">
        <span className="student-picker-avatar" aria-hidden="true">{initials(selected.name)}</span>
        <span className="student-picker-person">
          <strong>{selected.name}</strong>
          <small>{selected.email}</small>
        </span>
        <span className="student-picker-added">
          <small>Added</small>
          {addedLabel(selected)}
        </span>
        <button
          type="button"
          className="btn btn-ghost btn-sm"
          onClick={() => {
            onChange("");
            setQuery("");
            setTimeout(() => inputRef.current?.focus(), 0);
          }}
        >
          Change
        </button>
      </div>
    );
  }

  const search = query.trim();
  const matches = search
    ? students
        .filter((student) => matchesSearch(search, student.name, student.email))
        .sort((a, b) => a.name.localeCompare(b.name) || String(b.createdAt ?? "").localeCompare(String(a.createdAt ?? "")))
    : [];
  const shown = matches.slice(0, MAX_RESULTS);
  const active = Math.min(activeIndex, Math.max(shown.length - 1, 0));

  function choose(student) {
    onChange(student.id);
    setQuery("");
    setActiveIndex(0);
  }

  function handleKeyDown(event) {
    if (event.key === "ArrowDown" && shown.length) {
      event.preventDefault();
      setActiveIndex((active + 1) % shown.length);
    } else if (event.key === "ArrowUp" && shown.length) {
      event.preventDefault();
      setActiveIndex((active - 1 + shown.length) % shown.length);
    } else if (event.key === "Enter") {
      event.preventDefault();
      if (shown[active]) choose(shown[active]);
    } else if (event.key === "Escape" && query) {
      // First Escape clears the search; a second one closes the popup.
      event.stopPropagation();
      setQuery("");
    }
  }

  return (
    <div className="student-picker">
      <div className="student-picker-input">
        <Icon name="search" size={17} />
        <input
          ref={inputRef}
          id={id}
          className="input"
          type="text"
          role="combobox"
          autoComplete="off"
          aria-expanded={Boolean(search)}
          aria-controls={listId}
          aria-activedescendant={shown[active] ? `${listId}-${shown[active].id}` : undefined}
          placeholder={placeholder}
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setActiveIndex(0);
          }}
          onKeyDown={handleKeyDown}
        />
      </div>

      {!search && <p className="student-picker-hint">Start typing to search {students.length} students.</p>}

      {search && (
        <ul id={listId} className="student-picker-list" role="listbox" aria-label="Matching students">
          {shown.map((student, index) => (
            <li
              key={student.id}
              id={`${listId}-${student.id}`}
              role="option"
              aria-selected={index === active}
              className={`student-picker-option ${index === active ? "is-active" : ""}`}
              onMouseEnter={() => setActiveIndex(index)}
              onMouseDown={(event) => {
                event.preventDefault();
                choose(student);
              }}
            >
              <span className="student-picker-person">
                <strong>
                  {student.name}
                  {student.status === "Inactive" && <span className="badge badge-danger">Inactive</span>}
                </strong>
                <small>{student.email}</small>
              </span>
              <span className="student-picker-added">
                <small>Added</small>
                {addedLabel(student)}
              </span>
            </li>
          ))}

          {matches.length === 0 && (
            <li className="student-picker-empty">No student matches “{search}”.</li>
          )}
          {matches.length > MAX_RESULTS && (
            <li className="student-picker-more">
              {matches.length - MAX_RESULTS} more — keep typing to narrow the list.
            </li>
          )}
        </ul>
      )}
    </div>
  );
}

export default StudentPicker;
