import React, { useContext, useState } from "react"
import { Button, Col, Form, Row, Spinner } from "react-bootstrap"
import DatePicker from "react-datepicker"
import addDays from "date-fns/addDays"
import "react-datepicker/dist/react-datepicker.css"
import { Link } from "gatsby"
import Img from "gatsby-image"
import { useForm } from "react-hook-form"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faTimes } from "@fortawesome/free-solid-svg-icons"
import {
  faStripe,
  faIdeal,
  faApplePay
} from "@fortawesome/free-brands-svg-icons"
import { find, sumBy } from "lodash"
import ReCAPTCHA from "react-google-recaptcha"
import { loadStripe } from "@stripe/stripe-js"
import { checkout } from "../api/checkout"

import Layout from "../layouts/layout"
import { ContextBag } from "../layouts/context-bag"
import * as currency from "../components/utils/currency"

const BagList = (things, dispatch) => {
  return things.map(thing => (
    <Row key={thing.contentful_id} className='mb-3 bag-item'>
      <Col xs={5}>
        <Img fluid={thing.image.fluid} />
      </Col>
      <Col xs={7}>
        <h4>{thing.name}</h4>
        <p style={{ fontSize: "0.8em" }}>
          {thing.amountPiece > 0 && thing.pricePiece > 0 && (
            <>
              {thing.amountPiece} Piece × {currency.full(thing.pricePiece)}
            </>
          )}
          {thing.amountWhole > 0 && thing.priceWhole > 0 && (
            <>
              {thing.amountWhole} {thing.wholeIdentity} ×{" "}
              {currency.full(thing.priceWhole)}
            </>
          )}
          <br />
          <br />
          Total:{" "}
          {currency.full(
            thing.amountPiece
              ? thing.amountPiece * thing.pricePiece
              : 0 + thing.amountWhole
              ? thing.amountWhole * thing.priceWhole
              : 0
          )}
        </p>
        <Button
          variant='outline-dark'
          name='remove'
          value={thing.contentful_id}
          onClick={e =>
            dispatch({
              type: "remove",
              data: {
                type: thing.type,
                contentful_id: e.target.value
              }
            })
          }
        >
          <FontAwesomeIcon icon={faTimes} />
        </Button>
      </Col>
    </Row>
  ))
}

const Bag = () => {
  const stripePromise = loadStripe(process.env.GATSBY_STRIPE_PUBLIC_KEY)
  const { state, dispatch } = useContext(ContextBag)
  const { formState, handleSubmit, register } = useForm()
  const [pickupDate, setPickupDate] = useState(
    addDays(new Date(), new Date().getUTCHours() > 14 ? 2 : 1)
  )
  const recaptchaRef = React.createRef()

  let amountTotal = 0
  for (const type in state.bag.things) {
    amountTotal =
      amountTotal +
      sumBy(state.bag.things[type], o =>
        o.amountPiece > 0
          ? o.amountPiece * o.pricePiece
          : 0 + o.amountWhole > 0
          ? o.amountWhole * o.priceWhole
          : 0
      )
  }

  const needPickup = state.bag.things.food && state.bag.things.food.length > 0
  const excludeDates = []
  for (let i = 1; i < 22; i++) {
    const weekday = addDays(new Date(), i).getDay()
    if (weekday === 1 || weekday === 2) {
      excludeDates.push(addDays(new Date(), i))
    }
  }

  const userVerified = async token => {
    handleSubmit(data => formSubmit(data, token))()
  }
  const formSubmit = async (d, t) => {
    const customer = { email: d.email }
    const items = []
    const metadata = {
      phone: d.phone
    }
    needPickup &&
      (metadata.pickupDate = pickupDate.toLocaleString("en-GB", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric"
      }))
    const url = {
      success: window.location.origin + "/thank-you",
      cancel: window.location.origin + "/bag"
    }
    const shipping =
      find(state.bag.things.none_food, [
        "contentful_id",
        "44AIXbCxKgKAkDr2366hZ2"
      ]) !== undefined
        ? true
        : false

    for (const type of Object.keys(state.bag.things)) {
      for (const thing of state.bag.things[type]) {
        thing.amountPiece > 0 &&
          items.push({
            type: "Piece",
            contentful_id: thing.contentful_id,
            amount: thing.pricePiece,
            quantity: parseInt(thing.amountPiece),
            images: ["https:" + thing.image.fluid.src]
          })
        thing.amountWhole > 0 &&
          items.push({
            type: "Whole",
            contentful_id: thing.contentful_id,
            amount: thing.priceWhole,
            quantity: parseInt(thing.amountWhole),
            images: ["https:" + thing.image.fluid.src],
            wholeIdentity: thing.wholeIdentity
          })
      }
    }

    const res = await checkout(t, customer, items, metadata, url, shipping)
    if (res.sessionId) {
      const stripe = await stripePromise
      const { error } = await stripe.redirectToCheckout({
        sessionId: res.sessionId
      })
      if (error) {
        recaptchaRef.current.reset()
        return false
      }
    } else {
      recaptchaRef.current.reset()
      return false
    }
  }
  const onSubmit = async e => {
    e.preventDefault()
    if (amountTotal === 0) {
      return false
    }
    recaptchaRef.current.execute()
  }

  return (
    <Layout
      name='bag'
      SEOtitle='Bag'
      SEOkeywords={["Shopping Bag", "Rotterdam"]}
    >
      <h1>My Bag</h1>
      {sumBy(Object.keys(state.bag.things), k => state.bag.things[k].length) !==
      0 ? (
        <Row>
          <Col md={8}>
            <h2>Overview</h2>
            {Object.keys(state.bag.things).map(key =>
              BagList(state.bag.things[key], dispatch)
            )}
          </Col>
          <Col md={4}>
            <h2>Summary</h2>
            <p>
              <strong>Total: {currency.full(amountTotal)}</strong>
            </p>
            <Form onSubmit={e => onSubmit(e)} className='mb-3 checkout'>
              <Form.Group>
                <Form.Label>Email:</Form.Label>
                <Form.Control
                  name='email'
                  type='email'
                  required
                  placeholder='me@example.com'
                  ref={register}
                />
              </Form.Group>
              <Form.Group>
                <Form.Label>Phone:</Form.Label>
                <Form.Control
                  name='phone'
                  type='tel'
                  required
                  pattern='06\d{8}'
                  placeholder='0612345678'
                  ref={register}
                />
              </Form.Group>
              {needPickup && (
                <Form.Group>
                  <Form.Label>Cakes pick-up date:</Form.Label>
                  <DatePicker
                    onChange={date => setPickupDate(date)}
                    selected={pickupDate}
                    customInput={<Form.Control type='text' />}
                    dateFormat='yyyy - MM - dd'
                    minDate={addDays(
                      new Date(),
                      new Date().getUTCHours() > 14 ? 2 : 1
                    )}
                    maxDate={addDays(new Date(), 21)}
                    excludeDates={excludeDates}
                  />
                  <Form.Text className='text-muted'>
                    We support at least +1 day pick-up when ordered before 4pm.
                  </Form.Text>
                </Form.Group>
              )}
              <Button type='submit' disabled={formState.isSubmitting}>
                {(formState.isSubmitting && (
                  <Spinner
                    as='span'
                    animation='border'
                    size='sm'
                    role='status'
                    aria-hidden='true'
                  />
                )) ||
                  (formState.submitCount > 0 && "Retry") ||
                  "Checkout"}
              </Button>
            </Form>
            <p>
              Payment provided by
              <br />
              <FontAwesomeIcon icon={faStripe} size='3x' />
              <br />
              We support
              <br />
              <FontAwesomeIcon icon={faIdeal} size='3x' />{" "}
              <FontAwesomeIcon icon={faApplePay} size='3x' />
            </p>
            <ReCAPTCHA
              ref={recaptchaRef}
              size='invisible'
              badge='inline'
              sitekey={process.env.GATSBY_RECAPTCHA_PUBLIC_KEY}
              onChange={userVerified}
            />
          </Col>
        </Row>
      ) : (
        <h3 className='text-center mt-3'>
          <Link
            to='/order-cakes'
            style={{ marginLeft: "auto", marginRight: "auto" }}
          >
            Take a look at our online cake ordering?
          </Link>
        </h3>
      )}
    </Layout>
  )
}

export default Bag
