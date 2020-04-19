import React from "react"
import { Col, Nav, Row } from "react-bootstrap"
import { useStaticQuery, graphql, Link } from "gatsby"
import Img from "gatsby-image"

const Header = () => {
  const data = useStaticQuery(graphql`
    {
      file(relativePath: { eq: "layout-header/logo.png" }) {
        childImageSharp {
          fluid(maxWidth: 400) {
            ...GatsbyImageSharpFluid_withWebp_noBase64
          }
        }
      }
    }
  `)
  return (
    <>
      <Row as='header' className='justify-content-center'>
        <Col xs={6} sm={5} md={4} lg={3} className='logo'>
          <Link to='/'>
            <Img className='m-3' fluid={data.file.childImageSharp.fluid} />
          </Link>
        </Col>
      </Row>
      <Nav justify defaultActiveKey='/'>
        <Nav.Item>
          <Link to='/' activeClassName='active'>
            Sweet Home
          </Link>
        </Nav.Item>
        <Nav.Item>
          <Link to='/gift-card' activeClassName='active'>
            Gift Card
          </Link>
        </Nav.Item>
        <Nav.Item>
          <Link to='/order-cakes' activeClassName='active'>
            Cakes &amp; Sweets
          </Link>
        </Nav.Item>
        <Nav.Item>
          <Link to='/birthday-cake' activeClassName='active'>
            Birthday Cakes
          </Link>
        </Nav.Item>
        <Nav.Item>
          Webshop
          <br />
          [Coming Soon]
        </Nav.Item>
      </Nav>
    </>
  )
}

export default Header
