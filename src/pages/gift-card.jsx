import React, { useContext, useState } from 'react'
import { Button, Col, Figure, Form, InputGroup, Row } from 'react-bootstrap'
import { useStaticQuery, graphql } from 'gatsby'
import Img from 'gatsby-image'
import MD5 from 'crypto-js/md5'

import Layout from '../layouts/layout'
import { ContextBag } from '../layouts/context-bag'
import * as currency from '../components/utils/currency'

const GiftCard = ({ location }) => {
  const data = useStaticQuery(graphql`
    {
      giftCard: contentfulCakesCake(
        contentful_id: { eq: "4FPZT9Es23MBaZ31gK0UIG" }
      ) {
        contentful_id
        name
        image {
          fluid(maxWidth: 200) {
            ...GatsbyContentfulFluid_withWebp
          }
        }
        typeAPrice
        typeAUnit {
          typeUnit
        }
        typeBPrice
        typeBUnit {
          typeUnit
        }
        typeCPrice
        typeCUnit {
          typeUnit
        }
        customizationShipping {
          contentful_id
          name
          price
        }
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

  const [typeASelected, setTypeASelected] = useState()
  const [typeBSelected, setTypeBSelected] = useState()
  const [typeCSelected, setTypeCSelected] = useState()
  const [customizationShipping, setCustomizationShipping] = useState({})

  const onSubmit = e => {
    e.preventDefault()
    console.log(customizationShipping)
    if (typeASelected) {
      dispatch({
        type: 'add',
        data: {
          hash: MD5(
            new Date().getTime() + data.giftCard.contentful_id
          ).toString(),
          contentful_id: data.giftCard.contentful_id,
          image: data.giftCard.image,
          name: data.giftCard.name,
          typeAPrice: data.giftCard.typeAPrice,
          typeAUnit: data.giftCard.typeAUnit,
          typeAAmount: parseInt(typeASelected),
          ...(data.giftCard.customizationShipping && {
            customizationShipping: customizationShipping
          })
        }
      })
    }
    if (typeBSelected) {
      dispatch({
        type: 'add',
        data: {
          hash: MD5(
            new Date().getTime() + data.giftCard.contentful_id
          ).toString(),
          contentful_id: data.giftCard.contentful_id,
          image: data.giftCard.image,
          name: data.giftCard.name,
          typeBPrice: data.giftCard.typeAPrice,
          typeBUnit: data.giftCard.typeAUnit,
          typeBAmount: parseInt(typeBSelected),
          ...(data.giftCard.customizationShipping && {
            customizationShipping: JSON.parse(customizationShipping)
          })
        }
      })
    }
    if (typeCSelected) {
      dispatch({
        type: 'add',
        data: {
          hash: MD5(
            new Date().getTime() + data.giftCard.contentful_id
          ).toString(),
          contentful_id: data.giftCard.contentful_id,
          image: data.giftCard.image,
          name: data.giftCard.name,
          typeCPrice: data.giftCard.typeAPrice,
          typeCUnit: data.giftCard.typeAUnit,
          typeCAmount: parseInt(typeCSelected),
          ...(data.giftCard.customizationShipping && {
            customizationShipping
          })
        }
      })
    }
  }

  return (
    <Layout
      location={location}
      name='Gift Card'
      SEOtitle='Gift Card'
      SEOkeywords={['Gift Card', 'Gift', 'Card', 'Rotterdam']}
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
          We have 3 different values of gift card: € {data.giftCard.typeAPrice}/
          {data.giftCard.typeBPrice}/{data.giftCard.typeCPrice}.
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
                  <InputGroup.Text>{data.giftCard.name} €20</InputGroup.Text>
                </InputGroup.Prepend>
                <Form.Control
                  name='option20'
                  as='select'
                  onChange={e => setTypeASelected(e.target.value)}
                >
                  <option value={0}>0</option>
                  <option value={1}>× 1</option>
                  <option value={2}>× 2</option>
                  <option value={3}>× 3</option>
                  <option value={4}>× 4</option>
                  <option value={5}>× 5</option>
                </Form.Control>
              </InputGroup>
              <Form.Text>Plus a postcard</Form.Text>
            </Form.Group>
            <Form.Group>
              <InputGroup>
                <InputGroup.Prepend>
                  <InputGroup.Text>{data.giftCard.name} €50</InputGroup.Text>
                </InputGroup.Prepend>
                <Form.Control
                  name='option50'
                  as='select'
                  onChange={e => setTypeBSelected(e.target.value)}
                >
                  <option value=''>0</option>
                  <option value={1}>× 1</option>
                  <option value={2}>× 2</option>
                  <option value={3}>× 3</option>
                  <option value={4}>× 4</option>
                  <option value={5}>× 5</option>
                </Form.Control>
              </InputGroup>
              <Form.Text>Plus a postcard</Form.Text>
            </Form.Group>
            <Form.Group>
              <InputGroup>
                <InputGroup.Prepend>
                  <InputGroup.Text>{data.giftCard.name} €100</InputGroup.Text>
                </InputGroup.Prepend>
                <Form.Control
                  name='option100'
                  as='select'
                  onChange={e => setTypeCSelected(e.target.value)}
                >
                  <option value=''>0</option>
                  <option value={1}>× 1</option>
                  <option value={2}>× 2</option>
                  <option value={3}>× 3</option>
                  <option value={4}>× 4</option>
                  <option value={5}>× 5</option>
                </Form.Control>
              </InputGroup>
              <Form.Text>Plus a postcard and a R&amp;R Eco tote bag</Form.Text>
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
                    onChange={() => setCustomizationShipping(null)}
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
                    onChange={() =>
                      setCustomizationShipping(
                        data.giftCard.customizationShipping[0]
                      )
                    }
                  />
                </InputGroup.Prepend>
                <InputGroup.Text>
                  Mail to an address in NL (+{' '}
                  {currency.short(data.giftCard.customizationShipping[0].price)}
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

export default GiftCard
