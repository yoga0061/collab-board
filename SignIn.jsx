import React, { useState } from "react";
import { signInWithPopup } from "firebase/auth";
import { auth, provider, db } from "../firebase";
import { doc, setDoc } from "firebase/firestore";
import { FcGoogle } from "react-icons/fc";
import './SignIn.css';

const SignIn = () => {
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSignIn = async () => {
    setLoading(true);
    setErrorMessage("");
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      await setDoc(doc(db, "users", user.uid), {
        name: user.displayName,
        email: user.email,
        photoURL: user.photoURL,
        uid: user.uid,
      });

      alert("Login Successful 🎉");
    } catch (error) {
      console.error("Error signing in: ", error);
      setErrorMessage("Login failed! Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-yellow-100">
      <div className="bg-yellow/80 backdrop-blur-lg border border-yellow-300 rounded-2xl shadow-xl p-10 w-full max-w-md text-center transition-transform transform hover:scale-105">
        <h2 className="text-4xl font-bold text-yellow-800 mb-6">Welcome Back</h2>
        <p className="text-yellow-700 mb-8">Sign in to your account using Google</p>

        {errorMessage && <p className="text-red-500 mb-4">{errorMessage}</p>}

        <button
          onClick={handleSignIn}
          disabled={loading}
          className={`flex items-center justify-center gap-3 w-full py-3 px-6 rounded-xl text-white ${
            loading
              ? "bg-yellow-400"
              : "bg-gradient-to-r from-yellow-500 to-yellow-700 hover:from-yellow-600 hover:to-yellow-800"
          } transition-all duration-300 shadow-lg transform hover:scale-105`}
        >
          <FcGoogle className="text-2xl bg-white rounded-full p-1" />
          {loading ? "Signing in..." : "Sign in with Google"}
        </button>
      </div>
    </div>
  );
};

export default SignIn;
