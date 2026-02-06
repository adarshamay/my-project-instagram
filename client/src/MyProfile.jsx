import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

function MyProfile(){
   const [user,setUser]= useState(null);
   const [followers,setFollowers]=useState([]);
   const [following,setFollowing]=useState([]);
    const [imgInput, setImgInput] = useState('');
    const [isUpdated, setIsUpdated] = useState(false);
   const navigate = useNavigate();
    const DEFAULT_IMAGE = "https://cdn-icons-png.flaticon.com/512/149/149071.png";
    const [postCount, setPostCount] = useState(0);
    const [myPosts, setMyPosts] = useState([]);
    useEffect(() => {
        if (user?.username) {
            fetchPostCount();
        }
    }, [user]);

    useEffect(()=>{
        const savedName=localStorage.getItem("username");
        if (!savedName){
            navigate('/');
            return;
        }
        fetch(`http://localhost:8989/api/get-user-details?username=${savedName}`)
            .then(res=>res.json())
            .then(data=>{
                setUser(data);
                fetchSocialData(savedName)
            });
    },[]);

    useEffect(() => {
        fetchMyPosts();
    }, [user]);

    const updateImage = async () => {
        if (!user || !imgInput) return;

        try {
            const response = await fetch('http://localhost:8989/api/update-profile-pic', {
                method: 'POST', // חייב להתאים ל-PostMapping ב-Java
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
    const fetchMyPosts = async () => {
        if (!user || !user.username) return;

        try {
            const response = await fetch(`http://localhost:8989/api/get-user-posts?username=${user.username}`);
            if (response.ok) {
                const data = await response.json();
                setMyPosts(data);
            }
        } catch (err) {
            console.error("Failed to fetch posts:", err);
        }
    };

    const handleDeletePost = async (postId) => {
        if (!window.confirm("בטוח שברצונך למחוק את הפוסט?")) return;

        try {
            const response = await fetch(`http://localhost:8989/api/delete-post?postId=${postId}&username=${user.username}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                setMyPosts(myPosts.filter(p => p.id !== postId));
            }
        } catch (err) {
            alert("חלה שגיאה במחיקת הפוסט");
        }
    };

    const fetchPostCount = async () => {
        try {
            const response = await fetch(`http://localhost:8989/api/get-post-count?username=${user.username}`);
            if (response.ok) {
                const count = await response.json();
                setPostCount(count);
            }
        } catch (error) {
            console.error("Error fetching post count:", error);
        }
    };


    const fetchSocialData = async (username) => {
        try {
            const followingRes = await fetch(`http://localhost:8989/api/get-following?username=${username}`);
            const followersRes = await fetch(`http://localhost:8989/api/my-followers?username=${username}`);

            if (followingRes.ok) setFollowing(await followingRes.json());
            if (followersRes.ok) setFollowers(await followersRes.json());
        } catch (err) { console.error("Error fetching social data", err); }
    };
    const handleUnFollow = async (targetName) => {
        const currentUser = localStorage.getItem("username");
        await fetch(`http://localhost:8989/api/unfollow?follower=${currentUser}&followed=${targetName}`,
            { method: 'POST' });
        fetchSocialData(currentUser);
    }

    if (!user) return <div style={{ textAlign: 'center', marginTop: '50px' }}>טוען פרופיל...</div>;

        return (
            <div style={{ direction: 'rtl', padding: '20px', fontFamily: 'Arial, sans-serif' }}>
                <header style={profileHeaderStyle}>
                    <div style={{ position: 'relative', marginBottom: '15px' }}>
                        <img
                            src={user.profilePicUrl || DEFAULT_IMAGE}
                            onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = DEFAULT_IMAGE;
                            }}
                            style={profileImageStyle}
                            alt="Profile"
                        />
                    </div>

                    <div style={updateImageContainerStyle}>
                        <input
                            type="text"
                            value={imgInput}
                            onChange={(e) => setImgInput(e.target.value)}
                            placeholder="קישור לתמונה חדשה..."
                            style={imageInputStyle}
                        />
                        <button onClick={updateImage} style={updateButtonStyle}>עדכן</button>
                    </div>

                    <h1 style={usernameStyle}>{user.username}</h1>

                    <div >
        <span style={postCountStyle}>
            {postCount > 0 ? `${postCount} פוסטים הועלו` : 'עדיין לא הועלו פוסטים'}
        </span>
                    </div>

                    <button
                        onClick={() => navigate('/next-page')}
                        style={backLinkStyle}
                    >
                        ← חזרה לעמוד הראשי
                    </button>
                </header>

                <div style={{ display: 'flex', gap: '20px', justifyContent: 'center' }}>
                    <div style={columnStyle}>
                        <h3 style={{ borderBottom: '2px solid #007bff', paddingBottom: '10px' }}>אני עוקב/ת אחרי ({following.length})</h3>
                        {following.map(f => (
                            <div key={f.id} style={itemStyle}>
                                <span>{f.followedUsername}</span>
                                <button onClick={() => handleUnFollow(f.followedUsername)} style={unfollowButtonStyle}>הסר</button>
                            </div>
                        ))}
                    </div>

                    <div style={columnStyle}>
                        <h3 style={{ borderBottom: '2px solid #28a745', paddingBottom: '10px' }}>עוקבים אחריי ({followers.length})</h3>
                        {followers.map(f => (
                            <div key={f.id} style={itemStyle}>
                                <span>{f.followerUsername}</span>
                                <span style={{ fontSize: '1.2rem' }}>⭐</span>
                            </div>
                        ))}
                    </div>
                </div>
                <section style={{ marginTop: '30px' }}>
                    <h3>הפוסטים שהעליתי</h3>
                    <hr style={{ opacity: 0.2 }} />

                    {myPosts.length === 0 ? (
                        <p style={{ fontWeight: 'normal', color: '#888' }}>עדיין לא הועלו פוסטים</p>
                    ) : (
                        myPosts.map(post => (
                            <div key={post.id} style={postItemStyle}>
                                <p style={{ fontWeight: 'normal', margin: 0 }}>{post.content}</p>
                                <button
                                    onClick={() => handleDeletePost(post.id)}
                                    style={deleteButtonStyle}
                                >
                                    🗑️ הסר/י
                                </button>
                            </div>
                        ))
                    )}
                </section>
            </div>
        );
}
const profileHeaderStyle = {
    textAlign: 'center',
    marginBottom: '40px',
    backgroundColor: '#fff',
    padding: '40px 20px',
    borderRadius: '20px',
    boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
    border: '1px solid #f0f0f0',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '10px'
};

const profileImageStyle = {
    width: '110px',
    height: '110px',
    borderRadius: '50%',
    objectFit: 'cover',
    border: '4px solid #f8f9fa',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
};

const updateImageContainerStyle = {
    display: 'flex',
    gap: '5px',
    marginBottom: '20px',
    backgroundColor: '#f8f9fa',
    padding: '5px',
    borderRadius: '25px',
    border: '1px solid #eee'
};

const imageInputStyle = {
    border: 'none',
    background: 'none',
    padding: '8px 15px',
    outline: 'none',
    fontSize: '0.85rem',
    width: '180px'
};

const updateButtonStyle = {
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    padding: '8px 18px',
    borderRadius: '20px',
    cursor: 'pointer',
    fontSize: '0.85rem',
    transition: 'background 0.2s'
};

const usernameStyle = {
    margin: '10px 0 5px 0',
    fontSize: '1.8rem',
    color: '#2d3436',
    fontWeight: '600'
};

const postCountStyle = {
    fontWeight: 'normal',
    fontSize: '1rem',
    color: '#636e72',
    backgroundColor: '#f1f2f6',
    padding: '5px 15px',
    borderRadius: '15px'
};

const backLinkStyle = {
    marginTop: '20px',
    color: '#007bff',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontSize: '0.9rem',
    textDecoration: 'none',
    transition: 'opacity 0.2s'
};

const postItemStyle = {display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', borderBottom: '1px solid #eee', backgroundColor: '#fff', marginBottom: '10px', borderRadius: '8px'};
const deleteButtonStyle = {backgroundColor: 'transparent', color: '#ff4d4d', border: '1px solid #ff4d4d', padding: '4px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem'};
const columnStyle = { flex: 1, maxWidth: '400px', backgroundColor: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' };
const itemStyle = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #eee' };
const unfollowButtonStyle = { backgroundColor: '#ff4d4d', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '5px', cursor: 'pointer', fontSize: '0.8rem' };
export default MyProfile;