import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { db } from '../config/firebaseConfig';
import { doc, getDoc, collection, getDocs } from 'firebase/firestore';
import Header from '../components/Header';

import BackToTournamentView from '../components/BackToTournamentView';
import Scoreboard from '../components/Scoreboard';
import LoadingScreen from '../components/LoadingScreen';

const GameView = () => {
    const { tournamentId, gameId } = useParams();
    const [gameData, setGameData] = useState(null);
    const [teams, setTeams] = useState([]);
    const [teamAPlayers, setTeamAPlayers] = useState([]);
    const [teamBPlayers, setTeamBPlayers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchGameData = async () => {
            if (tournamentId && gameId) {
                const gameRef = doc(db, 'tournaments', tournamentId, 'games', gameId);
                const gameSnapshot = await getDoc(gameRef);
                if (gameSnapshot.exists()) {
                    setGameData({ id: gameSnapshot.id, ...gameSnapshot.data() });

                    // Fetch teams data
                    const teamsRef = collection(db, 'tournaments', tournamentId, 'teams');
                    const teamsSnapshot = await getDocs(teamsRef);
                    const teamsList = teamsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                    setTeams(teamsList);

                    // Fetch players for both teams
                    const teamAPlayersRef = collection(db, 'tournaments', tournamentId, 'teams', gameSnapshot.data().teamAId, 'players');
                    const teamBPlayersRef = collection(db, 'tournaments', tournamentId, 'teams', gameSnapshot.data().teamBId, 'players');

                    const teamAPlayersSnapshot = await getDocs(teamAPlayersRef);
                    const teamBPlayersSnapshot = await getDocs(teamBPlayersRef);

                    setTeamAPlayers(teamAPlayersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
                    setTeamBPlayers(teamBPlayersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
                }
            }

            setIsLoading(false);
        };

        fetchGameData();
    }, [tournamentId, gameId]);

    if (isLoading) {
      return  <LoadingScreen />;
    }

    return (
        <div className="container">
            <Header />
            <BackToTournamentView />
            <Scoreboard 
                teamAName={teams.find(team => team.id === gameData.teamAId)?.name}
                teamAScore={gameData.scoreA}
                teamBName={teams.find(team => team.id === gameData.teamBId)?.name}
                teamBScore={gameData.scoreB}
            />

            <h3>{teams.find(team => team.id === gameData.teamAId)?.name}</h3>
            
            <table>
                <thead>
                <tr>
                    <th></th>
                    <th>Goals</th>
                    <th>Assists</th>
                    <th>Blocks</th>
                </tr>
                </thead>
                <tbody>
                {teamAPlayers.map(player => {
                    return (
                    <tr key={player.id}>
                        <td width={'30%'}>{player?.name}</td>
                        <td>{gameData.playerStats.teamA?.[player.id]?.goals || 0}</td>
                        <td>{gameData.playerStats.teamA?.[player.id]?.assists || 0}</td>
                        <td>{gameData.playerStats.teamA?.[player.id]?.blocks || 0}</td>
                    </tr>
                    );
                })}
                </tbody>
            </table>

            <h3>{teams.find(team => team.id === gameData.teamBId)?.name}</h3>

            <table>
                <thead>
                <tr>
                    <th></th>
                    <th>Goals</th>
                    <th>Assists</th>
                    <th>Blocks</th>
                </tr>
                </thead>
                <tbody>
                {teamBPlayers.map(player => {
                    return (
                    <tr key={player.id}>
                        <td width={'30%'}>{player?.name}</td>
                        <td>{gameData.playerStats.teamB?.[player.id]?.goals || 0}</td>
                        <td>{gameData.playerStats.teamB?.[player.id]?.assists || 0}</td>
                        <td>{gameData.playerStats.teamB?.[player.id]?.blocks || 0}</td>
                    </tr>
                    );
                })}
                </tbody>
            </table>
      </div>
    );
};

export default GameView;
