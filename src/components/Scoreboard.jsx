import React from 'react';
import '../styles/Scoreboard.css';

const Scoreboard = ({ teamAName, teamAScore, teamBName, teamBScore }) => {
    return (
        <div className="scoreboard-container">
              <div className="scoreboard">
                    <div className="team teamA">
                        <span className="scoreboard-team-name">{teamAName}</span>
                        <span className="scoreboard-team-score">{teamAScore}</span>
                    </div>
                    <div className="score-divider">VS</div>
                    <div className="team teamB">
                        <span className="scoreboard-team-name">{teamBName}</span>
                        <span className="scoreboard-team-score">{teamBScore}</span>
                    </div>
              </div>
        </div>
    );
};

export default Scoreboard;
