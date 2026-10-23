// Mock course catalogue based on the programmes listed on https://42xacademy.com/courses.
// Modules and lectures are kept as separate (normalized) lists, like future database tables.

const COURSE_OUTLINES = [
  {
    id: "sap-abap",
    code: "SAP-ABAP",
    title: "SAP ABAP Development",
    category: "SAP",
    level: "Beginner to Advanced",
    instructor: "Amit Deshmukh",
    durationWeeks: 14,
    description:
      "Learn ABAP from fundamentals to reports, debugging and enhancements, then build and debug a custom report and BAdI in a client-style capstone.",
    modules: [
      ["ABAP Fundamentals", ["Data types and variables", "Internal tables", "Data Dictionary basics"]],
      ["Reports Programming", ["Classical reports", "ALV reports", "Selection screens"]],
      ["Modularization & Debugging", ["Function modules", "Debugger walkthrough", "Performance analysis"]],
      ["Enhancements", ["BAdI implementation", "User exits and enhancement spots"]],
    ],
  },
  {
    id: "sap-mm",
    code: "SAP-MM",
    title: "SAP MM — Materials Management",
    category: "SAP",
    level: "Beginner",
    instructor: "Sneha Joshi",
    durationWeeks: 16,
    description:
      "Functional SAP MM with embedded ABAP and BASIS awareness. Ends with a live client simulation of a full Procure-to-Pay cycle.",
    modules: [
      ["SAP & ERP Fundamentals", ["SAP GUI navigation", "Organizational structure", "Purchasing organization"]],
      ["Master Data", ["Material master", "Business partner and vendor", "Purchasing info records"]],
      ["Procurement Cycle", ["Purchase requisition", "Purchase order", "Goods receipt", "Invoice verification"]],
      ["Capstone: P2P Simulation", ["Project brief and Jira sprints", "Root-cause analysis of a data issue"]],
    ],
  },
  {
    id: "data-engineering",
    code: "DATA-PBI",
    title: "Power BI for Data Professionals",
    category: "Data",
    level: "Beginner",
    instructor: "Kiran Patil",
    durationWeeks: 12,
    description:
      "Work with Python, SQL, data models, pipelines and reporting workflows to turn raw data into dashboard-ready insight.",
    modules: [
      ["Python for Data Engineering", ["Python scripting basics", "Data structures", "Working with APIs and files"]],
      ["SQL & Relational Databases", ["SELECT and filtering", "Joins", "Window functions"]],
      ["Data Modeling in Power BI", ["Star schema design", "DAX basics", "Building reports"]],
      ["Data Pipelines", ["Azure Data Factory introduction", "Apache Airflow overview"]],
    ],
  },
  {
    id: "power-platform",
    code: "PWR-PLT",
    title: "Power Platform Mastery",
    category: "Power Platform",
    level: "Beginner",
    instructor: "Neha Kulkarni",
    durationWeeks: 10,
    description:
      "Build practical apps, automate repetitive tasks and connect business processes with Power Apps, Power Automate and Dataverse.",
    modules: [
      ["Power Platform Fundamentals", ["Platform overview", "Environments and licensing", "Microsoft 365 integration"]],
      ["Dataverse & Data Modeling", ["Tables and columns", "Relationships"]],
      ["Power Apps", ["Canvas app basics", "Power Fx formulas", "Model-driven apps"]],
      ["Power Automate", ["Cloud flows", "Approval flows"]],
    ],
  },
  {
    id: "devops",
    code: "DEVOPS-AI",
    title: "DevOps with AI",
    category: "DevOps",
    level: "Beginner",
    instructor: "Rahul Pawar",
    durationWeeks: 16,
    description:
      "Explore Linux, Git, CI/CD, containers and Kubernetes, using AI tools to generate, debug and explain code in every module.",
    modules: [
      ["DevOps Fundamentals + AI", ["The DevOps lifecycle", "Agile and Scrum basics", "Prompting for DevOps"]],
      ["Linux", ["Essential Linux commands", "Bash scripting", "Permissions and processes"]],
      ["Git & CI/CD", ["Git workflow", "Jenkins pipelines"]],
      ["Containers", ["Docker basics", "Kubernetes introduction"]],
    ],
  },
];

const DURATIONS = [38, 45, 52, 41, 36, 48, 55, 33];

function buildCatalogue() {
  const courses = [];
  const modules = [];
  const lectures = [];

  COURSE_OUTLINES.forEach((outline) => {
    const { modules: moduleOutlines, ...course } = outline;
    courses.push({ ...course, status: "Published" });

    moduleOutlines.forEach(([moduleTitle, lectureTitles], moduleIndex) => {
      const moduleId = `${course.id}-m${moduleIndex + 1}`;

      modules.push({
        id: moduleId,
        courseId: course.id,
        title: moduleTitle,
        order: moduleIndex + 1,
      });

      lectureTitles.forEach((lectureTitle, lectureIndex) => {
        lectures.push({
          id: `${moduleId}-l${lectureIndex + 1}`,
          courseId: course.id,
          moduleId,
          title: lectureTitle,
          description: `${lectureTitle} — recorded class session for ${moduleTitle}.`,
          order: lectureIndex + 1,
          durationMinutes: DURATIONS[(moduleIndex * 3 + lectureIndex) % DURATIONS.length],
          // Recorded videos live on OneDrive. The backend will resolve a playable URL later.
          videoUrl: null,
          oneDriveItemId: null,
        });
      });
    });
  });

  return { courses, modules, lectures };
}

export const catalogueSeed = buildCatalogue();
