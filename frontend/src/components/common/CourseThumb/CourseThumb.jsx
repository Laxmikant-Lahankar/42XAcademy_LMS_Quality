import Icon from "../Icon/Icon";
import "./CourseThumb.css";

const CATEGORY_ICONS = {
  SAP: "layers",
  Data: "chart",
  "Power Platform": "dashboard",
  DevOps: "cloud",
};

// Simple branded course cover (no images needed): category colour, icon and course code.
function CourseThumb({ course, size = "md" }) {
  const category = (course.category || "SAP").toLowerCase().replace(/\s+/g, "-");

  return (
    <div className={`course-thumb course-thumb-${category} course-thumb-${size}`} aria-hidden="true">
      <Icon name={CATEGORY_ICONS[course.category] ?? "book"} size={size === "sm" ? 20 : 28} />
      {size !== "sm" && <span className="course-thumb-code">{course.code}</span>}
    </div>
  );
}

export default CourseThumb;
