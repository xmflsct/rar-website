import React, { useContext, useState } from 'react'
import { Button, Col, Figure, Form, InputGroup, Row } from 'react-bootstrap'
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
        Lucky Calendar 2022
      </h1>
      <h2 className='mb-3 color-matcha'>
        Support our little shop during Corona Crisis
      </h2>
      <p className='color-matcha'>
        Many local small businesses are affected by Corona outbreak including
        Round&amp;Round. Please support us by purchasing a gift card for later
        use. In this period we will offer special voucher and gifts for you.
      </p>
      <h2 className='mb-3'>About Gift Card</h2>
      <p>
        Round&amp;Round Gift Card is valid indefinitely and can be exchanged at
        any time for both food and non-food products in the shop. It is a great
        surprise for someone you love and care.
      </p>
      <Row className='justify-content-md-center mb-3'></Row>
      <h2 className='mb-3'>Details</h2>
      <ul>
        <li>We have 3 different values of gift card: € </li>
        <li>Gift cards can be purchased online and also in our shop.</li>
        <li>
          All cards are valid indefinitely. It can be used multiple times of
          purchase as you wish.
        </li>
        <li>Gift cards cannot be refunded.</li>
        <li>
          If you want to book a Hightea or a Birthday cake, please reserve in
          advance.
        </li>
      </ul>
      <h2 className='mb-3'>Order Online</h2>
      <Row className='justify-content-md-center'>
        <Col lg={6} className='mb-3'>
          <Figure.Caption className='color-matcha'>
            Support us during this special time. We prepared special gifts for
            you.
          </Figure.Caption>
        </Col>
        <Col lg={6} className='mb-3'>
          <Figure.Caption className='color-matcha'>
            A " I love you so Matcha" postcard will be attached to each gift
            card now. Printed on 100% recycled paper.
          </Figure.Caption>
        </Col>
      </Row>
      <Form onSubmit={e => onSubmit(e)}>
        <Row>
          <Col md={6}>
            <Form.Text as='p'>
              Please choose the gift cards you would like to buy:
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
              Please choose how would you like to collect them:
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
