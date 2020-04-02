import React, { useContext, useState } from "react"
import { useStaticQuery, graphql } from "gatsby"
import Img from "gatsby-image"
import { Button, Col, Figure, Form, InputGroup, Row } from "react-bootstrap"

import Layout from "../layouts/layout"
import { ContextBag } from "../layouts/context-bag"
import * as currency from "../components/utils/currency"

const GiftCard = ({ location }) => {
  const data = useStaticQuery(graphql`
    {
      giftCard20: contentfulCakesCake(
        contentful_id: { eq: "4FPZT9Es23MBaZ31gK0UIG" }
      ) {
        contentful_id
        name
        image {
          fluid(maxWidth: 200) {
            ...GatsbyContentfulFluid_withWebp
          }
        }
        priceWhole
        wholeIdentity
      }
      giftCard50: contentfulCakesCake(
        contentful_id: { eq: "6pHfPYlVeDZAP9srVEuPBB" }
      ) {
        contentful_id
        name
        image {
          fluid(maxWidth: 200) {
            ...GatsbyContentfulFluid_withWebp
          }
        }
        priceWhole
        wholeIdentity
      }
      giftCard100: contentfulCakesCake(
        contentful_id: { eq: "5TGcOiXyeHl4MQNxxb8DpN" }
      ) {
        contentful_id
        name
        image {
          fluid(maxWidth: 200) {
            ...GatsbyContentfulFluid_withWebp
          }
        }
        priceWhole
        wholeIdentity
      }
      giftCardShipping: contentfulCakesCake(
        contentful_id: { eq: "44AIXbCxKgKAkDr2366hZ2" }
      ) {
        contentful_id
        name
        image {
          fluid(maxWidth: 200) {
            ...GatsbyContentfulFluid_withWebp
          }
        }
        priceWhole
        wholeIdentity
      }
      images: allFile(
        filter: { relativeDirectory: { regex: "/(page-gift-card)/" } }
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
  const [amount20, setAmount20] = useState(0)
  const [amount50, setAmount50] = useState(0)
  const [amount100, setAmount100] = useState(0)
  const [shipping, setShipping] = useState(null)

  const onSubmit = e => {
    e.preventDefault()
    if (amount20 !== 0 || amount50 !== 0 || amount50 !== 0) {
      amount20 !== 0 &&
        dispatch({
          type: "add",
          data: {
            type: "none_food",
            contentful_id: data.giftCard20.contentful_id,
            name: data.giftCard20.name,
            amountWhole: parseInt(amount20),
            priceWhole: data.giftCard20.priceWhole,
            wholeIdentity: data.giftCard20.wholeIdentity,
            image: data.giftCard20.image
          }
        })
      amount50 !== 0 &&
        dispatch({
          type: "add",
          data: {
            type: "none_food",
            contentful_id: data.giftCard50.contentful_id,
            name: data.giftCard50.name,
            amountWhole: parseInt(amount50),
            priceWhole: data.giftCard50.priceWhole,
            wholeIdentity: data.giftCard50.wholeIdentity,
            image: data.giftCard50.image
          }
        })
      amount100 !== 0 &&
        dispatch({
          type: "add",
          data: {
            type: "none_food",
            contentful_id: data.giftCard100.contentful_id,
            name: data.giftCard100.name,
            amountWhole: parseInt(amount100),
            priceWhole: data.giftCard100.priceWhole,
            wholeIdentity: data.giftCard100.wholeIdentity,
            image: data.giftCard100.image
          }
        })
      shipping &&
        dispatch({
          type: "add",
          data: {
            type: "none_food",
            contentful_id: data.giftCardShipping.contentful_id,
            name: data.giftCardShipping.name,
            amountWhole: 1,
            priceWhole: data.giftCardShipping.priceWhole,
            wholeIdentity: data.giftCardShipping.wholeIdentity,
            image: data.giftCardShipping.image
          }
        })
    }
  }

  return (
    <Layout
      location={location}
      name='Gift Card'
      SEOtitle='Gift Card'
      SEOkeywords={["Gift Card", "Gift", "Card", "Rotterdam"]}
    >
      <h1 className='sub-heading mb-3' id='matcha-lovers'>
        Buy Round&amp;Round Gift Card
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
      <Row className='justify-content-md-center mb-3'>
        <Col lg={8}>
          <Img fluid={data.images.nodes[1].childImageSharp.fluid} />
        </Col>
      </Row>
      <h2 className='mb-3'>Details</h2>
      <ul>
        <li>
          We have 3 different values of gift card: €{" "}
          {data.giftCard20.priceWhole / 100}/{data.giftCard50.priceWhole / 100}/
          {data.giftCard100.priceWhole / 100}.
        </li>
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
          <Img
            fluid={data.images.nodes[2].childImageSharp.fluid}
            className='mb-1'
          />
          <Figure.Caption className='color-matcha'>
            Support us during this special time. We prepared special gifts for
            you.
          </Figure.Caption>
        </Col>
        <Col lg={6} className='mb-3'>
          <Img
            fluid={data.images.nodes[3].childImageSharp.fluid}
            className='mb-1'
          />
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
                  <InputGroup.Text>{data.giftCard20.name}</InputGroup.Text>
                </InputGroup.Prepend>
                <Form.Control
                  name='option20'
                  as='select'
                  onChange={e => setAmount20(e.target.value)}
                >
                  <option value={0}>0</option>
                  <option value={1}>× 1</option>
                  <option value={2}>× 2</option>
                  <option value={3}>× 3</option>
                  <option value={4}>× 4</option>
                  <option value={5}>× 5</option>
                </Form.Control>
              </InputGroup>
              <Form.Text>
                Plus a postcard and a 10% off Birthday cake voucher
              </Form.Text>
            </Form.Group>
            <Form.Group>
              <InputGroup>
                <InputGroup.Prepend>
                  <InputGroup.Text>{data.giftCard50.name}</InputGroup.Text>
                </InputGroup.Prepend>
                <Form.Control
                  name='option50'
                  as='select'
                  onChange={e => setAmount50(e.target.value)}
                >
                  <option value=''>0</option>
                  <option value={1}>× 1</option>
                  <option value={2}>× 2</option>
                  <option value={3}>× 3</option>
                  <option value={4}>× 4</option>
                  <option value={5}>× 5</option>
                </Form.Control>
              </InputGroup>
              <Form.Text>
                Plus a postcard and a 20% off Birthday cake voucher
              </Form.Text>
            </Form.Group>
            <Form.Group>
              <InputGroup>
                <InputGroup.Prepend>
                  <InputGroup.Text>{data.giftCard100.name}</InputGroup.Text>
                </InputGroup.Prepend>
                <Form.Control
                  name='option100'
                  as='select'
                  onChange={e => setAmount100(e.target.value)}
                >
                  <option value=''>0</option>
                  <option value={1}>× 1</option>
                  <option value={2}>× 2</option>
                  <option value={3}>× 3</option>
                  <option value={4}>× 4</option>
                  <option value={5}>× 5</option>
                </Form.Control>
              </InputGroup>
              <Form.Text>
                Plus a postcard, a 20% off Birthday cake voucher and a R&amp;R
                Eco tote bag
              </Form.Text>
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
                  Mail to an address in NL (+{" "}
                  {currency.short(data.giftCardShipping.priceWhole)})
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

export default GiftCard
