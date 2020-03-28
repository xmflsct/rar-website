import React, { useState } from "react"
import { useStaticQuery, graphql } from "gatsby"
import Img from "gatsby-image"
import { Button, Col, Figure, Form, InputGroup, Row } from "react-bootstrap"
import { useForm, Controller } from "react-hook-form"
import Reaptcha from "reaptcha"
import { loadStripe } from "@stripe/stripe-js"
import { checkout } from "../components/api/checkout"

import Layout from "../components/layout"

const GiftCard = ({ location }) => {
  const data = useStaticQuery(graphql`
    {
      giftCard20: contentfulWebshopItem(sku: { eq: "gift-card-20" }) {
        name
        sku
        priceOriginal
      }
      giftCard50: contentfulWebshopItem(sku: { eq: "gift-card-50" }) {
        name
        sku
        priceOriginal
      }
      giftCard100: contentfulWebshopItem(sku: { eq: "gift-card-100" }) {
        name
        sku
        priceOriginal
      }
      images: allFile(
        filter: { relativeDirectory: { regex: "/(gift-card)/" } }
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
      paymentStripe: file(name: { eq: "payment-stripe" }) {
        childImageSharp {
          fixed(height: 38) {
            ...GatsbyImageSharpFixed_withWebp
          }
        }
        name
      }
      paymentiDEAL: file(name: { eq: "payment-iDEAL" }) {
        childImageSharp {
          fixed(height: 38) {
            ...GatsbyImageSharpFixed_withWebp
          }
        }
        name
      }
    }
  `)
  const stripePromise = loadStripe("pk_test_zeXIOyCPled3HXSt7ZHA02dF00QsL1i5hd")
  const { control, formState, register, handleSubmit } = useForm()
  const [amount20, setAmount20] = useState(0)
  const [amount50, setAmount50] = useState(0)
  const [amount100, setAmount100] = useState(0)
  const [amountTotal, setAmountTotal] = useState(0)
  const [recaptcha, setRecaptcha] = useState(null)

  const onChangeAmount = e => {
    switch (e.target.name) {
      case "option20":
        setAmount20(e.target.value * (data.giftCard20.priceOriginal / 100))
        setAmountTotal(
          e.target.value * (data.giftCard20.priceOriginal / 100) +
            amount50 +
            amount100
        )
        break
      case "option50":
        setAmount50(e.target.value * (data.giftCard50.priceOriginal / 100))
        setAmountTotal(
          amount20 +
            e.target.value * (data.giftCard50.priceOriginal / 100) +
            amount100
        )
        break
      case "option100":
        setAmount100(e.target.value * (data.giftCard100.priceOriginal / 100))
        setAmountTotal(
          amount20 +
            amount50 +
            e.target.value * (data.giftCard100.priceOriginal / 100)
        )
        break
      default:
        break
    }
  }

  const onVerify = () => {
    handleSubmit(formSubmit)()
  }

  const formSubmit = async d => {
    const customer = { email: d.email }
    const items = []
    d.option20 &&
      items.push({
        name: data.giftCard20.name,
        amount: data.giftCard20.priceOriginal,
        currency: "eur",
        quantity: parseInt(d.option20),
        description: data.giftCard20.sku
      })
    d.option50 &&
      items.push({
        name: data.giftCard50.name,
        amount: data.giftCard50.priceOriginal,
        currency: "eur",
        quantity: parseInt(d.option50),
        description: data.giftCard50.sku
      })
    d.option100 &&
      items.push({
        name: data.giftCard100.name,
        amount: data.giftCard100.priceOriginal,
        currency: "eur",
        quantity: parseInt(d.option100),
        description: data.giftCard100.sku
      })
    const metadata = {
      name: d.name,
      phone: d.phone,
      notes: d.notes
    }
    const url = {
      success: window.location.origin + "/checkout/success",
      cancel: window.location.origin + "/gift-card"
    }
    const res = await checkout(
      await recaptcha.getResponse(),
      customer,
      items,
      metadata,
      url,
      d.delivery === "mail"
    )
    if (res.sessionId) {
      const stripe = await stripePromise
      const { error } = await stripe.redirectToCheckout({
        sessionId: res.sessionId
      })
      if (error) {
        return false
      }
    }
  }

  const onSubmit = async e => {
    e.preventDefault()
    if (amountTotal === 0) {
      return false
    }
    recaptcha.reset()
    recaptcha.execute()
  }

  return (
    <Layout
      location={location}
      name='Gift Card'
      SEOtitle='Gift Card'
      SEOkeywords={["Gift Card", "Gift", "Card", "Rotterdam"]}
    >
      <h3 className='sub-heading mb-3' id='matcha-lovers'>
        Buy Round&amp;Round Gift Card
      </h3>
      <h5 className='mb-3 color-matcha'>
        Support our little shop during Corona Crisis
      </h5>
      <p className='color-matcha'>
        Many local small businesses are affected by Corona outbreak including
        Round&amp;Round. Please support us by purchasing a gift card for later
        use. In this period we will offer special voucher and gifts for you.
      </p>
      <Row className='justify-content-md-center mb-3'>
        <Col lg={8}>
          <Img fluid={data.images.nodes[0].childImageSharp.fluid} />
        </Col>
      </Row>
      <h5 className='mb-3'>About Gift Card</h5>
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
      <h5 className='mb-3'>Details</h5>
      <ul>
        <li>
          We have 3 different values of gift card: €{" "}
          {data.giftCard20.priceOriginal / 100}/
          {data.giftCard50.priceOriginal / 100}/
          {data.giftCard100.priceOriginal / 100}.
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
      <h5 className='mb-3'>Order Online</h5>
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
        <Form.Text as='p'>
          Please choose the gift cards you would like to buy:
        </Form.Text>
        <Form.Row>
          <Form.Group as={Col} lg={4}>
            <Form.Label>{data.giftCard20.name}</Form.Label>
            <Form.Text>
              Plus a postcard and a 10% off Birthday cake voucher
            </Form.Text>
            <InputGroup>
              <InputGroup.Prepend>
                <InputGroup.Text>
                  € {data.giftCard20.priceOriginal / 100}
                </InputGroup.Text>
              </InputGroup.Prepend>
              <Form.Control
                name='option20'
                as='select'
                onChange={e => onChangeAmount(e)}
                ref={register}
                required={amountTotal === 0}
              >
                <option value=''>0</option>
                <option value={1}>× 1</option>
                <option value={2}>× 2</option>
                <option value={3}>× 3</option>
                <option value={4}>× 4</option>
                <option value={5}>× 5</option>
              </Form.Control>
            </InputGroup>
          </Form.Group>
          <Form.Group as={Col} lg={4}>
            <Form.Label>{data.giftCard50.name}</Form.Label>
            <Form.Text>
              Plus a postcard and a 20% off Birthday cake voucher
            </Form.Text>
            <InputGroup>
              <InputGroup.Prepend>
                <InputGroup.Text>
                  € {data.giftCard50.priceOriginal / 100}
                </InputGroup.Text>
              </InputGroup.Prepend>
              <Form.Control
                name='option50'
                as='select'
                onChange={e => onChangeAmount(e)}
                ref={register}
                required={amountTotal === 0}
              >
                <option value=''>0</option>
                <option value={1}>× 1</option>
                <option value={2}>× 2</option>
                <option value={3}>× 3</option>
                <option value={4}>× 4</option>
                <option value={5}>× 5</option>
              </Form.Control>
            </InputGroup>
          </Form.Group>
          <Form.Group as={Col} lg={4}>
            <Form.Label>{data.giftCard100.name}</Form.Label>
            <Form.Text>
              Plus a postcard, a 10% off Birthday cake voucher and a R&amp;R
              tote bag
            </Form.Text>
            <InputGroup>
              <InputGroup.Prepend>
                <InputGroup.Text>
                  € {data.giftCard100.priceOriginal / 100}
                </InputGroup.Text>
              </InputGroup.Prepend>
              <Form.Control
                name='option100'
                as='select'
                onChange={e => onChangeAmount(e)}
                ref={register}
                required={amountTotal === 0}
              >
                <option value=''>0</option>
                <option value={1}>× 1</option>
                <option value={2}>× 2</option>
                <option value={3}>× 3</option>
                <option value={4}>× 4</option>
                <option value={5}>× 5</option>
              </Form.Control>
            </InputGroup>
          </Form.Group>
        </Form.Row>
        <Form.Text as='p'>
          Please choose how would you like to collect them:
        </Form.Text>
        <Form.Group>
          <InputGroup className='mb-3'>
            <InputGroup.Prepend>
              <Controller
                as={<InputGroup.Radio />}
                name='delivery'
                value='pickup'
                valueName='label'
                required
                control={control}
              />
            </InputGroup.Prepend>
            <InputGroup.Text>Pickup at our shop</InputGroup.Text>
          </InputGroup>
          <InputGroup className='mb-3'>
            <InputGroup.Prepend>
              <Controller
                as={<InputGroup.Radio value='test2' />}
                name='delivery'
                value='mail'
                valueName='label'
                required
                control={control}
              />
            </InputGroup.Prepend>
            <InputGroup.Text>
              Mail to a postal address in NL
              <br />
              (add address during checkout)
            </InputGroup.Text>
          </InputGroup>
        </Form.Group>
        <Form.Text as='p'>We would need your contact information:</Form.Text>
        <Form.Group>
          <Form.Row>
            <Col lg={6}>
              <InputGroup className='mb-3'>
                <InputGroup.Prepend>
                  <InputGroup.Text>Name</InputGroup.Text>
                </InputGroup.Prepend>
                <Form.Control name='name' type='text' required ref={register} />
              </InputGroup>
            </Col>
            <Col lg={6}>
              <InputGroup className='mb-3'>
                <InputGroup.Prepend>
                  <InputGroup.Text>Email</InputGroup.Text>
                </InputGroup.Prepend>
                <Form.Control
                  name='email'
                  type='email'
                  required
                  ref={register}
                />
              </InputGroup>
            </Col>
            <Col lg={6}>
              <InputGroup className='mb-3'>
                <InputGroup.Prepend>
                  <InputGroup.Text>Phone</InputGroup.Text>
                </InputGroup.Prepend>
                <Form.Control
                  name='phone'
                  type='tel'
                  pattern='06\d{8}'
                  placeholder='0612345678'
                  required
                  ref={register}
                />
              </InputGroup>
            </Col>
          </Form.Row>
          <Form.Row>
            <Col>
              <InputGroup>
                <InputGroup.Prepend>
                  <InputGroup.Text>Notes</InputGroup.Text>
                </InputGroup.Prepend>
                <Form.Control name='notes' as='textarea' ref={register} />
              </InputGroup>
            </Col>
          </Form.Row>
        </Form.Group>
        <Form.Text as='p'>We would need your contact information:</Form.Text>
        <InputGroup className='mb-3'>
          <InputGroup.Prepend>
            <InputGroup.Text>Total</InputGroup.Text>
          </InputGroup.Prepend>
          <InputGroup.Text>
            € {amountTotal} = € {data.giftCard20.priceOriginal / 100} ×{" "}
            {amount20 / 20} + € {data.giftCard50.priceOriginal / 100} ×{" "}
            {amount50 / 50} + € {data.giftCard100.priceOriginal / 100} ×{" "}
            {amount100 / 100}
          </InputGroup.Text>
        </InputGroup>
        <Button
          type='submit'
          disabled={formState.isSubmitting}
          className='mb-3'
        >
          {(formState.isSubmitting && "Connecting") ||
            (formState.submitCount !== 0 && "Retry") ||
            "Buy now"}
        </Button>
        <Form.Row className='mb-2'>
          <Col>
            <a
              href='https://stripe.com/'
              target='_blank'
              rel='noopener noreferrer'
            >
              <Img fixed={data.paymentStripe.childImageSharp.fixed} />
            </a>{" "}
            <a
              href='https://www.ideal.nl/'
              target='_blank'
              rel='noopener noreferrer'
            >
              <Img fixed={data.paymentiDEAL.childImageSharp.fixed} />
            </a>
          </Col>
        </Form.Row>
        <Reaptcha
          ref={e => setRecaptcha(e)}
          sitekey='6Le85MYUAAAAAFIN9CKLxzyqnep4zJjeFxr4RpxU'
          onVerify={onVerify}
          size='invisible'
          badge='inline'
        />
      </Form>
    </Layout>
  )
}

export default GiftCard
