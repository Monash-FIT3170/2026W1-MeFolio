import React from "react";

const Navbar = ({ displayName = "John Doe" }) => {
  return (
    <header className="site-header">
      <nav className="navbar container">
        <div className="nav-left">
          {/* Needs to be replaced by the actual profile name */}
          <a href="#">{displayName}</a>
        </div>
        <ul className="nav-links">
          <li><a href="#about">About</a></li>
          <li><a href="#projects">Projects</a></li>
          <li><a href="#skills">Skills</a></li>
          <li><a href="#contact">Contact</a></li>
          <button className="inline-flex items-center gap-2 px-6 py-3 bg-transparent hover:bg-slate-50 text-slate-900 text-base font-semibold rounded-xl border border-slate-300 hover:border-[#5b3df5] transition-colors duration-150 cursor-pointer">
            Dark Mode
          </button>
        </ul>
      </nav>
    </header>
  );
};

export default Navbar;
