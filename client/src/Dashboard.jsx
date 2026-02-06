import {useEffect, useRef, useState} from 'react';
import { useNavigate } from 'react-router-dom';

function Dashboard(){
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [imgInput, setImgInput] = useState('');
    const [isUpdated, setIsUpdated] = useState(false);
    const navigate = useNavigate();
    const nextSectionRef = useRef(null);

    useEffect(()=>{
        console.log("Dashboard loaded, checking for user...");

        const savedUsername = localStorage.getItem("username");
        const fetchUserData = async () => {
            try {
                const response = await fetch(`http://localhost:8989/api/get-user-details?username=${savedUsername}`);
                if (response.ok) {
                    const data = await response.json();
                    setUser(data);

                    if (data.profilePicUrl) {
                        setIsUpdated(true);
                    }
                }
            } catch (error) { console.error(error); }
            finally { setLoading(false); }
        };
        fetchUserData()

    },[]);


    const updateImage = async () => {
        if (!user || !imgInput) return;

        try {
            const response = await fetch('http://localhost:8989/api/update-profile-pic', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username: user.username,
                    profilePicUrl: imgInput
                }),
            });

            if (response.ok) {
                setUser({ ...user, profilePicUrl: imgInput });
                setIsUpdated(true);

                setTimeout(() => {
                    nextSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
                }, 100);
            } else {
                console.error("שגיאת שרת:", response.status);
            }
        } catch (error) {
            console.error("תקלה בתקשורת:", error);
        }
        navigate('/next-page')
    };

    if (loading) return <div style={{ textAlign: 'center', marginTop: '50px' }}>טוען נתונים...</div>;
    if (!user) return <div style={{ textAlign: 'center', marginTop: '50px' }}>שגיאה: לא נמצא משתמש מחובר</div>;

    return (
        <div style={{ direction: 'rtl', textAlign: 'center', padding: '20px' }}>
            <h1>שלום, {user?.username}</h1>

            <input
                type="text"
                value={imgInput}
                onChange={(e) => setImgInput(e.target.value)}
                placeholder="הדביק/י קישור לתמונה"
            />
            <button onClick={updateImage }>עדכן תמונה</button>
            <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', marginTop: '20px' }}>


            </div>

            <div ref={nextSectionRef} style={{ marginTop: '50px', minHeight: '200px' }}>

                    <div style={{ padding: '20px', backgroundColor: '#e6fffa', border: '1px solid #38b2ac', borderRadius: '10px' }}>
                        <button
                            onClick={() => navigate('/next-page')}
                            style={{ padding: '15px 30px', fontSize: '1.2rem', backgroundColor: '#319795', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
                        >
                            עבור למסך הבא ➔
                        </button>
                    </div>

            </div>
        </div>
    );
}
export default Dashboard;