import React, { useState } from "react";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signInWithPopup,
} from "firebase/auth";
import { auth, provider, db } from "./firebase";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { v4 as uuidv4 } from "uuid";
import { FaEye, FaEyeSlash, FaGoogle } from "react-icons/fa";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignup, setIsSignup] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isSignup) {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        await createUserInFirestore(user.uid);
        alert("Signed up successfully!");
      } else {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        await createUserInFirestore(user.uid);
        alert("Logged in successfully!");
      }
    } catch (error) {
      console.error(error);
      alert(error.message || "Authentication failed!");
    } finally {
      setLoading(false);
    }
  };

  const createUserInFirestore = async (userId) => {
    try {
      const userDoc = await getDoc(doc(db, "users", userId));
      if (!userDoc.exists()) {
        const messageId = uuidv4();
        await setDoc(doc(db, "users", userId), {
          messageId,
          createdAt: new Date(),
        });
        console.log("User document created with messageId:", messageId);
      }
    } catch (error) {
      console.error("Error creating user document:", error);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) return alert("Please enter your email to reset password.");
    try {
      await sendPasswordResetEmail(auth, email);
      alert("Password reset email sent! Check your inbox.");
    } catch (error) {
      console.error(error);
      alert(error.message || "Failed to send reset email.");
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      const userCredential = await signInWithPopup(auth, provider);
      const user = userCredential.user;
      await createUserInFirestore(user.uid);
      alert("Signed in with Google successfully!");
    } catch (error) {
      console.error(error);
      alert(error.message || "Google sign-in failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 bg-yellow-50 text-black p-6 rounded-lg shadow-xl border border-yellow-300">
      <h1 className="text-3xl font-bold text-center mb-6">
        {isSignup ? "Sign Up" : "Login"} to{" "}
        <span className="text-yellow-600">Collab-Board</span>
      </h1>
      <form onSubmit={handleAuth} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            type="email"
            id="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2 border border-yellow-300 rounded bg-white focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
            required
          />
        </div>

        <div className="relative">
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
            Password
          </label>
          <input
            type={showPassword ? "text" : "password"}
            id="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-2 border border-yellow-300 rounded bg-white focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 pr-10"
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-yellow-600"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <FaEyeSlash /> : <FaEye />}
          </button>
        </div>

        <div className="flex justify-between items-center">
          <button
            type="button"
            onClick={handleForgotPassword}
            className="text-sm text-yellow-600 hover:underline"
          >
            Forgot Password?
          </button>
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full bg-yellow-500 hover:bg-yellow-600 text-white p-2 rounded flex items-center justify-center ${
            loading ? "opacity-70 cursor-not-allowed" : ""
          }`}
        >
          {loading ? (
            <span className="animate-pulse">Processing...</span>
          ) : isSignup ? (
            "Sign Up"
          ) : (
            "Login"
          )}
        </button>

        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-yellow-50 text-gray-500">Or continue with</span>
          </div>
        </div>

        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={loading}
          className={`w-full bg-red-500 hover:bg-red-600 text-white p-2 rounded flex items-center justify-center ${
            loading ? "opacity-70 cursor-not-allowed" : ""
          }`}
        >
          <FaGoogle className="mr-2" />
          Sign in with Google
        </button>
      </form>

      <p className="text-center mt-4">
        {isSignup ? "Already have an account?" : "Don't have an account?"}{" "}
        <button
          onClick={() => setIsSignup(!isSignup)}
          className="text-yellow-600 font-semibold hover:underline focus:outline-none"
        >
          {isSignup ? "Login" : "Sign Up"}
        </button>
      </p>
    </div>
  );
};

export default Login;
