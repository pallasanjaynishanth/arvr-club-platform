import './App.css';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import ClubSection from './components/ClubSection';
import ARVRSection from './components/ARVRSection';
import ProjectsSection from './components/ProjectsSection';
import EventsSection from './components/EventsSection';
import CommunitySection from './components/CommunitySection';
import JoinSection from './components/JoinSection';
import StudentPortal from './pages/Student/StudentPortal';

function PublicSite() {
  return <div className="app"><div className="ambient ambient-one" /><div className="ambient ambient-two" /><Navbar /><main><Hero /><ClubSection /><ARVRSection /><ProjectsSection /><EventsSection /><CommunitySection /><JoinSection /></main><footer className="footer"><div className="container footer-inner"><span>© {new Date().getFullYear()} Pragati University AR/VR Club</span><span className="footer-mark">REALITY REDEFINED <i /></span></div></footer></div>;
}

export default function App() {
  return window.location.pathname.startsWith('/student') ? <StudentPortal /> : <PublicSite />;
}
