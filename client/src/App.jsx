import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './Login';
import Register from './Register';
import Dashboard from "./Dashboard.jsx";
import GamePage from "./GamePage.jsx";
import MyProfile from "./MyProfile.jsx";


function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Login />} />

                <Route path="/register" element={<Register />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/next-page" element={<GamePage />} />
                <Route path="/my-profile" element={<MyProfile />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;