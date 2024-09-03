import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/Header.css'; 

const Header = () => (
    <header className="header">
        <nav className="navbar">
            <Link to="/" className="nav-logo">Ultimate Frisbee Statistics Tracker</Link>
        </nav>
    </header>
);

export default Header;
