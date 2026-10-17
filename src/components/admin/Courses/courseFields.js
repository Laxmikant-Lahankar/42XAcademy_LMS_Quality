// Course form fields shared by the Courses list and the Manage Course page.

export const CATEGORIES = ["SAP", "Data", "Power Platform", "DevOps"];

export const COURSE_FIELDS = [
  { name: "title", label: "Course title", required: true, full: true },
  { name: "code", label: "Course code", required: true, placeholder: "e.g. SAP-SD", hint: "Also used in the course link." },
  { name: "category", label: "Category", type: "select", options: CATEGORIES.map((value) => ({ value, label: value })) },
  { name: "instructor", label: "Trainer" },
  { name: "level", label: "Level", placeholder: "e.g. Beginner" },
  { name: "durationWeeks", label: "Duration (weeks)", type: "number" },
  {
    name: "status",
    label: "Status",
    type: "select",
    options: [
      { value: "Published", label: "Published (visible to students)" },
      { value: "Draft", label: "Draft (hidden from students)" },
    ],
  },
  { name: "description", label: "Description", type: "textarea" },
];

// The course code cannot change after creation because it forms the course link.
export function courseFieldsFor(course) {
  return course.id
    ? COURSE_FIELDS.map((field) => (field.name === "code" ? { ...field, type: "readonly", hint: undefined } : field))
    : COURSE_FIELDS;
}

export const EMPTY_COURSE = {
  title: "",
  code: "",
  category: "SAP",
  instructor: "",
  level: "Beginner",
  durationWeeks: 12,
  status: "Draft",
  description: "",
};
