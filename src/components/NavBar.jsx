import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { FiMenu, FiUser, FiLogOut, FiMail, FiPhone, FiBook, FiCalendar, FiChevronDown, FiHome, FiBriefcase, FiAward, FiClock } from "react-icons/fi";
import { FaChalkboardTeacher, FaUserGraduate, FaBookOpen, FaGraduationCap, FaUniversity } from "react-icons/fa";
import { IoMdCheckmarkCircle } from "react-icons/io";
import "./Navbar.css";

export default function Navbar({ onToggle }) {
  const navigate = useNavigate();
  const [showConfirm, setShowConfirm] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [userData, setUserData] = useState({
    name: "Alphiya M S",
    initials: "AS",
    role: "Teacher",
    email: "Alphiya@gmail.com",
    phone: "8304033814",
    memberSince: "January 2020",
    subjects: ["Mathematics", "Physics", "Computer Science", "Calculus"],
    department: "Science & Technology",
    qualification: "M.Sc. in Mathematics, PhD in Physics",
    experience: "8 years teaching experience",
    address: "123 Education Street, Knowledge City",
    lastLogin: "Today, 10:30 AM",
    status: "Active",
    grade: "A+",
    achievements: ["Excellence in Teaching 2022", "Innovation Award 2021"]
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
        subjects: ["Mathematics", "Chemistry", "Biology"],
        department: "Medical Sciences",
        qualification: "Class 10 Student",
        experience: "Academic Excellence Award 2023",
        address: "456 Student Avenue, Campus Town",
        lastLogin: "Today, 09:15 AM",
        status: "Active",
        grade: "A+",
        achievements: ["Best Student Award 2023", "Math Olympiad Winner"]
      });
    } else {
      setUserData({
        name: "Alphiya M S",
        initials: "AS",
        role: "Teacher",
        email: "Alphiya@gmail.com",
        phone: "8304033814",
        memberSince: "January 2020",
        subjects: ["Mathematics", "Physics", "Computer Science", "Calculus"],
        department: "Science & Technology",
        qualification: "M.Sc. in Mathematics, PhD in Physics",
        experience: "8 years teaching experience",
        address: "123 Education Street, Knowledge City",
        lastLogin: "Today, 10:30 AM",
        status: "Active",
        grade: "A+",
        achievements: ["Excellence in Teaching 2022", "Innovation Award 2021"]
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

            {/* SPLIT-SCREEN PROFILE DROPDOWN */}
            {showProfile && (
              <div className="profile-dropdown split-profile">
                {/* LEFT SECTION - Personal Info */}
                <div className="profile-left-section">
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

                  {/* PERSONAL INFO */}
                  <div className="personal-info">
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
                        <FiPhone />
                      </div>
                      <div className="detail-content">
                        <h4>Phone Number</h4>
                        <p>{userData.phone}</p>
                      </div>
                    </div>

                    <div className="detail-row">
                      <div className="detail-icon">
                        <FiHome />
                      </div>
                      <div className="detail-content">
                        <h4>Address</h4>
                        <p>{userData.address}</p>
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
                  </div>

                  {/* ACTION BUTTONS */}
                  <div className="action-buttons">
                    <button className="action-btn edit-btn">
                      <FiUser /> Edit Profile
                    </button>
                    <button className="action-btn switch-btn" onClick={toggleRole}>
                      <FiChevronDown style={{ transform: 'rotate(-90deg)' }} />
                      Switch Role
                    </button>
                  </div>
                </div>

                {/* VERTICAL DIVIDER */}
                <div className="profile-divider">
                  <div className="divider-line"></div>
                </div>

                {/* RIGHT SECTION - Additional Info */}
                <div className="profile-right-section">
                  {/* STATS GRID */}
                  <div className="stats-grid">
                    <div className="stat-card">
                      <div className="stat-icon">
                        <FaBookOpen />
                      </div>
                      <div className="stat-content">
                        <h3>{userData.subjects.length}</h3>
                        <p>Subjects</p>
                      </div>
                    </div>

                    <div className="stat-card">
                      <div className="stat-icon">
                        <IoMdCheckmarkCircle />
                      </div>
                      <div className="stat-content">
                        <h3>{userData.status}</h3>
                        <p>Status</p>
                      </div>
                    </div>

                    <div className="stat-card">
                      <div className="stat-icon">
                        <FiClock />
                      </div>
                      <div className="stat-content">
                        <h3>{userData.lastLogin.split(',')[0]}</h3>
                        <p>Last Login</p>
                      </div>
                    </div>

                    <div className="stat-card">
                      <div className="stat-icon">
                        <FiAward />
                      </div>
                      <div className="stat-content">
                        <h3>{userData.role === "Teacher" ? "8y" : userData.grade}</h3>
                        <p>{userData.role === "Teacher" ? "Exp" : "Grade"}</p>
                      </div>
                    </div>
                  </div>

                  {/* SUBJECTS */}
                  <div className="info-section">
                    <h4><FiBook /> Subjects</h4>
                    <div className="subject-tags">
                      {userData.subjects.map((subject, index) => (
                        <span key={index} className="subject-tag">{subject}</span>
                      ))}
                    </div>
                  </div>

                  {/* DEPARTMENT */}
                  <div className="info-section">
                    <h4><FaUniversity /> Department</h4>
                    <p className="info-text">{userData.department}</p>
                  </div>

                  {/* QUALIFICATION */}
                  <div className="info-section">
                    <h4><FaGraduationCap /> Qualification</h4>
                    <p className="info-text">{userData.qualification}</p>
                  </div>

                  {/* EXPERIENCE */}
                  <div className="info-section">
                    <h4><FiBriefcase /> Experience</h4>
                    <p className="info-text">{userData.experience}</p>
                  </div>

                  {/* LOGOUT BUTTON */}
                  <button 
                    className="profile-logout-btn"
                    onClick={() => setShowConfirm(true)}
                  >
                    <FiLogOut />
                    Logout Account
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