const Navbar = () => {
  return (
    <nav className="navbar bg-dark navbar-expand-lg" data-bs-theme="dark">
      <div className="container-fluid">
        <a className="navbar-brand" href="#">
          Navbar
        </a>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav">
            <li className="nav-item">
              <a className="nav-link" href="/">
                Login
              </a>
            </li>

            <li className="nav-item">
              <a className="nav-link" href="/register">
                Register
              </a>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
