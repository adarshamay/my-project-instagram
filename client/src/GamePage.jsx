import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

// 1. קומפוננטה פנימית עבור כפתור עקיבה
function FollowButton({ targetUsername, currentUsername }) {
    const [isFollowing, setIsFollowing] = useState(false);

    const handleAction = async () => {
        const endpoint = isFollowing ? 'unfollow' : 'follow';
        const url = `http://localhost:8989/api/${endpoint}?follower=${currentUsername}&followed=${targetUsername}`;
        try {
            const response = await fetch(url, { method: 'POST' });
            if (response.ok) {
                setIsFollowing(!isFollowing);
            }
        } catch (err) {
            console.error("Action failed", err);
        }
    };

    return (
        <button onClick={handleAction} style={followButtonStyle(isFollowing)}>
            {isFollowing ? '✓ עוקב' : 'עקוב +'}
        </button>
    );
}

// 2. הקומפוננטה המרכזית
function GamePage() {
    const [user, setUser] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [following, setFollowing] = useState([]);
    const [postContent, setPostContent] = useState('');
    const [posts, setPosts] = useState([]);
    const DEFAULT_IMAGE = "https://cdn-icons-png.flaticon.com/512/149/149071.png";
    const navigate = useNavigate();

    useEffect(() => {
        const savedName = localStorage.getItem("username");
        if (!savedName) { navigate('/'); return; }

        fetch(`http://localhost:8989/api/get-user-details?username=${savedName}`)
            .then(res => res.json())
            .then(data => {
                setUser(data);
                fetchPosts(data.username);
                fetchSocialData(data.username);
            })
            .catch(err => console.error("Error fetching user details:", err));
    }, [navigate]);

    const fetchFollowingList = async () => {
        if (!user?.username) return;
        try {
            const res = await fetch(`http://localhost:8989/api/get-following?username=${user.username}`);
            const data = await res.json();
            setFollowing(data);
        } catch (err) {
            console.error("Error fetching following list", err);
        }
    };

    useEffect(() => {
        fetchFollowingList();
    }, [user?.username]);


    const fetchPosts = async (username) => {
        try {
            const response = await fetch(`http://localhost:8989/api/get-following-feed?username=${username}`);
            if (response.ok) setPosts(await response.json());
        } catch (error) { console.error("Error fetching feed:", error); }
    };

    const fetchSocialData = async (username) => {
        if (!username) {
            console.error("Oops! username is missing");
            return;
        }
        console.log("Fetching following for:", username);
        try {
            const res = await fetch(`http://localhost:8989/api/get-following?username=${username}`);
            if (res.ok) setFollowing(await res.json());
        } catch (err) { console.error("Failed to fetch following list", err); }
    };



    const handleSearch = async (val) => {
        setSearchQuery(val);
        const cleanQuery = val.trim();

        if (cleanQuery.length > 0) {
            try {
                const response = await fetch(`http://localhost:8989/api/search-users?query=${encodeURIComponent(cleanQuery)}`);

                if (response.ok) {
                    const data = await response.json();
                    setSearchResults(Array.isArray(data) ? data : []);
                } else {
                    setSearchResults([]);
                }
            } catch (error) {
                console.error("Search error:", error);
                setSearchResults([]);
            }
        } else {
            setSearchResults([]);
        }
    };

    const handlePostSubmit = async () => {
        if (postContent.trim().length === 0 || postContent.length > 500) return;
        const response = await fetch('http://localhost:8989/api/add-post', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: user.username, content: postContent })
        });
        if (response.ok) {
            setPostContent('');
            fetchPosts(user.username);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("username");
        navigate("/");
    };

    if (!user) return <div style={{ textAlign: 'center', marginTop: '50px' }}>טוען נתונים...</div>;

    return (
        <div style={{ direction: 'rtl', padding: '20px', fontFamily: 'Arial, sans-serif' }}>

            <header style={headerStyle}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                    <img
                        src={user?.profilePicUrl || DEFAULT_IMAGE}
                        onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = DEFAULT_IMAGE;
                        }}
                        style={{
                            width: '50px',
                            height: '50px',
                            borderRadius: '50%',
                            objectFit: 'cover',
                            border: '2px solid #fff',
                            boxShadow: '0 2px 6px rgba(0,0,0,0.1)'
                        }}
                        alt="Profile"
                    />
                    <h2 style={{ margin: 0, fontSize: '1.4rem' }}>שלום, {user.username} 👋</h2>
                </div>

                <div style={{ ...sidebarStyle, margin: '0 20px', flex: 1, maxWidth: '400px' }}>
                    <input
                        type="text"
                        placeholder="🔍 חפש/י חברים..."
                        value={searchQuery}
                        onChange={(e) => handleSearch(e.target.value)}
                        style={searchInputStyle}
                    />

                    <div style={{ position: 'absolute', backgroundColor: '#fff', width: '100%', zIndex: 10, boxShadow: '0 4px 12px rgba(0,0,0,0.1)', borderRadius: '8px' }}>
                        {searchResults.filter(u => u.username !== user?.username).map((u) => {
                            const isAlreadyFollowing = following?.some(f => f.followedUsername === u.username);

                            return (
                                <div key={u.id} style={searchResultItemStyle}>
                                    <span>{u.username}</span>
                                    {isAlreadyFollowing ? (
                                        <span style={{ color: '#28a745', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                ✓ עוקב
                            </span>
                                    ) : (
                                        <FollowButton
                                            targetUsername={u.username}
                                            currentUsername={user.username}
                                            onFollowSuccess={fetchFollowingList}
                                        />
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                    <button onClick={() => navigate('/my-profile')} style={secondaryButtonStyle}>👤 הפרופיל שלי</button>
                    <button onClick={handleLogout} style={logoutButtonStyle}>🚪 התנתקות</button>
                </div>
            </header>

            <div>

                <section style={{
                    maxWidth: '700px',
                    margin: '0 auto 40px auto',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '15px',
                    direction: 'rtl'}}>
                    <h3 style={{ fontWeight: 'normal', margin: '0 10px', color: '#333' }}>מה דעתך על?</h3>

                    <div style={postBoxStyle}>
                        <textarea
                            value={postContent}
                            onChange={(e) => setPostContent(e.target.value)}
                            placeholder="אפשר לכתוב פה משהו מעניין..."
                            style={textareaStyle}/>

                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginTop: '15px',
                            paddingTop: '10px',
                            borderTop: '1px solid #f0f0f0'
                        }}>
                            <small style={{
                                color: postContent.length > 500 ? 'red' : '#999',
                                fontSize: '0.85rem'
                            }}>
                                {postContent.length}/500
                            </small>
                            <button onClick={handlePostSubmit} style={postButtonStyle}>
                               פרסום פוסט
                            </button>
                        </div>
                    </div>
                </section>
            </div>
            <hr style={{ opacity: 0.3 }} />

            <div style={{ display: 'flex', gap: '40px', marginTop: '30px' }}>

                <div >
                    <div style={{ flex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>

                        <h3 style={{ alignSelf: 'start', marginRight: 'calc(50% - 350px)' }}>עדכונים אחרונים</h3>

                        <div style={feedContainerStyle}>
                            {posts.length === 0 ? (
                                <div style={emptyStateStyle}>
                                    <p>עדיין אין פוסטים להצגה.</p>
                                    <p>נסי לעקוב אחרי משתמשים כדי לראות מה הם כותבים!</p>
                                </div>
                            ) : (
                                posts.map((post) => (
                                    <div key={post.id} style={postCardStyle}>
                                        <p style={{ fontSize: '1.1rem', lineHeight: '1.6', margin: '0 0 15px 0' }}>
                                            {post.content}
                                        </p>

                                        <div style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            borderTop: '1px solid #f9f9f9',
                                            paddingTop: '10px'
                                        }}>
                                            <small style={{ color: '#777' }}>פורסם ע"י {post.username}</small>

                                            <LikeSection
                                                postId={post.id}
                                                currentUsername={user?.username}
                                            />
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
const LikeSection = ({ postId, currentUsername }) => {
    const [likes, setLikes] = useState(0);
    const [isLiked, setIsLiked] = useState(false);
    const [likesCount, setLikesCount] = useState(0);


    useEffect(() => {
        const fetchLikesData = async () => {
            try {
                const countRes = await fetch(`http://localhost:8989/api/get-likes?postId=${postId}`);
                const count = await countRes.json();
                setLikesCount(count);

                if (currentUsername) {
                    const likedRes = await fetch(
                        `http://localhost:8989/api/has-liked?postId=${postId}&username=${currentUsername}`
                    );
                    const likedStatus = await likedRes.json();
                    setIsLiked(likedStatus);
                }
            } catch (err) {
                console.error("Error fetching likes data", err);
            }
        };

        fetchLikesData();
    }, [postId, currentUsername]);

    useEffect(() => {
        fetch(`http://localhost:8989/api/get-likes?postId=${postId}`)
            .then(res => res.json())
            .then(data => setLikes(data));

    }, [postId]);

    const handleLike = async () => {
        const res = await fetch(`http://localhost:8989/api/toggle-like?postId=${postId}&username=${currentUsername}`, {
            method: 'POST'
        });

        if (res.ok) {
            if (isLiked) {
                setLikes(prev => prev - 1);
                setIsLiked(false);
            } else {
                setLikes(prev => prev + 1);
                setIsLiked(true);
            }
        }
    };

    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginTop: '10px' }}>
            <button
                onClick={handleLike}
                style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '1.2rem',
                    color: isLiked ? 'red' : 'gray'
                }}
            >
                {isLiked ? '❤️' : '🤍'}
            </button>
            <span style={{ fontWeight: 'normal', fontSize: '0.9rem' }}>
                {likes} לייקים
            </span>
        </div>
    );
};
const postsContainerStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '20px',
    padding: '20px',
    direction: 'rtl'
};
const sectionStyle = {
    width: '90%',
    maxWidth: '800px',
    margin: '20px auto',
    direction: 'rtl'
};

const textareaStyle = {
    width: '100%',
    minHeight: '150px',
    padding: '20px',
    fontSize: '1.2rem',
    lineHeight: '1.5',
    borderRadius: '12px',
    border: '1px solid #e1e8ed',
    backgroundColor: '#f5f8fa',
    outline: 'none',
    resize: 'none',
    boxSizing: 'border-box'
};

const feedContainerStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '20px',
    width: '100%',
    padding: '20px',
    boxSizing: 'border-box'
};

const postCardStyle = {
    width: '100%',
    maxWidth: '700px',
    backgroundColor: '#fff',
    borderRadius: '12px',
    padding: '20px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
    border: '1px solid #eee',
    fontWeight: 'normal',
    direction: 'rtl'
};
const sidebarStyle = {
    width: '100%',
    maxWidth: '280px',
    padding: '20px',
    backgroundColor: '#fff',
    borderRadius: '15px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
    height: 'fit-content',
    position: 'sticky',
    top: '20px'
};

const searchInputStyle = {
    width: '100%',
    padding: '12px 15px',
    borderRadius: '25px',
    border: '1px solid #ddd',
    fontSize: '0.95rem',
    outline: 'none',
    boxSizing: 'border-box',
    marginBottom: '15px',
    backgroundColor: '#f9f9f9'
};
const headerStyle = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', borderBottom: '2px solid #f0f0f0', paddingBottom: '10px' };
const postBoxStyle = { backgroundColor: '#fff', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', border: '1px solid #eee' };
const postButtonStyle = { backgroundColor: '#007bff', color: 'white', border: 'none', padding: '8px 24px', borderRadius: '20px', cursor: 'pointer', fontWeight: 'bold' };
const searchResultItemStyle = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #f5f5f5' };
const emptyStateStyle = { textAlign: 'center', color: '#888', marginTop: '30px', padding: '20px', backgroundColor: '#f9f9f9', borderRadius: '10px' };
const logoutButtonStyle = { backgroundColor: '#dc3545', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer' };
const secondaryButtonStyle = { backgroundColor: '#6c757d', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer' };
const followButtonStyle = (isFollowing) => ({
    padding: '5px 15px', borderRadius: '20px', cursor: 'pointer',
    backgroundColor: isFollowing ? '#f0f0f0' : '#007bff',
    color: isFollowing ? '#333' : 'white',
    border: isFollowing ? '1px solid #ccc' : 'none'
});

export default GamePage;