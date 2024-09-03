import { useNavigate, useParams } from 'react-router-dom';
import '../styles/BackToTournamentView.css';

const BackToTournamentView = () => {
    const navigate = useNavigate();
    const { tournamentId } = useParams();

    return (
        <button 
            className="back-button" 
            onClick={() => navigate(`/tournament/${tournamentId}`)}
        >
            ⬅ Back to Tournament View
        </button>
    );
};

export default BackToTournamentView;
