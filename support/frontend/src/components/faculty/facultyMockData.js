export const facultyMember = {
  id: "FAC-CSE-104",
  name: "Dr. Farhana Islam",
  department: "CSE",
};

export const statusStyles = {
  Pending: { color: "#0b6b61", bg: "#e5f8f4", ink: "PENDING REVIEW" },
  Approved: { color: "#12805c", bg: "#e7f7ef", ink: "APPROVED" },
  Rejected: { color: "#b42318", bg: "#fee4e2", ink: "REJECTED" },
  Changes: { color: "#b76e00", bg: "#fff3d6", ink: "REVISE" },
};

export const initialProposals = [
  {
    id: "CSE-26-014",
    assignedFacultyId: "FAC-CSE-104",
    title: "Smart Campus Energy Optimizer",
    student: "Nadia Rahman",
    dept: "CSE",
    date: "2026-07-02",
    status: "Pending",
    similarity: 32,
    facultyComment: "",
    notifications: [],
    summary:
      "Strong applied systems proposal with measurable energy goals. Novelty depends on using adaptive schedules rather than a conventional dashboard-only IoT implementation.",
    matches: [
      {
        project: "IoT Based Energy Monitoring",
        percent: 32,
        source:
          "The system collects classroom energy usage through IoT sensors and recommends automated device schedules based on occupancy.",
        submitted:
          "The proposed platform collects campus energy data through IoT sensors and recommends adaptive schedules using occupancy and course routines.",
      },
      {
        project: "Green Building Analytics",
        percent: 21,
        source: "Historical utility data is analyzed to identify peak load patterns across academic buildings.",
        submitted: "Historical energy usage will be analyzed to identify inefficient rooms and recurring peak load windows.",
      },
    ],
  },
  {
    id: "EEE-26-009",
    assignedFacultyId: "FAC-CSE-104",
    title: "Low-Cost ECG Screening Kiosk",
    student: "Ariq Hossain",
    dept: "EEE",
    date: "2026-07-01",
    status: "Pending",
    similarity: 18,
    facultyComment: "",
    notifications: [],
    summary:
      "Feasible hardware-software integration with clear social value. The proposal should sharpen validation plans, especially how clinical feedback will be collected ethically.",
    matches: [
      {
        project: "Portable ECG Logger",
        percent: 18,
        source: "A portable ECG logger captures heart signals and forwards readings to a web dashboard for review.",
        submitted: "A kiosk captures ECG signals and forwards summarized readings to a review dashboard for screening.",
      },
    ],
  },
  {
    id: "BBA-26-022",
    assignedFacultyId: "FAC-CSE-104",
    title: "Retail Demand Forecasting for SMEs",
    student: "Samia Karim",
    dept: "BBA",
    date: "2026-06-29",
    status: "Changes",
    similarity: 45,
    facultyComment: "Clarify what makes the SME forecasting constraints different from prior retail dashboards.",
    notifications: ["Revision request sent to Samia Karim."],
    summary:
      "Useful business analytics direction, but the current scope overlaps heavily with prior sales prediction work. Needs clearer SME-specific constraints and data acquisition detail.",
    matches: [
      {
        project: "Sales Forecasting Dashboard",
        percent: 45,
        source: "The dashboard predicts retail sales using seasonal trends, promotions, and historical transaction data.",
        submitted: "The system predicts retail demand using seasonal patterns, promotions, and historical transaction data.",
      },
      {
        project: "Inventory Planner",
        percent: 27,
        source: "Inventory reorder points are generated from weekly sales velocity and supplier lead time.",
        submitted: "Inventory suggestions will consider weekly sales velocity, supplier lead time, and stockout risk.",
      },
    ],
  },
  {
    id: "CSE-26-031",
    assignedFacultyId: "FAC-CSE-104",
    title: "Bangla Legal Aid Chatbot",
    student: "Mahir Chowdhury",
    dept: "CSE",
    date: "2026-06-27",
    status: "Approved",
    similarity: 14,
    facultyComment: "Approved. Document retrieval sources and escalation boundaries in the final report.",
    notifications: ["Approval sent to Mahir Chowdhury."],
    summary:
      "Clear archive distinction and strong language-access angle. Approved with a recommendation to document retrieval sources and escalation boundaries.",
    matches: [
      {
        project: "Legal FAQ Assistant",
        percent: 14,
        source: "The assistant retrieves legal FAQ answers and shows citations for basic civil guidance.",
        submitted: "The chatbot retrieves Bangla legal aid answers with citations and guidance boundaries.",
      },
    ],
  },
  {
    id: "ARC-26-006",
    assignedFacultyId: "FAC-CSE-104",
    title: "Flood-Responsive Shelter Planner",
    student: "Tarin Ahmed",
    dept: "ARC",
    date: "2026-06-24",
    status: "Rejected",
    similarity: 61,
    facultyComment: "Rejected for substantial overlap with prior shelter route optimization work.",
    notifications: ["Rejection sent to Tarin Ahmed."],
    summary:
      "The concept is valuable, but the submitted plan repeats prior flood shelter optimization work with limited new technical or design contribution.",
    matches: [
      {
        project: "Emergency Shelter Route Optimizer",
        percent: 61,
        source:
          "The model ranks flood shelters by route distance, crowd capacity, and water-level risk using GIS layers.",
        submitted:
          "The planner ranks flood shelters by route distance, capacity, and water-level risk using GIS data layers.",
      },
    ],
  },
  {
    id: "ENG-26-011",
    assignedFacultyId: "FAC-ENG-203",
    title: "Literature Review Coach",
    student: "Mou Sultana",
    dept: "ENG",
    date: "2026-06-23",
    status: "Pending",
    similarity: 22,
    facultyComment: "",
    notifications: [],
    summary: "Assigned to another faculty member and therefore hidden from this faculty review desk.",
    matches: [],
  },
];

export function getAssignedProposals(proposals, facultyId) {
  return proposals.filter((proposal) => proposal.assignedFacultyId === facultyId);
}
