import { EventFormData } from '@/types/event'

/** Sample event used for local testing — see spec section 34. */
export const DEMO_EVENT: EventFormData = {
  eventName: 'Virtual Reality Workshop',
  eventType: 'Workshop',
  eventDate: '2026-06-15',
  startTime: '10:00 AM',
  endTime: '4:00 PM',
  venue: 'CSE Seminar Hall',
  description:
    'A hands-on workshop introducing students to virtual reality concepts, applications, and practical experiences using immersive technologies.',
  objectives: [
    'Introduce students to the fundamentals of Virtual Reality.',
    'Provide practical exposure to VR technologies.',
    'Encourage students to explore immersive technology applications.',
  ],
  targetAudience: 'All CSE Students',
  registrationRequired: false,
  registrationLink: '',
  guestName: '',
  guestDesignation: '',
  guestOrganization: '',
  studentCoordinators: [''],
  specialInstructions: '',
}
