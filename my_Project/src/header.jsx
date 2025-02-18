function Header() {
  return (
      <header className="electricity-maps-header">
          <div className="header-left">
              <div className="logo">ELECTRICITY MAPS</div>
              <nav className="header-nav">
                  <ul>
                      <li><a href="/faq">FAQ</a></li>
                      <li><a href="/methodology">1</a></li>
                      <li><a href="/careers">2</a></li>
                      <li><a href="/community">Community</a></li>
                      <li><a href="/blog">Blog</a></li>
                  </ul>
              </nav>
          </div>
          <div className="header-right">
              <div className="toggle-group">
                  <button className="toggle-button active">Production</button>
                  <button className="toggle-button">Consumption</button>
              </div>
              <div className="toggle-group">
                  <button className="toggle-button active">Country</button>
                  <button className="toggle-button">Zone</button>
                  <span className="info-icon">(i)</span>
              </div>
              <button className="zoom-plus">+</button>
          </div>
      </header>
  );
}
export default Header;