import React from "react";

const Navbar = () => {
	return (
		<header className="site-header">
			<nav className="navbar container">
				<div className="nav-left">
					<a href="#" className="brand">MeFolio</a>
				</div>
				<ul className="nav-links">
					<li><a href="#about">About</a></li>
					<li><a href="#portfolios">Portfolios</a></li>
					<li><a href="#contact">Contact</a></li>
				</ul>
			</nav>
		</header>
	);
};

export default Navbar;
