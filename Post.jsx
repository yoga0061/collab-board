import React, { useState, useEffect } from "react";
import { db } from "../firebase";
import { doc, updateDoc, arrayUnion } from "firebase/firestore";
import { FaHandRock, FaUserFriends, FaCalendarAlt, FaCode, FaExternalLinkAlt } from "react-icons/fa";
import { motion } from "framer-motion";

const Post = ({ post, user, onInterestClick }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isInterested, setIsInterested] = useState(false);
  const [showInterestedUsers, setShowInterestedUsers] = useState(false);

  // Check if current user is already interested
  useEffect(() => {
    if (user && post.interestedUsers) {
      const interested = post.interestedUsers.some(u => u.userId === user.uid);
      setIsInterested(interested);
    }
  }, [user, post.interestedUsers]);

  const handleInterestClick = (e) => {
    e.stopPropagation();
    if (!user) return;

    if (isInterested) {
      setShowInterestedUsers(!showInterestedUsers);
    } else {
      onInterestClick(post.id);
      setIsInterested(true);
    }
  };

  const formatDate = (date) => {
    if (!date) return "Not specified";
    if (typeof date.toDate === 'function') {
      return date.toDate().toLocaleDateString();
    }
    return new Date(date).toLocaleDateString();
  };

  const getDaysRemaining = (eventDate) => {
    if (!eventDate) return null;
    const today = new Date();
    const eventDay = typeof eventDate.toDate === 'function'
      ? eventDate.toDate()
      : new Date(eventDate);
    const diffTime = eventDay - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? `${diffDays} days remaining` : "Event passed";
  };

  if (!post) return null;

  return (
    <motion.div
      className={`bg-gray-800/50 backdrop-blur-sm text-white p-6 rounded-xl shadow-lg mb-6 cursor-pointer border border-gray-700 hover:border-purple-500 transition-all ${
        isExpanded ? "border-purple-500" : ""
      }`}
      onClick={() => setIsExpanded(!isExpanded)}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold text-white">{post.title}</h2>
          {post.userName && (
            <p className="text-purple-400">Posted by: {post.userName}</p>
          )}
        </div>
        <span className="text-sm text-gray-400">
          {formatDate(post.createdAt)}
        </span>
      </div>

      <p className="mt-3 text-gray-300">{post.description}</p>

      {isExpanded && (
        <div className="mt-4 space-y-3">
          <div className="flex items-center gap-2 text-sm">
            <FaCalendarAlt className="text-purple-400" />
            <span>Event Date: {formatDate(post.eventDate)}</span>
            {post.eventDate && (
              <span className="ml-2 px-2 py-1 bg-purple-900/50 rounded-full text-xs">
                {getDaysRemaining(post.eventDate)}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 text-sm">
            <FaUserFriends className="text-purple-400" />
            <span>Team Size: {post.teamSize || "Flexible"}</span>
          </div>

          {post.skillsNeeded?.length > 0 && (
            <div className="mt-3">
              <div className="flex items-center gap-2 text-sm mb-2">
                <FaCode className="text-purple-400" />
                <span>Skills Needed:</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {post.skillsNeeded.map((skill, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-purple-900/30 text-purple-200 rounded-full text-xs"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {post.contactInfo && (
            <div className="mt-3">
              <p className="text-sm flex items-center gap-2">
                <span className="text-purple-400">Contact:</span>
                {post.contactInfo.startsWith('http') ? (
                  <a
                    href={post.contactInfo}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:underline flex items-center gap-1"
                    onClick={e => e.stopPropagation()}
                  >
                    {post.contactInfo} <FaExternalLinkAlt size={12} />
                  </a>
                ) : (
                  <span>{post.contactInfo}</span>
                )}
              </p>
            </div>
          )}
        </div>
      )}

      <div className="mt-4 flex justify-between items-center">
        <div className="text-sm text-gray-400">
          {post.interestedUsers?.length || 0} interested
          {post.interestedUsers?.length > 0 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowInterestedUsers(!showInterestedUsers);
              }}
              className="ml-2 text-purple-400 hover:underline"
            >
              {showInterestedUsers ? 'Hide' : 'Show'}
            </button>
          )}
        </div>

        <motion.button
          onClick={handleInterestClick}
          className={`flex items-center gap-2 py-2 px-4 rounded-full ${
            isInterested ? 'bg-green-600/80' : 'bg-purple-600'
          } text-white hover:bg-purple-700 transition-colors`}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <FaHandRock />
          {isInterested ? 'Interested' : "I'm Interested"}
        </motion.button>
      </div>

      {showInterestedUsers && post.interestedUsers?.length > 0 && user?.uid === post.userId && (
        <div className="mt-4 space-y-2">
          <h4 className="text-sm font-medium text-gray-400">Interested Members:</h4>
          {post.interestedUsers.map((user, index) => (
            <div
              key={index}
              className="p-3 bg-gray-700/50 rounded-lg flex flex-col sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="font-medium">{user.name}</p>
                <p className="text-sm text-gray-300">{user.skills}</p>
              </div>
              {user.social && (
                <a
                  href={user.social}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:underline text-sm mt-1 sm:mt-0 flex items-center gap-1"
                  onClick={e => e.stopPropagation()}
                >
                  Contact <FaExternalLinkAlt size={10} />
                </a>
              )}
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
};

export default Post;
