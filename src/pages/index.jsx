import React from 'react'
import { Col, Row } from 'react-bootstrap'
import { useStaticQuery, graphql, Link } from 'gatsby'
import Img from 'gatsby-image'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faFacebookF, faInstagram } from '@fortawesome/free-brands-svg-icons'

import Layout from '../layouts/layout'

const Index = () => {
  const data = useStaticQuery(graphql`
    {
      main: file(relativePath: { regex: "/(page-index/main.jpg)/" }) {
        childImageSharp {
          fluid(maxWidth: 400) {
            ...GatsbyImageSharpFluid_withWebp_noBase64
          }
        }
      }
    }
  `)
  return (
    <Layout
      name='Round&amp;Round Rotterdam'
      SEOtitle='Home'
      SEOkeywords={['Round&Round', 'Rotterdam']}
    >
      <Row className='justify-content-center text-center'>
        <Col>
          <p>
            {
              '<< We are 5 years old on January 16th 2021! Thank you for your love and support! >>'
            }
          </p>
        </Col>
      </Row>
      <Row className='justify-content-center'>
        <Col md={8}>
          <Link to='/gift-card'>
            <Img fluid={data.main.childImageSharp.fluid} />
          </Link>
        </Col>
      </Row>
      {/* <Row className='justify-content-center text-center'>
        <Col>
          <p>
            <strong>
              [We are still open for Take away &amp; Order pick up]
            </strong>
          </p>
        </Col>
      </Row> */}
      <Row className='justify-content-center text-center'>
        <Col>
          <p>
            Wednesday-Saturday 12:00-17:00
            <br />
            Sunday 12:00-16:00
            <br />
            * Pancake last-order is 1 hour prior to closing time
            <br />* Digital pay only
          </p>
        </Col>
      </Row>
      <Row className='justify-content-center text-center mb-3'>
        <Col xs={2}>
          <a
            href='https://www.facebook.com/roundandround.nl'
            className='no-border'
            target='_blank'
            rel='noopener noreferrer'
          >
            <FontAwesomeIcon icon={faFacebookF} size='2x' />
          </a>
        </Col>
        <Col xs={2}>
          <a
            href='https://www.instagram.com/roundandround_rotterdam/'
            className='no-border'
            target='_blank'
            rel='noopener noreferrer'
          >
            <FontAwesomeIcon icon={faInstagram} size='2x' />
          </a>
        </Col>
      </Row>
      <Row className='justify-content-center text-center'>
        <Col>
          <p>
            Hoogstraat 55A, 3011 PG Rotterdam
            <br />
            010 785 6545
            <br />
            info@roundandround.nl
          </p>
        </Col>
      </Row>
    </Layout>
  )
}

export default Index
