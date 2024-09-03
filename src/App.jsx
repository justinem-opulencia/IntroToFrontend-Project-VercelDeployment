import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { db } from './config/firebaseConfig';
import { collection, getDocs } from 'firebase/firestore';

import LoadingScreen from './components/LoadingScreen';

import './styles/App.css'
import './styles/AppContainer.css'

const App = () => {
    const [tournaments, setTournaments] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    // Fetch all tournaments from Firestore
    useEffect(() => {
        const fetchTournaments = async () => {
            const tournamentsCollection = collection(db, 'tournaments');
            const tournamentSnapshot = await getDocs(tournamentsCollection);
            const tournamentList = tournamentSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
        setTournaments(tournamentList);
        setIsLoading(false);
        };
        fetchTournaments();
    }, []);

    if (isLoading) {
        return <LoadingScreen />
    }

    return (
        <div className="app-container">
            <h1 className="app-title">Ultimate Frisbee Statistics Tracker</h1>
            <h2>Tournaments</h2>
            <div className="tournament-list">
                {tournaments.map((tournament) => (
                    <Link to={`/tournament/${tournament.id}`} key={tournament.id} className="tournament-card">
                        <div className="tournament-card-content">
                            <h3>{tournament.name}</h3>
                            <p>
                                Start: {new Date(tournament.startDate.seconds * 1000).toLocaleDateString()} <br />
                                End: {new Date(tournament.endDate.seconds * 1000).toLocaleDateString()}
                            </p>
                        </div>
                    </Link>
                ))}
            </div>
            <Link to="/add-tournament" className="add-tournament-btn">+ Add New Tournament</Link>
        </div>
    );
};

export default App;