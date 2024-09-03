import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { db } from '../config/firebaseConfig';
import { collection, addDoc, getDocs } from 'firebase/firestore';

import Header from './Header';
import PlayerStatsHeader from './PlayerStatsHeader';
import Scoreboard from './Scoreboard';
import BackToTournamentView from './BackToTournamentView';
import LoadingScreen from './LoadingScreen';

import '../styles/AddGame.css';

const AddGame = () => {
    const { tournamentId } = useParams();
    const navigate = useNavigate();
    const [teams, setTeams] = useState([]);
    const [teamAId, setTeamAId] = useState('');
    const [teamBId, setTeamBId] = useState('');
    const [teamAPlayers, setTeamAPlayers] = useState([]);
    const [teamBPlayers, setTeamBPlayers] = useState([]);
    const [scoreA, setScoreA] = useState(0);
    const [scoreB, setScoreB] = useState(0);
    const [gameDateTime, setGameDateTime] = useState('');
    const [playerStats, setPlayerStats] = useState({});
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (tournamentId) {
            const fetchTeams = async () => {
                const teamsRef = collection(db, 'tournaments', tournamentId, 'teams');
                const teamsSnapshot = await getDocs(teamsRef);
                const teamsList = teamsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setTeams(teamsList);
            };

            fetchTeams();
        }
    }, [tournamentId]);

    useEffect(() => {
        const calculateScores = () => {
            let newScoreA = 0;
            let newScoreB = 0;

            if (playerStats.teamA) {
                Object.values(playerStats.teamA).forEach(player => {
                    newScoreA += player.goals || 0;
                });
            }

            if (playerStats.teamB) {
                Object.values(playerStats.teamB).forEach(player => {
                    newScoreB += player.goals || 0;
                });
            }

            setScoreA(newScoreA);
            setScoreB(newScoreB);
        };

        calculateScores();
    }, [playerStats]);

    const handleTeamSelect = async () => {
        if (teamAId && teamBId) {
            const teamAPlayersRef = collection(db, 'tournaments', tournamentId, 'teams', teamAId, 'players');
            const teamBPlayersRef = collection(db, 'tournaments', tournamentId, 'teams', teamBId, 'players');

            const teamAPlayersSnapshot = await getDocs(teamAPlayersRef);
            const teamBPlayersSnapshot = await getDocs(teamBPlayersRef);

            setTeamAPlayers(teamAPlayersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
            setTeamBPlayers(teamBPlayersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        }
    };

    const handlePlayerStatChange = (team, playerId, stat, value) => {
        setPlayerStats(prevStats => ({
            ...prevStats,
            [team]: {
                ...(prevStats[team] || {}),
                [playerId]: {
                    ...(prevStats[team]?.[playerId] || {}),
                    [stat]: value
                }
            }
        }));
    };

    const handleAddGame = async () => {
        let totalAssistsA = 0;
        let totalAssistsB = 0;

        Object.values(playerStats.teamA).forEach(player => {
            totalAssistsA += player.assists || 0;
        });

        Object.values(playerStats.teamB).forEach(player => {
            totalAssistsB += player.assists || 0;
        });

        if (totalAssistsA == scoreA && totalAssistsB == scoreB) {
            setIsLoading(true);

            try {
                const gameData = {
                    teamAId,
                    teamBId,
                    scoreA,
                    scoreB,
                    dateTime: new Date(gameDateTime),
                    playerStats
                };

                await addDoc(collection(db, 'tournaments', tournamentId, 'games'), gameData);

                setIsLoading(false);

                alert('Game added successfully!');
                navigate(`/tournament/${tournamentId}`);
            } catch (error) {
                console.error('Error adding game:', error);
                alert('Failed to add game. Please try again.');
            }
        } else {
            alert('Goals and assists mismatch! Please double check the stats.');
        }
    };

    if (isLoading) {
        return <LoadingScreen />
    }

    return (
        <div className="add-game-container">
            <Header />
            <h2 className="page-title">Add New Game</h2>
            <BackToTournamentView />
            <div className='team-selector'>
                <div className='team-select'>
                    <label>
                        Team A:
                        <select
                            value={teamAId}
                            onChange={(e) => setTeamAId(e.target.value)}
                        >
                            <option value="">Select Team A</option>
                            {teams.map(team => (
                                <option key={team.id} value={team.id}>
                                    {team.name}
                                </option>
                            ))}
                        </select>
                    </label>
                </div>
                <div className='team-select'>
                    <label>
                        Team B:
                        <select
                            value={teamBId}
                            onChange={(e) => setTeamBId(e.target.value)}
                        >
                            <option value="">Select Team B</option>
                            {teams.map(team => (
                                <option key={team.id} value={team.id}>
                                    {team.name}
                                </option>
                            ))}
                        </select>
                    </label>
                </div>
                <button className='load-players-btn' onClick={handleTeamSelect}>Load Players</button>
            </div>

            {teamAPlayers.length > 0 && teamBPlayers.length > 0 && (
                <div className='game-details'>
                    <Scoreboard 
                        teamAName={teams.find(team => team.id === teamAId)?.name}
                        teamAScore={scoreA}
                        teamBName={teams.find(team => team.id === teamBId)?.name}
                        teamBScore={scoreB}
                    />
                    <div className='player-stats-section'>
                        <h3>Edit Player Stats for {teams.find(team => team.id === teamAId)?.name}</h3>
                        <PlayerStatsHeader />
                        {teamAPlayers.map(player => (
                            <div key={player.id} className='player-stats'>
                                <div className='player-name'>
                                    <p>{player.nickname} {player.role !== 'member' && <span>({player.role})</span>}</p>
                                </div>
                                <div className='stat-input'>
                                    <input
                                        type="number"
                                        value={playerStats['teamA']?.[player.id]?.goals || 0}
                                        onChange={(e) => handlePlayerStatChange('teamA', player.id, 'goals', parseInt(e.target.value))}
                                        placeholder="Goals"
                                    />
                                </div>
                                <div className='stat-input'>
                                    <input
                                        type="number"
                                        value={playerStats['teamA']?.[player.id]?.assists || 0}
                                        onChange={(e) => handlePlayerStatChange('teamA', player.id, 'assists', parseInt(e.target.value))}
                                        placeholder="Assists"
                                    />
                                </div>
                                <div className='stat-input'>
                                    <input
                                        type="number"
                                        value={playerStats['teamA']?.[player.id]?.blocks || 0}
                                        onChange={(e) => handlePlayerStatChange('teamA', player.id, 'blocks', parseInt(e.target.value))}
                                        placeholder="Blocks"
                                    />
                                </div>
                            </div>
                        ))}

                        <h3>Edit Player Stats for {teams.find(team => team.id === teamBId)?.name}</h3>
                        <PlayerStatsHeader />
                        {teamBPlayers.map(player => (
                            <div key={player.id} className='player-stats'>
                                <div className='player-name'>
                                    <p>{player.nickname} {player.role !== 'member' && <span>({player.role})</span>}</p>
                                </div>
                                <div className='stat-input'>
                                    <input
                                        type="number"
                                        value={playerStats['teamB']?.[player.id]?.goals || 0}
                                        onChange={(e) => handlePlayerStatChange('teamB', player.id, 'goals', parseInt(e.target.value))}
                                        placeholder="Goals"
                                    />
                                </div>
                                <div className='stat-input'>
                                    <input
                                        type="number"
                                        value={playerStats['teamB']?.[player.id]?.assists || 0}
                                        onChange={(e) => handlePlayerStatChange('teamB', player.id, 'assists', parseInt(e.target.value))}
                                        placeholder="Assists"
                                    />
                                </div>
                                <div className='stat-input'>
                                    <input
                                        type="number"
                                        value={playerStats['teamB']?.[player.id]?.blocks || 0}
                                        onChange={(e) => handlePlayerStatChange('teamB', player.id, 'blocks', parseInt(e.target.value))}
                                        placeholder="Blocks"
                                    />
                                </div>
                            </div>
                        ))}

                        <div className='save-game-container'>
                            <div className='game-date-time'>
                                <label>
                                    Game Date and Time:
                                    <input
                                        type="datetime-local"
                                        value={gameDateTime}
                                        onChange={(e) => setGameDateTime(e.target.value)}
                                    />
                                </label>
                            </div>
                            <button className='save-game-btn' onClick={handleAddGame}>Save Game</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AddGame;
