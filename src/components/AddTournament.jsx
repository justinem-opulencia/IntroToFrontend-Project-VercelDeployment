import React, { useState } from 'react';
import Papa from 'papaparse';
import { useNavigate } from 'react-router-dom';
import { db } from '../config/firebaseConfig';
import { collection, addDoc } from 'firebase/firestore';

import Header from '../components/Header';
import '../styles/AddTournament.css'; 

const AddTournament = () => {
    const [tournamentName, setTournamentName] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [teams, setTeams] = useState([{ name: '', players: [{ name: '', sex: 'M', nickname: '', role: 'member' }] }]);
    const navigate = useNavigate();
    const [showHelp, setShowHelp] = useState(false);

    const handleAddTeam = () => {
        setTeams([...teams, { name: '', players: [{ name: '', sex: 'M', nickname: '', role: 'member' }] }]);
    };

    const handleRemoveTeam = (index) => {
        setTeams(teams.filter((_, i) => i !== index));
    };

    const handleAddPlayer = (teamIndex) => {
        const newTeams = [...teams];
        newTeams[teamIndex].players.push({ name: '', sex: 'M', nickname: '', role: 'member' });
        setTeams(newTeams);
    };

    const handleRemovePlayer = (teamIndex, playerIndex) => {
        const newTeams = [...teams];
        newTeams[teamIndex].players = newTeams[teamIndex].players.filter((_, i) => i !== playerIndex);
        setTeams(newTeams);
    };

    const handleInputChange = (value, teamIndex, playerIndex = null, field = null) => {
        const newTeams = [...teams];
        if (playerIndex === null) {
            newTeams[teamIndex].name = value;
        } else {
            newTeams[teamIndex].players[playerIndex][field] = value;
        }
        setTeams(newTeams);
    };

    const handleSaveTournament = async () => {
        console.log('Saving Tournament');

        for (const team of teams) {
            console.log('Team ' + team.name);
            console.log('Players');

            for (const player of team.players) {
                console.log(player.name);
            }
        }

        try {
            const tournamentDoc = await addDoc(collection(db, 'tournaments'), {
                name: tournamentName,
                startDate: new Date(startDate),
                endDate: new Date(endDate),
            });

            for (const team of teams) {
                const teamDoc = await addDoc(
                    collection(db, 'tournaments', tournamentDoc.id, 'teams'),
                    { name: team.name }
                );

                for (const player of team.players) {
                    await addDoc(
                        collection(db, 'tournaments', tournamentDoc.id, 'teams', teamDoc.id, 'players'),
                        { ...player, goals: 0, assists: 0, blocks: 0 }
                    );
                }
            }
            alert('Tournament saved successfully!');
            navigate('/');
        } catch (error) {
            console.error('Error adding tournament:', error);
            alert('Failed to save the tournament. Please try again.');
        }
    };

    const handleFileUpload = (event) => {
        const file = event.target.files[0];
        if (file) {
            Papa.parse(file, {
                header: true,
                skipEmptyLines: true,
                complete: (result) => {
                    const newTeams = result.data.reduce((acc, item) => {
                        const teamIndex = acc.findIndex(team => team.name === item['Team Name']);
                        if (teamIndex === -1) {
                            acc.push({
                                name: item['Team Name'],
                                players: [{
                                    name: item['Player Name'],
                                    sex: item['Sex'],
                                    nickname: item['Nickname'],
                                    role: item['Role']
                                }]
                            });
                        } else {
                            acc[teamIndex].players.push({
                                name: item['Player Name'],
                                sex: item['Sex'],
                                nickname: item['Nickname'],
                                role: item['Role']
                            });
                        }
                        return acc;
                    }, []);
                    setTeams(newTeams);
                    console.log(newTeams);
                },
                error: (error) => {
                    console.error('Error parsing CSV:', error);
                }
            });
        }
    };

    return (
        <div className="container">
            <Header />
            <h2 className="page-title">Add New Tournament</h2>
            <div className="tournament-form">
                <div className="form-group">
                    <label>
                        Tournament Name:
                        <input
                            type="text"
                            value={tournamentName}
                            onChange={(e) => setTournamentName(e.target.value)}
                            className="form-control"
                        />
                    </label>
                </div>
                <div className="form-group">
                    <label>
                        Start Date:
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="form-control"
                        />
                    </label>
                </div>
                <div className="form-group">
                    <label>
                        End Date:
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="form-control"
                        />
                    </label>
                </div>
            </div>

            <h3>Teams</h3>
            <div className="file-upload">
                <div>
                    <p>Upload using file <button className="help-btn" onClick={() => setShowHelp(!showHelp)} aria-label="Help">?</button> </p> 
                    <input type="file" accept=".csv" onChange={handleFileUpload} />
                </div>
                <button onClick={handleSaveTournament} className="save-tournament-btn">Save Tournament</button>
            </div>
            {showHelp && (
                    <div className="help-popup">
                        <h4>Help Information</h4>
                        <p>Upload a CSV file containing tournament details. The CSV should have columns for Team Name, Player Name, Sex, Nickname, and Role.</p>
                        <br/>
                        <p>Example:</p>
                        <br/>
                        <p>Team Name,Player Name,Sex,Nickname,Role</p>
                        <p>Team A,John Doe,M,JD,member</p>
                        <p>Team A,Jane Smith,F,JS,team captain</p>
                        <p>Team B,Tom Brown,M,TB,spirit captain</p>
                        <p>...</p>
                        <button className="close-help-btn" onClick={() => setShowHelp(false)} aria-label="Close Help">Close</button>
                    </div>
            )}

            {teams.map((team, teamIndex) => (
                <div key={teamIndex} className="team-form-container">
                    <div className="team-form">
                        <div className="form-group">
                            <label>
                                Team Name:
                                <input
                                    type="text"
                                    value={team.name}
                                    onChange={(e) => handleInputChange(e.target.value, teamIndex)}
                                    className="form-control"
                                />
                            </label>
                        </div>
                        <button onClick={() => handleRemoveTeam(teamIndex)} className="remove-btn">Remove Team</button>
                    </div>
                    <h4>Players</h4>
                    <div className="player-form-headers">
                        <div className="player-header"><label>Player Name</label></div>
                        <div className="player-header"><label>Nickname</label></div>
                        <div className="player-header"><label>Sex</label></div>
                        <div className="player-header"><label>Team Role</label></div>
                        <div className="player-header"></div>
                    </div>
                    {team.players.map((player, playerIndex) => (
                        <div key={playerIndex} className="player-form">
                            <div className="form-group">
                                <input
                                    type="text"
                                    value={player.name}
                                    onChange={(e) => handleInputChange(e.target.value, teamIndex, playerIndex, 'name')}
                                    className="form-control"
                                />
                            </div>
                            <div className="form-group">
                                <input
                                    type="text"
                                    value={player.nickname}
                                    onChange={(e) => handleInputChange(e.target.value, teamIndex, playerIndex, 'nickname')}
                                    className="form-control"
                                />
                            </div>
                            <div className="form-group">
                                <select
                                    value={player.sex}
                                    onChange={(e) => handleInputChange(e.target.value, teamIndex, playerIndex, 'sex')}
                                    className="form-control"
                                >
                                    <option value="M">Male</option>
                                    <option value="F">Female</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <select
                                    value={player.role}
                                    onChange={(e) => handleInputChange(e.target.value, teamIndex, playerIndex, 'role')}
                                    className="form-control"
                                >
                                    <option value="member">Member</option>
                                    <option value="team captain">Team Captain</option>
                                    <option value="spirit captain">Spirit Captain</option>
                                </select>
                            </div>
                            <button onClick={() => handleRemovePlayer(teamIndex, playerIndex)} className="remove-btn">Remove Player</button>
                        </div>
                    ))}
                    <button onClick={() => handleAddPlayer(teamIndex)} className="add-player-btn">Add Player</button>
                </div>
            ))}

            <div className='add-team'>
                <button onClick={handleAddTeam} className="add-team-btn">Add Team</button>
            </div>
        </div>
    );
};

export default AddTournament;
