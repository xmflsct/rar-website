import React from 'react';

import Header from './header';
import Sidebar from './sidebar';
import Footer from './footer';

const Layout = (props) => {
  const [toggleNav, setToggleNav] = React.useState(false);

  const { children, location, name } = props;

  return (
    <div
      className={`site-wrapper ${name} ${toggleNav ? 'site-head-open' : ''}`}
    >
      <button
        className="nav-burger"
        href="#"
        type="button"
        onClick={() => setToggleNav(!toggleNav)}
      >
        <div
          className="hamburger hamburger--collapse"
          aria-label="Menu"
          role="button"
          aria-controls="navigation"
        >
          <div className="hamburger-box">
            <div className="hamburger-inner" />
          </div>
        </div>
      </button>
      <Header />
      <main id="site-main" className="site-main">
        <div id="swup" className="transition-fade">
          <div className="row">
            <div className="col-lg-3">
              <Sidebar location={location} />
            </div>
            <div className="main-content col-lg-9 col-md-12">{children}</div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
