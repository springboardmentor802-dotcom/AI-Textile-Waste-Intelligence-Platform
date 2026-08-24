import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './BackToDashboard.css';

/* ---------------------------------------------------------
   Small secondary nav button used at the top of pages reached
   from the Dashboard's "Continue Your Work" cards (Sustainability
   Overview, Carbon Reduction, Waste Diversion). Deliberately
   styled as a quiet secondary action, not a CTA.
---------------------------------------------------------- */
function BackToDashboard() {
  const navigate = useNavigate();

  return (
    <button
      type="button"
      className="back-to-dashboard"
      onClick={() => navigate('/dashboard')}
    >
      <ArrowLeft size={15} />
      <span>Back to Dashboard</span>
    </button>
  );
}

export default BackToDashboard;