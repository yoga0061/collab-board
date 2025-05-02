import React, { useState } from "react";
import { db, auth } from "../firebase";
import { collection, addDoc } from "firebase/firestore";
import { FaUpload, FaCalendarAlt, FaUserFriends, FaCode, FaExternalLinkAlt, FaTimes } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";

const UploadPost = ({ setShowUpload, onClose, userProfile }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [teamSize, setTeamSize] = useState("");
  const [skillsNeeded, setSkillsNeeded] = useState("");
  const [contactInfo, setContactInfo] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const user = auth.currentUser;
    if (!user) {
      alert("You must be logged in to create a post.");
      return;
    }

    const skillsArray = skillsNeeded.split(",").map(skill => skill.trim());

    try {
      await addDoc(collection(db, "posts"), {
        title,
        description,
        eventDate: eventDate ? new Date(eventDate) : null,
        teamSize: teamSize || "Flexible",
        skillsNeeded: skillsArray,
        contactInfo,
        userId: user.uid,
        userName: userProfile.name, // Use userProfile.name
        createdAt: new Date(),
        interestedUsers: []
      });

      alert("Post created successfully!");
      setShowUpload(false);
      navigate("/");
    } catch (error) {
      console.error("Error creating post:", error);
      alert("Failed to create post. Please try again.");
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="relative w-full max-w-2xl bg-gradient-to-br from-gray-800/90 to-violet-900/90 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 overflow-hidden"
          initial={{ scale: 0.95, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.95, y: 20 }}
          transition={{ type: "spring", damping: 25 }}
        >
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-600 to-blue-500"></div>

          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">New Collaboration Post</h2>
              <button
                onClick={onClose}
                className="text-white/70 hover:text-white transition-colors"
              >
                <FaTimes size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5 text-black">
              <div className="space-y-2">
                <label htmlFor="title" className="block text-sm font-medium text-black">Project Title</label>
                <input
                  type="text"
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  placeholder="Your awesome project name"
                  required
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="description" className="block text-sm font-medium text-black">Description</label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all min-h-[120px]"
                  placeholder="Tell us about your project, goals, and what you're looking for..."
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="eventDate" className="block text-sm font-medium text-black flex items-center gap-2">
                    <FaCalendarAlt className="text-purple-500" />
                    Event Date
                  </label>
                  <input
                    type="date"
                    id="eventDate"
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="teamSize" className="block text-sm font-medium text-black flex items-center gap-2">
                    <FaUserFriends className="text-purple-500" />
                    Team Size
                  </label>
                  <input
                    type="text"
                    id="teamSize"
                    value={teamSize}
                    onChange={(e) => setTeamSize(e.target.value)}
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    placeholder="e.g., 3-5 members"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="skillsNeeded" className="block text-sm font-medium text-black flex items-center gap-2">
                  <FaCode className="text-purple-500" />
                  Skills Needed
                </label>
                <input
                  type="text"
                  id="skillsNeeded"
                  value={skillsNeeded}
                  onChange={(e) => setSkillsNeeded(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  placeholder="React, Node.js, Python (comma separated)"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="contactInfo" className="block text-sm font-medium text-black flex items-center gap-2">
                  <FaExternalLinkAlt className="text-purple-500" />
                  Contact Info
                </label>
                <input
                  type="text"
                  id="contactInfo"
                  value={contactInfo}
                  onChange={(e) => setContactInfo(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  placeholder="Email, Discord, or social media link"
                />
              </div>

              <div className="pt-3">
                <motion.button
                  type="submit"
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-500 text-white py-3.5 rounded-xl font-medium flex items-center justify-center gap-2 shadow-lg hover:shadow-purple-500/30 transition-all"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <FaUpload className="text-lg" />
                  Create Collaboration
                </motion.button>
              </div>
            </form>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default UploadPost;
