import "./Footer.css";

function Footer() {
  return (
    <footer className="app-footer">
      <span>© {new Date().getFullYear()} 42X Academy. All rights reserved.</span>
      <span>Learn · Grow · Build Your Future</span>
    </footer>
  );
}

export default Footer;
