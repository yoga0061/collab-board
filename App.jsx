import React, { useState, useEffect } from "react";
import { auth, provider, db } from "./firebase";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  sendPasswordResetEmail
} from "firebase/auth";
import {
  doc, setDoc, getDoc, collection, query, orderBy,
  onSnapshot, updateDoc, arrayUnion, deleteDoc,
  serverTimestamp, where, writeBatch, getDocs
} from "firebase/firestore";
import { FaSearch, FaBars, FaUpload, FaUserCircle, FaTimes, FaEye, FaEyeSlash, FaGoogle, FaTrash } from "react-icons/fa";
import { BrowserRouter as Router, Routes, Route, useNavigate } from "react-router-dom";
import UploadPost from "./components/UploadPost";
import Post from "./components/Post";
import { motion, AnimatePresence } from "framer-motion";
import './index.css';
import Footer from "./Footer";

// Gradient background component
const GradientBackground = ({ children }) => (
  <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-800">
    {children}
  </div>
);

// Glassmorphism card component
const GlassCard = ({ children, className = "" }) => (
  <div className={`backdrop-blur-lg bg-white/10 rounded-2xl shadow-xl border border-white/20 ${className}`}>
    {children}
  </div>
);

// Animated button component
const AnimatedButton = ({ children, onClick, className = "", whileHover = {}, whileTap = {} }) => (
  <motion.button
    onClick={onClick}
    className={`rounded-full font-medium ${className}`}
    whileHover={{ scale: 1.05, ...whileHover }}
    whileTap={{ scale: 0.95, ...whileTap }}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3 }}
  >
    {children}
  </motion.button>
);

// Profile Detail Item Component
const ProfileDetailItem = ({ label, value }) => (
  <div>
    <p className="text-sm text-gray-600">{label}</p>
    <p className="text-gray-800 font-medium">{value || "Not specified"}</p>
  </div>
);

// Profile Details Component with Enhanced UI
const ProfileDetails = ({ userProfile, handleLogout, handleEditProfile, onClose }) => (
  <motion.div
    className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
  >
    <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-lg p-6">
      <div className="relative h-40 bg-gradient-to-r from-purple-600 to-blue-500 rounded-t-2xl flex items-center justify-center">
        <div className="h-24 w-24 rounded-full border-4 border-white bg-gray-200 overflow-hidden">
          <FaUserCircle className="h-full w-full text-gray-400" />
        </div>
        <FaTimes
          className="absolute top-4 right-4 text-white text-xl cursor-pointer hover:text-gray-200"
          onClick={onClose}
        />
      </div>

      <div className="pt-8">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">{userProfile.name}</h2>
            <p className="text-gray-600">{userProfile.email}</p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={handleEditProfile}
              className="bg-gray-200 text-gray-800 border border-gray-300 px-4 py-1 rounded-full hover:bg-gray-300"
            >
              Edit
            </button>
            <button
              onClick={handleLogout}
              className="bg-red-500 text-white px-4 py-1 rounded-full hover:bg-red-600"
            >
              Logout
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-100 rounded-2xl p-4 shadow-md">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Academic Info</h3>
            <div className="space-y-2">
              <ProfileDetailItem label="College" value={userProfile.collegeName} />
              <ProfileDetailItem label="Branch" value={userProfile.branch} />
              <ProfileDetailItem label="Year" value={userProfile.year} />
            </div>
          </div>

          <div className="bg-gray-100 rounded-2xl p-4 shadow-md">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Skills & Links</h3>
            <div className="space-y-2">
              <ProfileDetailItem label="Skills" value={userProfile.skills} />
              <ProfileDetailItem label="Social Links" value={userProfile.social} />
            </div>
          </div>
        </div>
      </div>
    </div>
  </motion.div>
);

const LoginForm = ({
  email,
  setEmail,
  password,
  setPassword,
  showPassword,
  setShowPassword,
  handleSubmit,
  handleGoogleSignin,
  handleForgotPassword,
  isSignup,
  setIsSignup,
  loading,
  onClose
}) => (
  <GlassCard className="max-w-md mx-auto p-8 space-y-6">
    <motion.h1
      className="text-3xl font-bold text-center text-white"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
    >
      {isSignup ? "Join CollabBoard" : "Welcome Back"}
    </motion.h1>

    <motion.p
      className="text-center text-black/70"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.2 }}
    >
      {isSignup ? "Create your account to start collaborating" : "Sign in to continue"}
    </motion.p>

    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="email" className="block text-black/70">Email</label>
        <input
          type="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-black placeholder-black/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          required
        />
      </div>
      <div className="relative">
        <label htmlFor="password" className="block text-black/70">Password</label>
        <input
          type={showPassword ? "text" : "password"}
          id="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-black placeholder-black/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          required
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-black/70 hover:text-white transition-colors"
        >
          {showPassword ? <FaEyeSlash /> : <FaEye />}
        </button>
      </div>
      <AnimatedButton
        type="submit"
        className="w-full bg-gradient-to-r from-purple-600 to-blue-500 text-white py-2"
        whileHover={{ boxShadow: "0 0 15px rgba(124, 58, 237, 0.5)" }}
        disabled={loading}
      >
        {loading ? "Loading..." : isSignup ? "Sign Up" : "Login"}
      </AnimatedButton>
      <AnimatedButton
        onClick={handleGoogleSignin}
        className="w-full bg-white text-gray-800 py-2 flex items-center justify-center"
        whileHover={{ boxShadow: "0 0 15px rgba(0, 0, 0, 0.1)" }}
      >
        <FaGoogle className="mr-2" />
        Sign in with Google
      </AnimatedButton>
      <button
        type="button"
        onClick={() => setIsSignup(!isSignup)}
        className="text-black/70 underline"
      >
        {isSignup ? "Already have an account? Login" : "Don't have an account? Sign Up"}
      </button>
      <button
        type="button"
        onClick={handleForgotPassword}
        className="text-black/70 underline block"
      >
        Forgot Password?
      </button>
    </form>
  </GlassCard>
);

const ProfileForm = ({
  name,
  setName,
  branch,
  setBranch,
  collegeName,
  setCollegeName,
  year,
  setYear,
  skills,
  setSkills,
  social,
  setSocial,
  handleProfileSubmit,
  handleCancel,
  loading,
  isEditing
}) => (
  <div className="relative w-full max-w-4xl h-[90vh] overflow-y-auto bg-gray-800 rounded-xl p-6">
    <FaTimes
      className="absolute top-4 right-4 text-white text-xl cursor-pointer z-50"
      onClick={handleCancel}
    />
    <GlassCard className="max-w-md mx-auto p-8 space-y-6">
      <h1 className="text-3xl font-bold text-center text-white">
        {isEditing ? "Edit Your Profile" : "Complete Your Profile"}
      </h1>
      <form onSubmit={handleProfileSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-white/70">Name</label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            required
          />
        </div>
        <div>
          <label htmlFor="branch" className="block text-white/70">Branch</label>
          <input
            type="text"
            id="branch"
            value={branch}
            onChange={(e) => setBranch(e.target.value)}
            className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            required
          />
        </div>
        <div>
          <label htmlFor="collegeName" className="block text-white/70">College Name</label>
          <input
            type="text"
            id="collegeName"
            value={collegeName}
            onChange={(e) => setCollegeName(e.target.value)}
            className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            required
          />
        </div>
        <div>
          <label htmlFor="year" className="block text-white/70">Year</label>
          <input
            type="text"
            id="year"
            value={year}
            onChange={(e) => setYear(e.target.value)}
            className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            required
          />
        </div>
        <div>
          <label htmlFor="skills" className="block text-white/70">Skills</label>
          <input
            type="text"
            id="skills"
            value={skills}
            onChange={(e) => setSkills(e.target.value)}
            className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            required
          />
        </div>
        <div>
          <label htmlFor="social" className="block text-white/70">Social Media Link (eg:Instagram,LinkedIn,FaceBook)</label>
          <input
            type="text"
            id="social"
            value={social}
            onChange={(e) => setSocial(e.target.value)}
            className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            required
          />
        </div>
        <AnimatedButton
          type="submit"
          className="w-full bg-gradient-to-r from-purple-600 to-blue-500 text-white py-2"
          whileHover={{ boxShadow: "0 0 15px rgba(124, 58, 237, 0.5)" }}
          disabled={loading}
        >
          {loading ? "Saving..." : "Save Profile"}
        </AnimatedButton>
        <button
          type="button"
          onClick={handleCancel}
          className="text-white/70 underline block text-center mt-4"
        >
          Cancel
        </button>
      </form>
    </GlassCard>
  </div>
);

function App() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [user, setUser] = useState(null);
  const [isSignup, setIsSignup] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showProfileDetails, setShowProfileDetails] = useState(false);
  const [name, setName] = useState("");
  const [branch, setBranch] = useState("");
  const [collegeName, setCollegeName] = useState("");
  const [year, setYear] = useState("");
  const [skills, setSkills] = useState("");
  const [social, setSocial] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [showProfileEdit, setShowProfileEdit] = useState(false);
  const [posts, setPosts] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showCollaborations, setShowCollaborations] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribeAuth = auth.onAuthStateChanged(async (user) => {
      if (user) {
        setUser(user);
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          setUserProfile(userDoc.data());
          setShowCollaborations(true);
        } else {
          setName("");
          setBranch("");
          setCollegeName("");
          setYear("");
          setSkills("");
          setSocial("");
          setShowProfileEdit(true);
        }
      } else {
        setUser(null);
        setUserProfile(null);
        setShowCollaborations(false);
      }
    });

    const q = query(collection(db, "posts"), orderBy("createdAt", "desc"));
    const unsubscribePosts = onSnapshot(q, (querySnapshot) => {
      const postsData = [];
      querySnapshot.forEach((doc) => {
        postsData.push({ ...doc.data(), id: doc.id });
      });
      setPosts(postsData);
    });

    return () => {
      unsubscribeAuth();
      unsubscribePosts();
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      let userCredential;
      if (isSignup) {
        userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await setDoc(doc(db, "users", userCredential.user.uid), {
          email: userCredential.user.email,
          createdAt: new Date(),
        });
        setUser(userCredential.user);
        setShowProfileEdit(true);
      } else {
        userCredential = await signInWithEmailAndPassword(auth, email, password);
        setUser(userCredential.user);
      }
      setShowCollaborations(true);
      setShowModal(false);
      navigate("/");
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignin = async () => {
    setLoading(true);
    try {
      const userCredential = await signInWithPopup(auth, provider);
      setUser(userCredential.user);

      const userDoc = await getDoc(doc(db, "users", userCredential.user.uid));
      if (!userDoc.exists()) {
        setShowProfileEdit(true);
      }

      setShowCollaborations(true);
      setShowModal(false);
      navigate("/");
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      alert("Please enter your email first");
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email);
      alert("Password reset email sent!");
    } catch (error) {
      alert(error.message);
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await setDoc(doc(db, "users", user.uid), {
        name,
        branch,
        collegeName,
        year,
        skills,
        social,
        email: user.email,
      }, { merge: true });

      setUserProfile({
        name,
        branch,
        collegeName,
        year,
        skills,
        social,
        email: user.email
      });

      setShowProfileEdit(false);
      setIsEditing(false);
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      setUserProfile(null);
      setShowProfileDetails(false);
      setShowCollaborations(false);
      navigate("/");
    } catch (error) {
      alert(error.message);
    }
  };

  const handleEditProfile = () => {
    if (userProfile) {
      setName(userProfile.name || "");
      setBranch(userProfile.branch || "");
      setCollegeName(userProfile.collegeName || "");
      setYear(userProfile.year || "");
      setSkills(userProfile.skills || "");
      setSocial(userProfile.social || "");
    }
    setIsEditing(true);
    setShowProfileEdit(true);
    setShowProfileDetails(false);
  };

  const handleCancel = () => {
    setShowProfileEdit(false);
    setIsEditing(false);
    setShowProfileDetails(false);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setIsSignup(false);
  };

  const handleCloseUpload = () => {
    setShowUpload(false);
    navigate("/");
  };

  const handleCloseProfileEdit = () => {
    setShowProfileEdit(false);
    navigate("/");
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  const filteredPosts = posts.filter((post) =>
    post.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleInterestClick = async (postId) => {
    if (!user || !userProfile) return;

    try {
      const postRef = doc(db, "posts", postId);
      await updateDoc(postRef, {
        interestedUsers: arrayUnion({
          userId: user.uid,
          name: userProfile.name,
          skills: userProfile.skills,
          social: userProfile.social,
          email: user.email
        })
      });

      const postDoc = await getDoc(postRef);
      if (postDoc.exists()) {
        const postOwnerId = postDoc.data().userId;
        if (postOwnerId !== user.uid) {
          const notificationRef = doc(db, "notifications", postOwnerId);
          await updateDoc(notificationRef, {
            notifications: arrayUnion({
              type: "interest",
              postId,
              fromUserId: user.uid,
              fromUserName: userProfile.name,
              message: `${userProfile.name} is interested in your post "${postDoc.data().title}"`,
              read: false,
              timestamp: new Date()
            }),
            hasUnread: true
          });
        }
      }

      alert("Your interest has been recorded! The post owner will be notified.");
    } catch (error) {
      console.error("Error expressing interest:", error);
      alert("Failed to express interest. Please try again.");
    }
  };

  const handleDeletePost = async (postId) => {
    if (!user) return;

    try {
      const postRef = doc(db, "posts", postId);
      const postDoc = await getDoc(postRef);
      if (postDoc.exists() && postDoc.data().userId === user.uid) {
        await deleteDoc(postRef);
        alert("Post deleted successfully!");
      } else {
        alert("You do not have permission to delete this post.");
      }
    } catch (error) {
      console.error("Error deleting post:", error);
      alert("Failed to delete post. Please try again.");
    }
  };

  const handleLoginClick = () => {
    setShowModal(true);
    setIsSignup(false);
  };

  useEffect(() => {
    const deleteOldPosts = async () => {
      const tenDaysAgo = new Date();
      tenDaysAgo.setDate(tenDaysAgo.getDate() - 10);

      const postsQuery = query(collection(db, "posts"), orderBy("createdAt"), where("createdAt", "<", tenDaysAgo));
      const postsSnapshot = await getDocs(postsQuery);

      const batch = writeBatch(db);
      postsSnapshot.forEach((doc) => {
        batch.delete(doc.ref);
      });

      await batch.commit();
    };

    deleteOldPosts();
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <header className="flex items-center justify-between p-4">
        <div className="flex items-center space-x-4">
          <FaBars className="text-white text-2xl cursor-pointer" onClick={() => setShowModal(true)} />
          <h1 className="text-2xl font-bold text-white">CollabBoard®</h1>
        </div>
        <div className="relative">
          <input
            type="text"
            placeholder="Search posts..."
            value={searchQuery}
            onChange={handleSearch}
            className={`px-4 py-2 bg-white/10 border border-white/20 rounded-lg placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent ${searchQuery ? 'text-black' : 'text-white'}`}
          />
          <FaSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white" />
        </div>
        {user ? (
          <div className="relative">
            <FaUserCircle
              className="text-white text-2xl cursor-pointer"
              onClick={() => setShowProfileDetails(true)}
            />
            <AnimatePresence>
              {showProfileDetails && (
                <ProfileDetails
                  userProfile={userProfile}
                  handleLogout={handleLogout}
                  handleEditProfile={handleEditProfile}
                  onClose={() => setShowProfileDetails(false)}
                />
              )}
            </AnimatePresence>
          </div>
        ) : (
          <AnimatedButton
            onClick={handleLoginClick}
            className="bg-gradient-to-r from-purple-600 to-blue-500 text-white py-2 px-4"
            whileHover={{ boxShadow: "0 0 15px rgba(124, 58, 237, 0.5)" }}
          >
            Login
          </AnimatedButton>
        )}
      </header>

      <main className="flex-1 p-4">
        <AnimatePresence>
          {(showModal || showProfileEdit) && (
            <motion.div
              className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {showModal && (
                <GlassCard className="max-w-md w-full p-8 relative">
                  <FaTimes
                    className="absolute top-4 right-4 text-white text-xl cursor-pointer"
                    onClick={handleCloseModal}
                  />
                  <LoginForm
                    email={email}
                    setEmail={setEmail}
                    password={password}
                    setPassword={setPassword}
                    showPassword={showPassword}
                    setShowPassword={setShowPassword}
                    handleSubmit={handleSubmit}
                    handleGoogleSignin={handleGoogleSignin}
                    handleForgotPassword={handleForgotPassword}
                    isSignup={isSignup}
                    setIsSignup={setIsSignup}
                    loading={loading}
                    onClose={handleCloseModal}
                  />
                </GlassCard>
              )}

              {showProfileEdit && (
                <ProfileForm
                  name={name}
                  setName={setName}
                  branch={branch}
                  setBranch={setBranch}
                  collegeName={collegeName}
                  setCollegeName={setCollegeName}
                  year={year}
                  setYear={setYear}
                  skills={skills}
                  setSkills={setSkills}
                  social={social}
                  setSocial={setSocial}
                  handleProfileSubmit={handleProfileSubmit}
                  handleCancel={handleCancel}
                  loading={loading}
                  isEditing={isEditing}
                />
              )}
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showUpload && (
            <motion.div
              className="fixed inset-0 bg-black/70 z-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="h-full w-full flex items-center justify-center p-4">
                <div className="relative w-full max-w-4xl h-[90vh] overflow-y-auto bg-gray-800 rounded-xl p-6">
                  <FaTimes
                    className="absolute top-4 right-4 text-white text-xl cursor-pointer z-50"
                    onClick={handleCloseUpload}
                  />
                  <UploadPost
                    setShowUpload={setShowUpload}
                    onClose={handleCloseUpload}
                    user={user}
                    userProfile={userProfile}
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className={`${(showModal || showUpload || showProfileEdit) ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
          {/* Motivational section that appears for ALL users */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-8"
          >
            <motion.h3
              className="text-4xl font-bold text-purple-200 mb-2"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              {user ? `Welcome back, ${userProfile?.name || 'collaborator'}!` : '🚨 Alert 💀'}
            </motion.h3>
            <motion.p
              className="text-lg text-white/80"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              {user ? '💥 You’re not here to play small. Let’s build greatness.' : '🔗 Meet collaborators. 💡 Spark ideas. 🏗️ Build your legacy.'}
              
            </motion.p>
            {!user && (
              <motion.p
                className="text-sm text-white/80 mt-2"
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                💥 You’re not here to play small. Let’s build greatness
              </motion.p>
            )}
          </motion.div>

          <Routes>
            <Route
              path="/"
              element={
                <>
                  {user ? (
                    <>
                      <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold text-white">
                          {searchQuery ? 'Search Results' : 'Available Collaborations'}
                        </h2>
                        <AnimatedButton
                          onClick={() => {
                            setShowUpload(true);
                            navigate("/upload");
                          }}
                          className="bg-gradient-to-r from-purple-600 to-blue-500 text-white py-2 px-4"
                          whileHover={{ boxShadow: "0 0 15px rgba(124, 58, 237, 0.5)" }}
                        >
                          <FaUpload className="mr-2" />
                          Create Collaboration Post
                        </AnimatedButton>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredPosts.map((post) => (
                          <div key={post.id} className="relative">
                            <Post
                              post={post}
                              user={user}
                              onInterestClick={handleInterestClick}
                            />
                            {user && user.uid === post.userId && (
                              <div className="absolute top-2 right-2">
                                <button
                                  onClick={() => handleDeletePost(post.id)}
                                  className="text-red-500 hover:text-red-700"
                                  title="Delete post"
                                >
                                  <FaTrash />
                                </button>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>

                      {filteredPosts.length === 0 && (
                        <div className="text-center py-10">
                          <p className="text-white/70 text-lg">
                            {searchQuery
                              ? 'No matching posts found'
                              : 'No collaboration posts available yet. Be the first to create one!'}
                          </p>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center text-center">
                      <AnimatedButton
                        onClick={handleLoginClick}
                        className="bg-gradient-to-r from-purple-600 to-blue-500 text-white py-3 px-6 text-lg mt-6"
                        whileHover={{ boxShadow: "0 0 15px rgba(124, 58, 237, 0.5)" }}
                      >
                        Get Started - Join Now
                      </AnimatedButton>
                    </div>
                  )}
                </>
              }
            />
            <Route path="/upload" element={
              <UploadPost
                setShowUpload={setShowUpload}
                onClose={handleCloseUpload}
                user={user}
                userProfile={userProfile}
              />
            } />
          </Routes>
        </div>
      </main>

      <Footer />
    </div>
  );
}

function AppWrapper() {
  return (
    <Router>
      <GradientBackground>
        <App />
      </GradientBackground>
    </Router>
  );
}

export default AppWrapper;
