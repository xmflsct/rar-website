import React, { useContext, useState } from 'react'
import { Button, Col, Form, InputGroup, Row } from 'react-bootstrap'
import { useStaticQuery, graphql } from 'gatsby'
import Img from 'gatsby-image'
import MD5 from 'crypto-js/md5'

import Layout from '../layouts/layout'
import { ContextBag } from '../layouts/context-bag'
import * as currency from '../components/utils/currency'

const LuckyCalendar2022 = ({ location }) => {
  const data = useStaticQuery(graphql`
    {
      calendar: contentfulCakesCake(
        contentful_id: { eq: "2Iz1sUdP6im922PprsHrt" }
      ) {
        contentful_id
        name
        image {
          fluid(maxWidth: 800) {
            ...GatsbyContentfulFluid_withWebp
          }
        }
        typeAPrice
        typeAUnit {
          typeUnit
        }
        customizationShipping {
          name
          price
        }
      }

      images: allFile(
        filter: { relativeDirectory: { regex: "/(page-lucky-calendar-2022)/" } }
        sort: { order: ASC, fields: name }
      ) {
        nodes {
          childImageSharp {
            fluid(maxWidth: 700) {
              ...GatsbyImageSharpFluid_withWebp
            }
          }
          name
        }
      }
    }
  `)
  const { dispatch } = useContext(ContextBag)
  const [calendar, setCalendar] = useState(0)
  const [shipping, setShipping] = useState(null)

  const onSubmit = e => {
    e.preventDefault()
    if (calendar !== 0) {
      calendar !== 0 &&
        dispatch({
          type: 'add',
          data: {
            type: 'cake',
            hash: MD5(
              new Date().getTime() + data.calendar.contentful_id
            ).toString(),
            contentful_id: data.calendar.contentful_id,
            name: data.calendar.name,
            typeAAmount: parseInt(calendar),
            typeAPrice: data.calendar.typeAPrice,
            typeAUnit: data.calendar.typeAUnit,
            image: data.calendar.image,
            ...(shipping && {
              customizationShipping: data.calendar.customizationShipping[0]
            })
          }
        })
    }
  }

  return (
    <Layout
      location={location}
      name='Lucky Calendar 2022'
      SEOtitle='Lucky Calendar 2022'
      SEOkeywords={['Lucky Calendar 2022', 'Lucky', 'Calendar', 'Rotterdam']}
    >
      <h1 className='sub-heading mb-3' id='matcha-lovers'>
        [A Little Lucky Calendar 2022]
      </h1>
      <p>Hello 2022!</p>
      <p>
        Here we go, our hand-drawn style calendar printed on Icy-gold texture
        paper.
      </p>
      <p>
        It is a ritual every year to design a calendar, a very limited Edition
        :)
      </p>
      <p>
        The cover is also a postcard, let's write to someone we love &amp; care.
      </p>
      <p>
        9.50/ A set of 4 calendar cards. Size 13.5cm X 13.5cm
        <br />
        [With Envelop &amp; Sticker]
      </p>
      <Row className='justify-content-md-center mb-3'>
        <Col xs={6}>
          <Img fluid={data.images.nodes[1].childImageSharp.fluid} />
        </Col>
        <Col xs={6}>
          <Img fluid={data.images.nodes[2].childImageSharp.fluid} />
        </Col>
      </Row>
      <p>
        You can pick up in the shop or we can post to you.
        <br />* Please keep in mind that the last post day of 2021 will be
        December 24th. The first post day of 2022 will be January 5th.
      </p>
      <Form onSubmit={e => onSubmit(e)}>
        <Row>
          <Col md={6}>
            <Form.Text as='p'>
              Please choose the calendars you would like to buy:
            </Form.Text>
            <Form.Group>
              <InputGroup>
                <InputGroup.Prepend>
                  <InputGroup.Text>{data.calendar.name}</InputGroup.Text>
                </InputGroup.Prepend>
                <Form.Control
                  name='calendar'
                  as='select'
                  required
                  defaultValue=''
                  onChange={e => setCalendar(e.target.value)}
                >
                  <option value='' disabled>
                    Select quantity
                  </option>
                  <option value={1}>× 1</option>
                  <option value={2}>× 2</option>
                  <option value={3}>× 3</option>
                  <option value={4}>× 4</option>
                  <option value={5}>× 5</option>
                  <option value={6}>× 6</option>
                  <option value={7}>× 7</option>
                  <option value={8}>× 8</option>
                  <option value={9}>× 9</option>
                  <option value={10}>× 10</option>
                </Form.Control>
              </InputGroup>
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Text as='p'>
              Please choose how would you like to have them:
            </Form.Text>
            <Form.Group>
              <InputGroup className='mb-3'>
                <InputGroup.Prepend>
                  <InputGroup.Radio
                    name='delivery'
                    value='pickup'
                    required
                    onChange={() => setShipping(false)}
                  />
                </InputGroup.Prepend>
                <InputGroup.Text>Pickup at our shop</InputGroup.Text>
              </InputGroup>
              <InputGroup className='mb-3'>
                <InputGroup.Prepend>
                  <InputGroup.Radio
                    name='delivery'
                    value='mail'
                    required
                    onChange={() => setShipping(true)}
                  />
                </InputGroup.Prepend>
                <InputGroup.Text>
                  Mail to an address in NL (+{' '}
                  {currency.short(data.calendar.customizationShipping[0].price)}
                  )
                </InputGroup.Text>
                <InputGroup.Append>
                  [Last post day of 2021：December 24th. The first post day of
                  2022 will be January 5th]
                </InputGroup.Append>
              </InputGroup>
            </Form.Group>
            <Button variant='rar' type='submit'>
              Add to bag
            </Button>
          </Col>
        </Row>
      </Form>
    </Layout>
  )
}

export default LuckyCalendar2022
