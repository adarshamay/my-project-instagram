import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const response = await fetch('http://127.0.0.1:8989/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            });

            if (response.ok) {
                const result = await response.json();

                if (result && typeof result === 'object') {
                    localStorage.setItem("username", result.username);
                    const DEFAULT_IMAGE = "https://cdn-icons-png.flaticon.com/512/149/149071.png";

                    if (!result.profilePicUrl || result.profilePicUrl === DEFAULT_IMAGE) {
                        navigate('/dashboard');
                    } else {
                        navigate('/next-page');
                    }
                } else if (result === true) {
                    localStorage.setItem("username", username);
                    navigate('/dashboard');
                } else {
                    alert("שם משתמש או סיסמה שגויים");
                }
            } else {
                alert("שגיאת שרת: " + response.status);
            }
        } catch (error) {
            console.error("Connection error:", error);
            alert("לא ניתן להתחבר לשרת. וודא שה-Java רץ");
        } finally {
            setIsLoading(false);
        }
    };

    // אובייקטי העיצוב
    const styles = {
        container: {
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '100vh',
            backgroundColor: '#f0f2f5',
            fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif',
            direction: 'rtl'
        },
        card: {
            backgroundColor: '#fff',
            padding: '40px',
            borderRadius: '12px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
            width: '100%',
            maxWidth: '400px',
            textAlign: 'center'
        },
        title: {
            color: '#1a73e8',
            marginBottom: '24px',
            fontSize: '28px',
            fontWeight: 'bold'
        },
        form: {
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
        },
        input: {
            padding: '12px 16px',
            borderRadius: '8px',
            border: '1px solid #ddd',
            fontSize: '16px',
            outline: 'none',
            transition: 'border-color 0.3s',
            textAlign: 'right'
        },
        button: {
            padding: '12px',
            borderRadius: '8px',
            border: 'none',
            backgroundColor: '#1a73e8',
            color: 'white',
            fontSize: '16px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'background-color 0.3s',
            marginTop: '10px'
        },
        linkSection: {
            marginTop: '20px',
            fontSize: '14px',
            color: '#5f6368'
        },
        linkButton: {
            background: 'none',
            border: 'none',
            color: '#1a73e8',
            cursor: 'pointer',
            fontWeight: '600',
            textDecoration: 'underline',
            marginRight: '5px'
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <h2 style={styles.title}>ברוכים הבאים</h2>
                <p style={{ marginBottom: '20px', color: '#666' }}>התחבר למערכת כדי להמשיך</p>

                <form onSubmit={handleLogin} style={styles.form}>
                    <input
                        style={styles.input}
                        type="text"
                        placeholder="שם משתמש"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                    <input
                        style={styles.input}
                        type="password"
                        placeholder="סיסמה"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    <button
                        type="submit"
                        style={{...styles.button, opacity: isLoading ? 0.7 : 1}}
                        disabled={isLoading}
                    >
                        {isLoading ? 'מתחבר...' : 'התחבר'}
                    </button>
                </form>

                <div style={styles.linkSection}>
                    עדיין לא רשום?
                    <button style={styles.linkButton} onClick={() => navigate('/register')}>
                        הירשם כאן
                    </button>
                </div>
            </div>
        </div>
    );
}

export default Login;