import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { db } from '../config/firebaseConfig';
import { collection, getDocs } from 'firebase/firestore';

import BackToTournamentView from '../components/BackToTournamentView';
import LoadingScreen from '../components/LoadingScreen';
import '../styles/AccumulatedStats.css'; // Add a separate CSS file for styling

const AccumulatedStats = () => {
    const { tournamentId } = useParams();
    const [games, setGames] = useState([]);
    const [teams, setTeams] = useState([]);
    const [players, setPlayers] = useState([]);
    const [accumulatedStats, setAccumulatedStats] = useState([]);
    const [filters, setFilters] = useState({
        team: 'all',
        sex: 'all',
        stat: 'total',
    });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            if (tournamentId) {
                const gamesRef = collection(db, 'tournaments', tournamentId, 'games');
                const gamesSnapshot = await getDocs(gamesRef);
                const gamesList = gamesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setGames(gamesList);

                const teamsRef = collection(db, 'tournaments', tournamentId, 'teams');
                const teamsSnapshot = await getDocs(teamsRef);
                const teamsList = teamsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setTeams(teamsList);

                const allPlayers = [];
                for (const team of teamsList) {
                    const playersRef = collection(db, 'tournaments', tournamentId, 'teams', team.id, 'players');
                    const playersSnapshot = await getDocs(playersRef);
                    const teamPlayers = playersSnapshot.docs.map(doc => ({ id: doc.id, teamId: team.id, ...doc.data() }));
                    allPlayers.push(...teamPlayers);
                }
                setPlayers(allPlayers);

                // Accumulate stats for all players
                const accumulatedStatsMap = {};
                gamesList.forEach((game) => {
                    const { playerStats } = game;
                    if (playerStats) {
                        ['teamA', 'teamB'].forEach((teamKey) => {
                            const teamPlayerStats = playerStats[teamKey] || {};
                            Object.keys(teamPlayerStats).forEach((playerId) => {
                                const playerStats = teamPlayerStats[playerId];
                                const player = allPlayers.find(p => p.id === playerId);

                                if (!accumulatedStatsMap[playerId]) {
                                    accumulatedStatsMap[playerId] = {
                                        goals: 0,
                                        assists: 0,
                                        blocks: 0,
                                        ...playerStats,
                                        playerId,
                                        teamId: player?.teamId || null
                                    };
                                } else {
                                    accumulatedStatsMap[playerId].goals += playerStats.goals || 0;
                                    accumulatedStatsMap[playerId].assists += playerStats.assists || 0;
                                    accumulatedStatsMap[playerId].blocks += playerStats.blocks || 0;
                                }
                            });
                        });
                    }
                });

                const accumulatedStatsArray = Object.values(accumulatedStatsMap);
                setAccumulatedStats(accumulatedStatsArray);
                setIsLoading(false);
            }
        };

        fetchData();
    }, [tournamentId]);

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prevFilters => ({ ...prevFilters, [name]: value }));
    };

    const totalStats = accumulatedStats.map(stat => ({
        ...stat,
        total: stat.goals + stat.assists + stat.blocks,
    }));

    const filteredStats = totalStats
        .filter((stat) => (filters.team === 'all' || stat.teamId === filters.team))
        .filter((stat) => (filters.sex === 'all' || players.find(p => p.id === stat.playerId)?.sex === filters.sex))
        .sort((a, b) => {
            if (filters.stat === 'total') {
                return b.total - a.total;
            }
            return b[filters.stat] - a[filters.stat];
        })
        .slice(0, 10);

    if (isLoading) {
        return <LoadingScreen />
    }

    return (
        <div className="container">
            <BackToTournamentView />
            <h2 className="title">Accumulated Player Stats</h2>
            <div className="filters">
                <select name="team" onChange={handleFilterChange} className="filter-select">
                    <option value="all">All Teams</option>
                    {teams.map(team => (
                        <option key={team.id} value={team.id}>{team.name}</option>
                    ))}
                </select>
                <select name="sex" onChange={handleFilterChange} className="filter-select">
                    <option value="all">Male and Female</option>
                    <option value="M">Male</option>
                    <option value="F">Female</option>
                </select>
                <select name="stat" onChange={handleFilterChange} className="filter-select">
                    <option value="total">Total Stats</option>
                    <option value="goals">Goals</option>
                    <option value="assists">Assists</option>
                    <option value="blocks">Blocks</option>
                </select>
            </div>

            <table className="stats-table">
                <thead>
                    <tr>
                        <th>Player</th>
                        <th>Sex</th>
                        <th>Team</th>
                        <th>Goals</th>
                        <th>Assists</th>
                        <th>Blocks</th>
                        <th>Total</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredStats.map(stat => {
                        const player = players.find(p => p.id === stat.playerId);
                        const team = teams.find(t => t.id === stat.teamId);
                        return (
                            <tr key={stat.playerId}>
                                <td>{player?.name}</td>
                                <td>{player?.sex}</td>
                                <td>{team?.name}</td>
                                <td>{stat.goals}</td>
                                <td>{stat.assists}</td>
                                <td>{stat.blocks}</td>
                                <td>{stat.total}</td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
};

export default AccumulatedStats;
