import React from 'react';
import '../styles/GameCard.css';

const GameCard = ({ teamAName, teamAScore, teamBName, teamBScore, dateTime }) => {
    const isTeamAWinner = teamAScore > teamBScore;
    const isTeamBWinner = teamBScore > teamAScore;

    return (
        <div className="game-card">
            <div className={`team teamA ${isTeamAWinner ? 'winner' : ''}`}>
                <span className="team-name">{teamAName}</span>
                <span className="team-score">{teamAScore}</span>
            </div>
            
            <div className="score-info">
                <span className="versus">VS</span>
                {dateTime && <span className="game-time">{new Date(dateTime).toLocaleString()}</span>}
            </div>
            
            <div className={`team teamB ${isTeamBWinner ? 'winner' : ''}`}>
                <span className="team-name">{teamBName}</span>
                <span className="team-score">{teamBScore}</span>
            </div>
        </div>
    );
};

export default GameCard;
