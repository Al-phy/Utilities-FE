import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { FiMenu, FiUser, FiLogOut, FiMail, FiPhone, FiBook, FiCalendar, FiChevronDown } from "react-icons/fi";
import { FaChalkboardTeacher, FaUserGraduate } from "react-icons/fa";
import "./Navbar.css";

export default function Navbar({ onToggle }) {
  const navigate = useNavigate();
  const [showConfirm, setShowConfirm] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [userData, setUserData] = useState({
    name: "John Smith",
    initials: "JS",
    role: "Teacher",
    email: "john.smith@eduportal.com",
    phone: "+1 (555) 123-4567",
    memberSince: "January 2020",
    subjects: ["Mathematics", "Physics", "Computer Science", "Calculus"]
  });

  // Close profile dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      const profileContainer = document.querySelector('.profile-container');
      if (profileContainer && !profileContainer.contains(event.target)) {
        setShowProfile(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  function handleLogout() {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("userId");
    navigate("/");
  }

  // Toggle between teacher/student (for demo)
  function toggleRole() {
    if (userData.role === "Teacher") {
      setUserData({
        name: "Alex Johnson",
        initials: "AJ",
        role: "Student",
        email: "alex.johnson@eduportal.com",
        phone: "+1 (555) 987-6543",
        memberSince: "September 2022",
        subjects: ["Mathematics", "Chemistry", "Biology"]
      });
    } else {
      setUserData({
        name: "John Smith",
        initials: "JS",
        role: "Teacher",
        email: "john.smith@eduportal.com",
        phone: "+1 (555) 123-4567",
        memberSince: "January 2020",
        subjects: ["Mathematics", "Physics", "Computer Science", "Calculus"]
      });
    }
  }

  return (
    <>
      {/* NAVBAR */}
      <header className="navbar">
        {/* MENU BUTTON */}
        <button className="menu-btn" onClick={onToggle}>
          <FiMenu size={22} />
        </button>

        {/* TITLE */}
        <h3 className="navbar-title">📊 Student Analytics</h3>

        {/* ACTIONS */}
        <div className="navbar-actions">
          {/* PROFILE DROPDOWN */}
          <div className="profile-container">
            <button 
              className="profile-btn"
              onClick={() => setShowProfile(!showProfile)}
            >
              <div className="profile-icon">
                {userData.initials}
              </div>
              <FiChevronDown className={showProfile ? "rotate" : ""} />
            </button>

            {/* PROFILE DROPDOWN CONTENT */}
            {showProfile && (
              <div className="profile-dropdown">
                {/* PROFILE HEADER */}
                <div className="profile-header">
                  <div className="profile-avatar">
                    {userData.initials}
                  </div>
                  <div className="profile-info">
                    <h3>{userData.name}</h3>
                    <p className={`role-badge ${userData.role.toLowerCase()}`}>
                      {userData.role === "Teacher" ? (
                        <FaChalkboardTeacher style={{ marginRight: "5px" }} />
                      ) : (
                        <FaUserGraduate style={{ marginRight: "5px" }} />
                      )}
                      {userData.role}
                    </p>
                  </div>
                </div>

                {/* PROFILE DETAILS */}
                <div className="profile-details">
                  <div className="detail-row">
                    <div className="detail-icon">
                      <FiPhone />
                    </div>
                    <div className="detail-content">
                      <h4>Phone Number</h4>
                      <p>{userData.phone}</p>
                    </div>
                  </div>

                  <div className="detail-row">
                    <div className="detail-icon">
                      <FiMail />
                    </div>
                    <div className="detail-content">
                      <h4>Email Address</h4>
                      <p>{userData.email}</p>
                    </div>
                  </div>

                  <div className="detail-row">
                    <div className="detail-icon">
                      <FiUser />
                    </div>
                    <div className="detail-content">
                      <h4>Role</h4>
                      <p>{userData.role}</p>
                    </div>
                  </div>

                  <div className="detail-row">
                    <div className="detail-icon">
                      <FiBook />
                    </div>
                    <div className="detail-content">
                      <h4>Subjects</h4>
                      <div className="subject-tags">
                        {userData.subjects.map((subject, index) => (
                          <span key={index} className="subject-tag">{subject}</span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="detail-row">
                    <div className="detail-icon">
                      <FiCalendar />
                    </div>
                    <div className="detail-content">
                      <h4>Member Since</h4>
                      <p>{userData.memberSince}</p>
                    </div>
                  </div>

                  {/* DEMO BUTTON TO SWITCH ROLE */}
                  <button 
                    className="switch-role-btn"
                    onClick={toggleRole}
                  >
                    Switch to {userData.role === "Teacher" ? "Student" : "Teacher"} View
                  </button>
                </div>

                {/* LOGOUT BUTTON IN PROFILE */}
                <div className="profile-footer">
                  <button 
                    className="profile-logout-btn"
                    onClick={() => setShowConfirm(true)}
                  >
                    <FiLogOut />
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* ORIGINAL LOGOUT BUTTON (HIDDEN WHEN PROFILE IS VISIBLE) */}
          {!showProfile && (
            <button
              className="nav-btn logout-btn"
              onClick={() => setShowConfirm(true)}
            >
              Logout
            </button>
          )}
        </div>
      </header>

      {/* CONFIRMATION MODAL */}
      {showConfirm && (
        <div className="confirm-modal">
          <div className="confirm-modal-content">
            <h3>Confirm Logout</h3>
            <p>Are you sure you want to logout?</p>
            <div className="modal-buttons">
              <button className="cancel" onClick={() => setShowConfirm(false)}>
                Cancel
              </button>
              <button className="logout" onClick={handleLogout}>
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}