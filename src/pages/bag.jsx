import React, { useContext } from 'react'
import { Button, Col, Form, InputGroup, Row, Spinner } from 'react-bootstrap'
import ReactDatePicker from 'react-datepicker'
import { addDays } from 'date-fns'
import 'react-datepicker/dist/react-datepicker.css'
import { Link } from 'gatsby'
import Img from 'gatsby-image'
import { Controller, useForm } from 'react-hook-form'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTimes } from '@fortawesome/free-solid-svg-icons'
import { faStripe, faIdeal } from '@fortawesome/free-brands-svg-icons'
import { find, sumBy } from 'lodash'
import ReCAPTCHA from 'react-google-recaptcha'
import { loadStripe } from '@stripe/stripe-js'
import { checkout } from '../api/checkout'

import Layout from '../layouts/layout'
import { ContextBag } from '../layouts/context-bag'
import * as currency from '../components/utils/currency'

import * as Sentry from '@sentry/browser'
Sentry.init({ dsn: process.env.GATSBY_SENTRY_DSN })

const BagList = (things, dispatch) => {
  return things.map(thing => (
    <Row key={thing.hash} className='bag-item'>
      <Col xs={5}>
        <Img fluid={thing.image.fluid} />
      </Col>
      <Col xs={7}>
        <h4>
          {thing.customizationBirthdayCake
            ? `Birthday cake style ${thing.name}`
            : thing.name}
        </h4>
        <div className='item-details'>
          {thing.typeAAmount ? (
            <p>
              {thing.typeAAmount} {thing.typeAUnit.typeUnit} ×{' '}
              {currency.full(thing.typeAPrice)}
            </p>
          ) : null}
          {thing.typeBAmount ? (
            <p>
              {thing.typeBAmount} {thing.typeBUnit.typeUnit} ×{' '}
              {currency.full(thing.typeBPrice)}
            </p>
          ) : null}
          {thing.typeCAmount ? (
            <p>
              {thing.typeCAmount} {thing.typeCUnit.typeUnit} ×{' '}
              {currency.full(thing.typeCPrice)}
            </p>
          ) : null}
          {thing.customizationBirthdayCake &&
            Object.keys(thing.customizationBirthdayCake).map(k => {
              return (
                <p key={k}>{`${k}: ${thing.customizationBirthdayCake[k]}`}</p>
              )
            })}
          {thing.customizationShipping ? (
            <p>
              1 Shipping {thing.customizationShipping.name} ×{' '}
              {currency.full(thing.customizationShipping.price)}
            </p>
          ) : null}
          <br />
          Total:{' '}
          {currency.full(
            (thing.typeAAmount ? thing.typeAAmount * thing.typeAPrice : 0) +
              (thing.typeBAmount ? thing.typeBAmount * thing.typeBPrice : 0) +
              (thing.typeCAmount ? thing.typeCAmount * thing.typeCPrice : 0) +
              (thing.customizationShipping
                ? thing.customizationShipping.price
                : 0)
          )}
        </div>
        <Button
          variant='rar-reverse'
          name='remove'
          onClick={e =>
            dispatch({
              type: 'remove',
              data: {
                type: thing.type,
                hash: thing.hash
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
  const { control, formState, handleSubmit, register } = useForm()
  const recaptchaRef = React.createRef()

  let amountTotal = 0
  for (const type in state.bag.things) {
    for (const item of state.bag.things[type]) {
      amountTotal =
        amountTotal +
        (item.typeAAmount ? item.typeAAmount * item.typeAPrice : 0) +
        (item.typeBAmount ? item.typeBAmount * item.typeBPrice : 0) +
        (item.typeCAmount ? item.typeCAmount * item.typeCPrice : 0) +
        (item.customizationShipping ? item.customizationShipping.price : 0)
    }
  }

  const needPickup = state.bag.things.cake && state.bag.things.cake.length > 0
  const hasBirthdayCake =
    state.bag.things.cake &&
    state.bag.things.cake.filter(f => f.customizationBirthdayCake).length > 0
  const excludeDates = []
  for (let i = 0; i < 31; i++) {
    const weekday = new Date(2021, 10, i).getDay()
    if (weekday === 1 || weekday === 2) {
      excludeDates.push(new Date(2021, 10, i))
    }
  }
  for (let i = 0; i < 25; i++) {
    const weekday = new Date(2021, 11, i).getDay()
    if (weekday === 1 || weekday === 2) {
      excludeDates.push(new Date(2021, 11, i))
    }
  }

  const userVerified = async token => {
    handleSubmit(data => formSubmit(data, token))()
  }
  const formSubmit = async (d, t) => {
    const customer = { email: d.email }
    const items = []
    const metadata = {
      'Phone number': d.phone,
      'Gift card number': 'IPG000NU-' + d.giftcardnum
    }
    if (needPickup) {
      metadata['Pick-up date'] = d.date.toLocaleString('en-GB', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    }
    needPickup && (metadata['Notes'] = d.notes)
    if (hasBirthdayCake) {
      metadata['Birthday cake voucher'] = d.voucher
    }
    const url = {
      success: window.location.origin + '/thank-you',
      cancel: window.location.origin + '/bag'
    }
    const shipping =
      (find(state.bag.things.others, [
        'contentful_id',
        '44AIXbCxKgKAkDr2366hZ2'
      ]) !== undefined
        ? true
        : false) ||
      state.bag.things.cake.filter(
        cake =>
          cake.customizationShipping && cake.customizationShipping.price > 0
      ).length > 0

    for (const type of Object.keys(state.bag.things)) {
      for (const thing of state.bag.things[type]) {
        let birthdayCakeName = `Birthday cake style ${thing.name} `
        if (thing.customizationBirthdayCake) {
          for (const bType in thing.customizationBirthdayCake) {
            birthdayCakeName =
              birthdayCakeName +
              '| ' +
              bType +
              ': ' +
              thing.customizationBirthdayCake[bType] +
              ' '
          }
        }
        thing.typeAAmount > 0 &&
          items.push({
            type: 'A',
            contentful_id: thing.contentful_id,
            name: thing.customizationBirthdayCake
              ? `${birthdayCakeName} | Size: ${thing.typeAUnit.typeUnit}`
              : `${thing.name} | ${thing.typeAUnit.typeUnit}`,
            amount: thing.typeAPrice,
            quantity: parseInt(thing.typeAAmount),
            images: ['https:' + thing.image.fluid.src]
          })
        thing.typeBAmount > 0 &&
          items.push({
            type: 'B',
            contentful_id: thing.contentful_id,
            name: thing.customizationBirthdayCake
              ? `${birthdayCakeName} | Size: ${thing.typeBUnit.typeUnit}`
              : `${thing.name} | ${thing.typeBUnit.typeUnit}`,
            amount: thing.typeBPrice,
            quantity: parseInt(thing.typeBAmount),
            images: ['https:' + thing.image.fluid.src]
          })
        thing.typeCAmount > 0 &&
          items.push({
            type: 'C',
            contentful_id: thing.contentful_id,
            name: thing.customizationBirthdayCake
              ? `${birthdayCakeName} | Size: ${thing.typeCUnit.typeUnit}`
              : `${thing.name} | ${thing.typeCUnit.typeUnit}`,
            amount: thing.typeCPrice,
            quantity: parseInt(thing.typeCAmount),
            images: ['https:' + thing.image.fluid.src]
          })
        thing.customizationShipping &&
          thing.customizationShipping.price > 0 &&
          items.push({
            type: 'Shipping',
            contentful_id: thing.customizationShipping.contentful_id,
            name: `${thing.name} Shipping | ${thing.customizationShipping.name}`,
            amount: thing.customizationShipping.price,
            quantity: 1
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
        return false
      }
    } else {
      return false
    }
  }
  const onSubmit = async e => {
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
      SEOkeywords={['Shopping Bag', 'Rotterdam']}
      wider
    >
      <h1>My Bag</h1>
      {sumBy(Object.keys(state.bag.things), k => state.bag.things[k].length) !==
      0 ? (
        <Row>
          <Col md={7}>
            <h2>Overview</h2>
            <Row className='mb-3'>
              <Col xs={5}>Transaction fee:</Col>
              <Col xs={7}>{currency.full(0.3)}</Col>
            </Row>
            {Object.keys(state.bag.things).map(key =>
              BagList(state.bag.things[key], dispatch)
            )}
          </Col>
          <Col md={5}>
            <h2>Summary</h2>
            <p>
              <strong>Total: {currency.full(amountTotal + 0.3)}</strong>
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
                <>
                  <Form.Group>
                    <Form.Label>Cakes pick-up date:</Form.Label>
                    <Controller
                      name='date'
                      control={control}
                      rules={{ required: true }}
                      render={props => (
                        <ReactDatePicker
                          required
                          customInput={<Form.Control type='text' />}
                          minDate={
                            new Date().getUTCHours() > 7
                              ? addDays(new Date(), 3)
                              : addDays(new Date(), 2)
                          }
                          maxDate={new Date(2021, 11, 25)}
                          dateFormat='yyyy - MM - dd'
                          excludeDates={excludeDates}
                          onChange={e => props.onChange(e)}
                          selected={props.value}
                        />
                      )}
                    />
                    <Form.Text className='text-muted'>
                      Pick up hours: 12:00 - 17:00
                    </Form.Text>
                    <Form.Text className='text-muted'>
                      We support min +2 days pick-up. If you have urgent order,
                      you can always drop by our shop to buy our daily cakes.
                      See <Link to='/'>opening hours</Link>.
                    </Form.Text>
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
              <Form.Label>Gift card number:</Form.Label>
              <InputGroup className='mb-3'>
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
              <Form.Group className='mb-3' controlId='formBasicCheckbox'>
                <Form.Check
                  type='checkbox'
                  label='I have read and understood the cancellation policy:'
                  required
                  ref={register}
                />
                <Form.Text>
                  <p className='cancellation'>
                    Orders have to be collected on your selected date and within
                    the opening hours.
                  </p>
                  <p className='cancellation'>
                    We cannot issue a refund or exchange for any uncollected
                    cakes.
                  </p>
                  <p className='cancellation'>
                    Orders CANNOT be exchanged, canceled or refunded after 48
                    hours before 11:00 am of the collection day.
                  </p>
                </Form.Text>
              </Form.Group>
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
                  (formState.submitCount > 0 && 'Retry') ||
                  'Checkout'}
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
            to='/cakes-and-sweets'
            style={{ marginLeft: 'auto', marginRight: 'auto' }}
          >
            Take a look at our online cake ordering?
          </Link>
        </h3>
      )}
    </Layout>
  )
}

export default Bag
