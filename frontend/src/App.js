import React, { useState } from 'react';
import VenueList from './components/VenueList';
import UserProfile from './components/UserProfile';

function App() {
    const [isUserLoggedIn, setIsUserLoggedIn] = useState(!!localStorage.getItem('token'));
    const [view, setView] = useState('venues');




    return (
        <div className="App">

            <div style={{ textAlign: 'right', padding: '1rem' }}>
                <button onClick={() => setView('venues')}>Майданчики</button>
                <button onClick={() => setView('profile')}>Профіль</button>
            </div>

            {view === 'venues' && (
                <VenueList

                    setView={setView}
                />
            )}

            {view === 'profile' && isUserLoggedIn && <UserProfile />}

        </div>
    );
}

export default App;
