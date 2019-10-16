import React from "react";

import Header from "../components/header";
import Sidebar from "../components/sidebar";
import Footer from "../components/footer";

import "../utils/css/screen.css";

const Layout = props => {
  const { children, location, name } = props;

  return (
    <div className={`site-wrapper ${name}`}>
      <Header />
      <main id="site-main" className="site-main">
        <div id="swup" className="transition-fade">
          <div className="row">
            <div className="col-3">
              <Sidebar location={location} />
            </div>
            <div className="col-9">
              {children}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
