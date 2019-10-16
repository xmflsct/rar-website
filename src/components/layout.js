import React from "react";

import Header from "../components/header";
import Footer from "../components/footer";

import "../utils/css/screen.css";

const Layout = props => {
  const { children } = props;

  return (
    <div className="site-wrapper">
      <Header />
      <main id="site-main" className="site-main">
        <div id="swup" className="transition-fade">
          {children}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
