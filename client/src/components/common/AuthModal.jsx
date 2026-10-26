import React, { useState } from "react";
import Login from "../../auth/Login";
import SignUp from "../../auth/SignUp";
import "./AuthModal.css";

const AuthModal = ({ isOpen, onClose, initialView = "login" }) => {
  const [view, setView] = useState(initialView); // "login" | "signup"

  React.useEffect(() => {
    if (isOpen) {
      setView(initialView);
    }
  }, [isOpen, initialView]);

  if (!isOpen) return null;

  const switchToSignup = () => setView("signup");
  const switchToLogin = () => setView("login");

  return (
    <div className="auth-overlay" onClick={onClose}>
      <div className="auth-modal-container" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose}>✖</button>

        {view === "login" ? (
          <Login onClose={onClose} onSwitchToSignup={switchToSignup} isModal />
        ) : (
          <SignUp onClose={onClose} onSwitchToLogin={switchToLogin} isModal />
        )}
      </div>
    </div>
  );
};

export default AuthModal;
