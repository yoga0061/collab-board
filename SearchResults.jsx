import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";

const SearchResults = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const query = new URLSearchParams(useLocation().search).get("q");

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const snapshot = await getDocs(collection(db, "posts"));
        const allPosts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        const filtered = allPosts.filter(post =>
          post.title?.toLowerCase().includes(query.toLowerCase()) ||
          post.description?.toLowerCase().includes(query.toLowerCase())
        );

        setResults(filtered);
      } catch (error) {
        console.error("Error fetching search results:", error);
      } finally {
        setLoading(false);
      }
    };

    if (query) fetchResults();
  }, [query]);

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Search Results for: "{query}"</h2>
      {loading ? (
        <p>Loading...</p>
      ) : results.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {results.map((post) => (
            <div key={post.id} className="p-4 border rounded-lg bg-white shadow">
              <h3 className="text-xl font-semibold">{post.title}</h3>
              <p className="text-gray-700">{post.description}</p>
              <p className="text-sm text-gray-400 mt-1">Posted by: {post.createdByEmail}</p>
            </div>
          ))}
        </div>
      ) : (
        <p>No results found.</p>
      )}
    </div>
  );
};

export default SearchResults;
