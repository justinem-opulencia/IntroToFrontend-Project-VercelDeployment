import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { db } from '../config/firebaseConfig';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';

import Header from '../components/Header';
import GameCard from '../components/GameCard';
import LoadingScreen from '../components/LoadingScreen';

import '../styles/TournamentView.css'

const TournamentView = () => {
    const { tournamentId } = useParams();
    const navigate = useNavigate();
    const [tournamentName, setTournamentName] = useState('');
    const [games, setGames] = useState([]);
    const [teams, setTeams] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            if (tournamentId) {
                const tournamentRef = doc(db, 'tournaments', tournamentId);
                const tournamentSnapshot = await getDoc(tournamentRef);
                setTournamentName(tournamentSnapshot.data().name);

                const teamsRef = collection(db, 'tournaments', tournamentId, 'teams');
                const teamsSnapshot = await getDocs(teamsRef);
                const teamsList = teamsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setTeams(teamsList);

                const gamesRef = collection(db, 'tournaments', tournamentId, 'games');
                const gamesSnapshot = await getDocs(gamesRef);
                const gamesList = gamesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setGames(gamesList);
            }

            setIsLoading(false);
        };
        fetchData();
    }, [tournamentId]);

    if (isLoading) {
        return <LoadingScreen />;
    }

    return (
        <div className="tournament-view">
            <Header />
            <div className="tournament-details">
                <h2 className="tournament-title">{tournamentName}</h2>
                <div className="stats-section">
                    <button className="btn btn-primary" onClick={() => navigate(`/tournament/${tournamentId}/add-game`)}>🥏  Add New Game</button>
                    <Link to={`/tournament/${tournamentId}/stats`} className="btn btn-secondary">📊 View Accumulated Stats</Link>
                </div>
            </div>

            <div className="games-section">
                <h3 className="section-title">Games History</h3>
                {games.length > 0 ? (
                    <div className="games-list">
                        {games.map((game) => (
                            <div key={game.id} className="game-item">
                                <Link to={`/tournament/${tournamentId}/game/${game.id}`} className="game-link">
                                    <GameCard 
                                        teamAName={teams.find(t => t.id === game.teamAId)?.name}
                                        teamAScore={game.scoreA}
                                        teamBName={teams.find(t => t.id === game.teamBId)?.name}
                                        teamBScore={game.scoreB}
                                        dateTime={game.dateTime.seconds * 1000}
                                    />
                                </Link>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p>No games found.</p>
                )}
            </div>
        </div>
    );
};

export default TournamentView;
