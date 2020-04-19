import React, { useContext } from "react"
import { Button, Col, Form, InputGroup, Row, Spinner } from "react-bootstrap"
import DatePicker from "react-datepicker"
import { addDays, setHours, setMinutes } from "date-fns"
import "react-datepicker/dist/react-datepicker.css"
import { Link } from "gatsby"
import Img from "gatsby-image"
import { Controller, useForm } from "react-hook-form"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faTimes } from "@fortawesome/free-solid-svg-icons"
import { faStripe, faIdeal } from "@fortawesome/free-brands-svg-icons"
import { find, sumBy } from "lodash"
import ReCAPTCHA from "react-google-recaptcha"
import { loadStripe } from "@stripe/stripe-js"
import { checkout } from "../api/checkout"

import Layout from "../layouts/layout"
import { ContextBag } from "../layouts/context-bag"
import * as currency from "../components/utils/currency"

const BagList = (things, dispatch) => {
  return things.map((thing) => (
    <Row key={thing.hash} className='mb-3 bag-item'>
      <Col xs={5}>
        <Img fluid={thing.image.fluid} />
      </Col>
      <Col xs={7}>
        <h4>{thing.name}</h4>
        <p style={{ fontSize: "0.8em" }}>
          {thing.birthday_cake &&
            Object.keys(thing.birthday_cake).map((k) => {
              return (
                <span key={k}>
                  {`${k}: ${thing.birthday_cake[k]}`} <br />
                </span>
              )
            })}
          {thing.amountPiece > 0 && thing.pricePiece > 0 && (
            <>
              {thing.amountPiece} Piece × {currency.full(thing.pricePiece)}
              <br />
            </>
          )}
          {!thing.birthday_cake &&
            thing.amountWhole > 0 &&
            thing.priceWhole > 0 && (
              <>
                {thing.amountWhole} {thing.wholeIdentity} ×{" "}
                {currency.full(thing.priceWhole)}
              </>
            )}
          <br />
          Total:{" "}
          {currency.full(
            (thing.amountPiece ? thing.amountPiece * thing.pricePiece : 0) +
              (thing.amountWhole ? thing.amountWhole * thing.priceWhole : 0)
          )}
        </p>
        <Button
          variant='rar-reverse'
          name='remove'
          onClick={(e) =>
            dispatch({
              type: "remove",
              data: {
                type: thing.type,
                hash: thing.hash,
              },
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
  const { control, formState, handleSubmit, register } = useForm()
  const recaptchaRef = React.createRef()

  let amountTotal = 0
  for (const type in state.bag.things) {
    for (const item of state.bag.things[type]) {
      amountTotal =
        amountTotal +
        (item.amountPiece ? item.amountPiece * item.pricePiece : 0) +
        (item.amountWhole ? item.amountWhole * item.priceWhole : 0)
    }
  }

  const needPickup = state.bag.things.food && state.bag.things.food.length > 0
  const hasBirthdayCake =
    state.bag.things.food &&
    state.bag.things.food.filter((f) => f.birthday_cake_contentful_id).length >
      0
  const excludeDates = []
  for (let i = 1; i < 31; i++) {
    const weekday = new Date(2020, 3, i).getDay()
    if (weekday === 1 || weekday === 2 || weekday === 3) {
      excludeDates.push(new Date(2020, 3, i))
    }
  }
  for (let i = 1; i < 31; i++) {
    const weekday = new Date(2020, 4, i).getDay()
    if (weekday === 1 || weekday === 2 || weekday === 3) {
      excludeDates.push(new Date(2020, 4, i))
    }
  }

  const userVerified = async (token) => {
    handleSubmit((data) => formSubmit(data, token))()
  }
  const formSubmit = async (d, t) => {
    const customer = { email: d.email }
    const items = []
    const metadata = {
      "Phone number": d.phone,
      "Gift card number": "IPG000NU-" + d.giftcardnum,
    }
    if (needPickup) {
      metadata["Pick-up date"] = d.date.toLocaleString("en-GB", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      })
      metadata["Pick-up time"] = d.time.toLocaleString("en-GB", {
        timeStyle: "medium",
      })
    }
    needPickup && (metadata["Notes"] = d.notes)
    if (hasBirthdayCake) {
      metadata["Birthday cake voucher"] = d.voucher
    }
    const url = {
      success: window.location.origin + "/thank-you",
      cancel: window.location.origin + "/bag",
    }
    const shipping =
      find(state.bag.things.none_food, [
        "contentful_id",
        "44AIXbCxKgKAkDr2366hZ2",
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
            images: ["https:" + thing.image.fluid.src],
          })
        !thing.birthday_cake &&
          thing.amountWhole > 0 &&
          items.push({
            type: "Whole",
            contentful_id: thing.contentful_id,
            amount: thing.priceWhole,
            quantity: parseInt(thing.amountWhole),
            images: ["https:" + thing.image.fluid.src],
            wholeIdentity: thing.wholeIdentity,
          })
        thing.birthday_cake &&
          items.push({
            type: "Birthday",
            name: thing.name,
            birthday_cake: thing.birthday_cake,
            contentful_id: thing.birthday_cake_contentful_id,
            amount: thing.priceWhole,
            quantity: 1,
            images: ["https:" + thing.image.fluid.src],
          })
      }
    }

    const res = await checkout(t, customer, items, metadata, url, shipping)
    if (res.sessionId) {
      const stripe = await stripePromise
      const { error } = await stripe.redirectToCheckout({
        sessionId: res.sessionId,
      })
      if (error) {
        return false
      }
    } else {
      return false
    }
  }
  const onSubmit = async (e) => {
    e.preventDefault()
    if (amountTotal === 0) {
      return false
    }
    formState.submitCount > 0 && recaptchaRef.current.reset()
    recaptchaRef.current.execute()
  }

  return (
    <Layout
      name='bag'
      SEOtitle='Bag'
      SEOkeywords={["Shopping Bag", "Rotterdam"]}
    >
      <h1>My Bag</h1>
      {sumBy(
        Object.keys(state.bag.things),
        (k) => state.bag.things[k].length
      ) !== 0 ? (
        <Row>
          <Col md={8}>
            <h2>Overview</h2>
            {Object.keys(state.bag.things).map((key) =>
              BagList(state.bag.things[key], dispatch)
            )}
          </Col>
          <Col md={4}>
            <h2>Summary</h2>
            <p>
              <strong>Total: {currency.full(amountTotal)}</strong>
            </p>
            <Form onSubmit={(e) => onSubmit(e)} className='mb-3 checkout'>
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
                <>
                  <Form.Group>
                    <Form.Label>Cakes pick-up date:</Form.Label>
                    <Controller
                      name='date'
                      as={<DatePicker />}
                      control={control}
                      valueName='selected'
                      customInput={<Form.Control type='text' />}
                      minDate={
                        new Date().getUTCHours() > 14
                          ? addDays(new Date(), 3)
                          : addDays(new Date(), 2)
                      }
                      maxDate={new Date(2020, 4, 31)}
                      dateFormat='yyyy - MM - dd'
                      excludeDates={excludeDates}
                      required
                    />
                    <Form.Text className='text-muted'>
                      We support +2 days pick-up. If you have urgent order, you
                      can always drop by our shop to buy our daily cakes. Note
                      we are closed Mon-Wed.
                    </Form.Text>
                  </Form.Group>
                  <Form.Group>
                    <Form.Label>Cakes pick-up time:</Form.Label>
                    <Controller
                      name='time'
                      as={<DatePicker />}
                      control={control}
                      valueName='selected'
                      onChange={([selected]) => selected}
                      customInput={<Form.Control type='text' />}
                      showTimeSelect
                      showTimeSelectOnly
                      timeIntervals={30}
                      timeCaption='Time'
                      minTime={setHours(setMinutes(new Date(), 0), 12)}
                      maxTime={setHours(setMinutes(new Date(), 0), 16)}
                      dateFormat='HH:mm'
                      timeFormat='HH:mm'
                      required
                    />
                  </Form.Group>
                  <Form.Group>
                    <Form.Label>Pick-up notes:</Form.Label>
                    <Form.Control
                      name='notes'
                      as='textarea'
                      rows='2'
                      ref={register}
                    />
                  </Form.Group>
                </>
              )}
              <InputGroup className='mb-3'>
                <Form.Label>Gift card number:</Form.Label>
                <InputGroup.Prepend>
                  <InputGroup.Text>IPG000NU</InputGroup.Text>
                </InputGroup.Prepend>
                <Form.Control
                  name='giftcardnum'
                  type='text'
                  placeholder='******'
                  ref={register}
                />
                <Form.Text className='text-muted'>
                  We will manually register your gift card's expense and refund
                  the corresponding amount to this payment.
                </Form.Text>
              </InputGroup>
              {hasBirthdayCake && (
                <Form.Group>
                  <Form.Label>Birthday cake voucher:</Form.Label>
                  <Form.Control name='voucher' type='text' ref={register} />
                  <Form.Text className='text-muted'>
                    We will manually validate your voucher code and refund the
                    corresponding amount to this payment.
                  </Form.Text>
                </Form.Group>
              )}
              <Button
                variant='rar'
                type='submit'
                disabled={formState.isSubmitting}
              >
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
              <FontAwesomeIcon icon={faIdeal} size='3x' />
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
