import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Register() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            alert("הסיסמאות אינן תואמות!");
            return;
        }

        try {
            const response = await fetch('http://localhost:8989/api/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            });
            const success = await response.json();
            if (response.ok&& success) {
                alert("נרשמת בהצלחה");
                navigate('/')
            } else if (!success){
                alert("❌ שם המשתמש כבר קיים במערכת. בחרי שם אחר.")
            }
             else {
                alert("השרת מחובר אבל החזיר שגיאה.");
            }
        } catch (error) {
            alert("❌ אין תקשורת עם השרת (בדקי שה-Java רץ)");
        }
    };



    return (
        <div style={{ direction: 'rtl', textAlign: 'center', marginTop: '50px' }}>
            <h2>הרשמה למערכת</h2>
            <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', width: '300px', margin: 'auto', gap: '10px' }}>
                <input type="text" placeholder="שם משתמש" onChange={(e) => setUsername(e.target.value)} required />
                <input type="password" placeholder="סיסמה" onChange={(e) => setPassword(e.target.value)} required />
                <input type="password" placeholder="אימות סיסמה" onChange={(e) => setConfirmPassword(e.target.value)} required />
                <button type="submit">הירשם</button>
            </form>
            <p>כבר רשום? <button onClick={() => navigate('/')}>התחבר כאן</button></p>
        </div>
    );
}

export default Register;