import React from "react";

export default function ConfirmPopup({ message, onConfirm, onCancel }) {
  return (
    <div style={styles.overlay}>
      <div style={styles.popup}>
        <p style={styles.message}>{message}</p>

        <div style={styles.buttons}>
          <button style={styles.okBtn} onClick={onConfirm}>OK</button>
          <button style={styles.cancelBtn} onClick={onCancel}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100vw",
    height: "100vh",
    background: "rgba(0,0,0,0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  popup: {
    background: "#fff",
    padding: "20px",
    borderRadius: "10px",
    width: "300px",
    textAlign: "center",
  },
  message: {
    fontSize: "18px",
    marginBottom: "20px",
  },
  buttons: {
    display: "flex",
    justifyContent: "space-around",
  },
  okBtn: {
    background: "green",
    color: "white",
    padding: "8px 18px",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  },
  cancelBtn: {
    background: "gray",
    color: "white",
    padding: "8px 18px",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  },
};
