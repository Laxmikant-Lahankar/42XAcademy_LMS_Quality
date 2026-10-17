import logoUrl from "../../../assets/logo/logo-42x.png";
import "./Logo.css";

// Official 42X Academy logo (from 42xacademy.com) with the "ACADEMY" wordmark.
// variant="dark" for dark backgrounds (sidebar), "light" for white backgrounds.
function Logo({ variant = "light", size = "md" }) {
  return (
    <span className={`logo logo-${variant} logo-${size}`}>
      <img src={logoUrl} alt="42X" className="logo-mark" width="384" height="152" />
      <span className="logo-word">ACADEMY</span>
    </span>
  );
}

export default Logo;
