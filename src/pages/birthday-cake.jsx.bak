import React, { useContext, useState } from "react"
import { Button, Col, Form, Row } from "react-bootstrap"
import { useStaticQuery, graphql } from "gatsby"
import MD5 from "crypto-js/md5"
import { findIndex } from "lodash"

import Layout from "../layouts/layout"
import ListThings from "../components/list-things/list-things"
import * as currency from "../components/utils/currency"

import { ContextBag } from "../layouts/context-bag"

const TestTest = () => {
  const data = useStaticQuery(graphql`
    {
      cakes: contentfulCakesCakeList(
        contentful_id: { eq: "66kWq7G8iHCqpuE9VaQARa" }
      ) {
        cakes {
          contentful_id
          image {
            fluid(maxWidth: 400) {
              ...GatsbyContentfulFluid
            }
          }
          name
          pricePiece
          priceWhole
          availability
          description {
            json
          }
        }
      }
      size6: contentfulOrderBirthdayCake(
        contentful_id: { eq: "4RWDompbvVyKsfc9jUSZBn" }
      ) {
        contentful_id
        size
        price
      }
      size8: contentfulOrderBirthdayCake(
        contentful_id: { eq: "7s3VoiPHzZFInUlGCgcW7G" }
      ) {
        contentful_id
        size
        price
      }
      size10: contentfulOrderBirthdayCake(
        contentful_id: { eq: "3tFvNMUbxQXHNvaXfeLny5" }
      ) {
        contentful_id
        size
        price
      }
    }
  `)

  const { dispatch } = useContext(ContextBag)

  const [style, setStyle] = useState(null)
  const [size, setSize] = useState(null)
  const [base, setBase] = useState(null)
  const [filling, setFilling] = useState(null)
  const [chocotag, setChocotag] = useState(null)

  const onSubmit = (e) => {
    e.preventDefault()
    let price
    let contentful_id
    switch (size) {
      case "6″":
        price = data.size6.price
        contentful_id = data.size6.contentful_id
        break
      case "8″":
        price = data.size8.price
        contentful_id = data.size8.contentful_id
        break
      case "10″":
        price = data.size10.price
        contentful_id = data.size10.contentful_id
        break
      default:
        throw new Error()
    }
    dispatch({
      type: "add",
      data: {
        type: "food",
        hash: MD5(new Date().getTime() + contentful_id).toString(),
        birthday_cake: {
          Size: size,
          Base: base,
          Filling: filling,
          Chocotag: chocotag,
        },
        birthday_cake_contentful_id: contentful_id,
        name: `Birthday Cake Style ${style}`,
        amountWhole: 1,
        priceWhole: price,
        image:
          data.cakes.cakes[findIndex(data.cakes.cakes, ["name", style])].image,
      },
    })
  }

  return (
    <Layout
      name='cakes-list'
      SEOtitle='Birthday Cake'
      SEOkeywords={["Birthday cake", "Rotterdam"]}
    >
      <h1>Birthday Cakes</h1>

      <p>
        Our Birthday cakes are made of fresh ingredients. The chiffon cake base
        gives it a very soft texture. Based on the style below, you can choose
        your preferred cake base flavours and filling fruit. Please book 5 days
        in advance for certainty.
      </p>
      <p>
        * Due to current not-so-easy situation, we have to scale down the
        choices of our cake styles and adjust the prices. We are doing our best
        to keep the high quality of our cakes. We will keep this page updated
        with the latest styles that we can prepare.
      </p>

      <h2>Cake Sizes:</h2>
      <p>
        All the cakes below are available in <strong>3</strong> sizes.
        <br />
        Please understand that the final look of each size could be slightly
        different.
      </p>
      <ul>
        <li>6″ Cake ⌀ 15cm {currency.full(data.size6.price)}</li>
        <li>8″ Cake ⌀ 20cm {currency.full(data.size8.price)}</li>
        <li>10″ Cake ⌀ 25cm {currency.full(data.size10.price)}</li>
      </ul>
      <p>
        We offer pre-printed Happy Birthday Chocolate tag on the cake. If you
        want to put on your own message, it will be written by us on a same size
        paper tag. Please leave your message in the{" "}
        <strong>Pick-up Notes</strong> when you check out.
      </p>

      <h2>Styles Overview:</h2>
      <ListThings things={data.cakes.cakes} />

      <Form onSubmit={(e) => onSubmit(e)}>
        <Row>
          <Col md={6}>
            <Form.Group>
              <Form.Control
                name='style'
                as='select'
                defaultValue=''
                onChange={(e) => setStyle(e.target.value)}
                required
              >
                <option value='' disabled>
                  Style
                </option>
                <option value='No. 1'>Style: No. 1</option>
                <option value='No. 2'>Style: No. 2</option>
                <option value='No. 3'>Style: No. 3</option>
                <option value='No. 4'>Style: No. 4</option>
                <option value='No. 5'>Style: No. 5</option>
                <option value='No. 6'>Style: No. 6</option>
              </Form.Control>
            </Form.Group>
            <Form.Group>
              <Form.Control
                name='size'
                as='select'
                defaultValue=''
                onChange={(e) => setSize(e.target.value)}
                required
              >
                <option value='' disabled>
                  Size
                </option>
                <option value='6″'>Size: 6″</option>
                <option value='8″'>Size: 8″</option>
                <option value='10″'>Size: 10″</option>
              </Form.Control>
            </Form.Group>
            <Form.Group>
              <Form.Control
                name='base'
                as='select'
                defaultValue=''
                onChange={(e) => setBase(e.target.value)}
                required
              >
                <option value='' disabled>
                  Base
                </option>
                <option value='Vanilla'>Base: Vanilla</option>
                <option value='Matcha'>Base: Matcha</option>
                <option value='Cacao'>Base: Cacao</option>
              </Form.Control>
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group>
              <Form.Control
                name='filling'
                as='select'
                defaultValue=''
                onChange={(e) => setFilling(e.target.value)}
                required
              >
                <option value='' disabled>
                  Filling
                </option>
                <option value='Mango'>Filling: Mango</option>
                <option value='Peach'>Filling: Peach</option>
                <option value='Lychee'>Filling: Lychee</option>
                <option value='Strawberry &amp; Raspberry Mix'>
                  Filling: Strawberry &amp; Raspberry Mix
                </option>
              </Form.Control>
            </Form.Group>
            <Form.Group>
              <Form.Control
                name='chocotag'
                as='select'
                defaultValue=''
                onChange={(e) => setChocotag(e.target.value)}
                required
              >
                <option value='' disabled>
                  Chocotag
                </option>
                <option value='Without "Happy Birthday"'>
                  Without "Happy Birthday" chocotag
                </option>
                <option value='With "Happy Birthday"'>
                  With "Happy Birthday" chocotag
                </option>
              </Form.Control>
            </Form.Group>
            <Button variant='rar' type='submit'>
              Add to bag
            </Button>
            <Form.Text className='text-muted'>
              *If you want to pick up on Wednesdays (14:00-16:00) please leave a
              note when you check out.
            </Form.Text>
          </Col>
        </Row>
      </Form>
    </Layout>
  )
}

export default TestTest
