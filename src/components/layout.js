import React from "react"
import useDarkMode from 'use-dark-mode';

import Header from "../components/header"
import Footer from "../components/footer"

// import "../utils/normalize.css"
import "../utils/css/screen.css"

const Layout = props => {
  useDarkMode()

  const { children } = props

  return (
    <div className="site-wrapper">
      <Header category={props.category}/>
      <main id="site-main" className="site-main">
        <div id="swup" className="transition-fade">
          {children}
        </div>
      </main>
      <Footer />
    </div>
  )
}

export default Layout
