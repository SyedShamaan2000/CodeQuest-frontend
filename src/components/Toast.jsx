import { CheckCircle, AlertCircle } from "lucide-react";
import "./Toast.css";

export default function Toast({ show, message, type }) {
  if (!show) return null;
  return (
    <div className={`toast-container ${type}`}> 
      {type === "success" ? <CheckCircle size={20} /> : <AlertCircle size={20} />} 
      <span className="toast-message">{message}</span>
    </div>
  );
}