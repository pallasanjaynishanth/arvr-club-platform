// Fixed club/university configuration.
// These values are intentionally NOT stored per-event — they represent the
// club's permanent identity and are pulled in by the circular template and
// the Settings page. To change them for a new academic year (e.g. new HOD
// or club president), edit this file and redeploy, or — for logo files —
// replace the assets described below.

export interface ClubConfig {
  universityName: string
  departmentName: string
  clubName: string
  facultyCoordinator: string
  hod: string
  clubPresident: string
  website: string
  email: string
  address: string[]
  universityLogoPath: string
  clubLogoPath: string
}

export const CLUB_CONFIG: ClubConfig = {
  universityName: 'PRAGATI UNIVERSITY',
  departmentName: 'Department of Computer Science and Engineering',
  clubName: 'ARVR Club',
  facultyCoordinator: 'Dr. A. Avinash',
  hod: 'Dr. D. V. Manjula',
  clubPresident: 'Thandra Harini',
  website: 'pragati.ac.in',
  email: 'pragati@pragati.ac.in',
  address: [
    '3-180, ADB Road, Surampalem,',
    'Near Peddapuram, Kakinada Dist,',
    'Andhra Pradesh, 533437',
  ],
  universityLogoPath: '/assets/pragati-logo.png',
  clubLogoPath: '/assets/arvr-logo.png',
}

/** Deterministic template copy used inside the circular — see spec section 32. */
export const CIRCULAR_COPY = {
  participationParagraph:
    'Interested students are requested to attend the event on time. Participation is open to all eligible students as specified under the target audience. Students are expected to conduct themselves with discipline and adhere to any instructions issued by the coordinators during the event.',
}
