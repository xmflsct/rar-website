import React, { useContext } from "react"
import { Button, Col, Container, Row } from "react-bootstrap"
import { Link } from "gatsby"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faShoppingBasket } from "@fortawesome/free-solid-svg-icons"

import SEO from "./seo"
import Header from "./header"
import Footer from "./footer"

import { ContextBag } from "./context-bag"

const Layout = ({ children, name, SEOtitle, SEOkeywords }) => {
  const [toggleNav, setToggleNav] = React.useState(false)
  const { state } = useContext(ContextBag)

  let bagTotal = 0
  for (const type in state.bag.things) {
    for (const item of state.bag.things[type]) {
      bagTotal =
        bagTotal +
        (item.typeAAmount || 0) +
        (item.typeBAmount || 0) +
        (item.typeCAmount || 0)
    }
  }

  return (
    <>
      <div className='sticky-nav'>
        <Button
          className={`nav-burger hamburger hamburger--collapse ${
            toggleNav ? "is-active" : ""
          }`}
          variant='link'
          onClick={() => setToggleNav(!toggleNav)}
        >
          <span className='hamburger-box'>
            <span className='hamburger-inner'></span>
          </span>
        </Button>
        <Button variant='link' className='bag'>
          <Link to='/bag'>
            <FontAwesomeIcon icon={faShoppingBasket} /> ({bagTotal})
          </Link>
        </Button>
      </div>
      <Container
        className={`site-wrapper ${name} ${toggleNav ? "site-head-open" : ""}`}
      >
        <SEO title={SEOtitle} keywords={SEOkeywords} />
        <Header />
        <Row className='justify-content-center'>
          <Col as='main' lg={10}>
            {children}
          </Col>
        </Row>
        <Footer />
      </Container>
    </>
  )
}

export default Layout
