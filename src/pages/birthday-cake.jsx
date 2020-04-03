import React, { useState } from "react"
import { Button, Col, Form, Row, Spinner } from "react-bootstrap"
import DatePicker from "react-datepicker"
import {
  addDays,
  getDate,
  getHours,
  getMinutes,
  getMonth,
  setHours,
  setMinutes
} from "date-fns"
import "react-datepicker/dist/react-datepicker.css"
import ReCAPTCHA from "react-google-recaptcha"
import { Controller, useForm } from "react-hook-form"
import { useStaticQuery, graphql } from "gatsby"

import Layout from "../layouts/layout"
import ListThings from "../components/list-things/list-things"
import * as currency from "../components/utils/currency"
import { emailOrder } from "../api/email-order"

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
    }
  `)
  const { control, formState, handleSubmit, register, setValue } = useForm()
  const [submitStatus, setSubmitStatus] = useState(false)
  const [minTime, setMinTime] = useState(
    setHours(setMinutes(new Date(), 0), 12)
  )
  const recaptchaRef = React.createRef()
  const excludeDates = []
  for (let i = new Date().getDate(); i < 31; i++) {
    const weekday = new Date(2020, 4, i).getDay()
    if (weekday === 0 || weekday === 1) {
      excludeDates.push(addDays(new Date(), i))
    }
  }

  const userVerified = async token => {
    handleSubmit(data => formSubmit(token, data))()
  }
  const formSubmit = async (t, d) => {
    d.date = getMonth(d.date) + 1 + " / " + getDate(d.date)
    d.time = getHours(d.time) + ":" + getMinutes(d.time)
    const res = await emailOrder(t, d)
    if (res.messageId) {
      setSubmitStatus(true)
    } else {
      setSubmitStatus(false)
    }
  }
  const onSubmit = async e => {
    e.preventDefault()
    formState.submitCount > 0 && recaptchaRef.current.reset()
    recaptchaRef.current.execute()
  }

  return (
    <Layout
      name='birthday-cake'
      SEOtitle='Birthday Cake'
      SEOkeywords={["Birthday cake", "Rotterdam"]}
    >
      <h1>Birthday Cakes</h1>

      <p>
        To reserve birthday cakes, please fill in the ordering form at the
        bottom of this page. Please book 5 days in advance for certainty.
      </p>
      <p>
        * Due to current not-so-easy situation, we have to scale down the
        choices of our cake styles. We will keep this page updated with the
        latest styles that we can prepare. :)
      </p>

      <h2>Cake Fruit Filling:</h2>
      <p>
        For all the styles, you can choose the filling fruits from:
        <br />
        mango, lychee, peach or strawberry&amp;raspberry mix
      </p>
      <p>
        * Because of unstable supply, we have to pause using fresh strawberry
        filling in this period. Instead you can choose our high quality frozen
        berry mix filling.
      </p>

      <h2>Cake Sizes:</h2>
      <p>
        All the cakes below are available in <strong>3</strong> sizes.
        <br />
        Please understand that the final look of each size would be slightly
        different.
      </p>
      <ul>
        <li>6'' Cake ⌀ 15cm {currency.full(19)}</li>
        <li>8'' Cake ⌀ 20cm {currency.full(28)}</li>
        <li>10'' Cake ⌀ 25cm {currency.full(37)}</li>
      </ul>

      <h2>Cake Base:</h2>
      <p className='mb-4'>
        Default: Vanilla Chiffon
        <br />
        Cacao/Matcha base is also possible (+ {currency.full(2)})
      </p>

      <ListThings things={data.cakes.cakes} />

      <h2>Place Order Now</h2>
      <Form onSubmit={e => onSubmit(e)}>
        <Row>
          <Col md={6}>
            <h3>Your info</h3>
            <Form.Group>
              <Form.Control
                name='name'
                type='text'
                placeholder='My Name'
                ref={register}
                required
              />
            </Form.Group>
            <Form.Group>
              <Form.Control
                name='email'
                type='email'
                placeholder='my@email.com'
                ref={register}
                required
              />
            </Form.Group>
            <Form.Group>
              <Form.Control
                name='phone'
                type='tel'
                pattern='06\d{8}'
                placeholder='0612345678'
                ref={register}
                required
              />
            </Form.Group>
            <h3>Pick-up options</h3>
            <Form.Group>
              <Controller
                name='date'
                as={<DatePicker />}
                control={control}
                valueName='selected'
                onChange={([selected]) => {
                  setValue("time", null)
                  if (selected.getDay() === 3) {
                    setMinTime(setHours(setMinutes(new Date(), 0), 14))
                  } else {
                    setMinTime(setHours(setMinutes(new Date(), 0), 12))
                  }
                  return selected
                }}
                customInput={<Form.Control type='text' />}
                minDate={addDays(new Date(), 5)}
                maxDate={new Date(2020, 3, 30)}
                dateFormat='yyyy - MM - dd'
                excludeDates={excludeDates}
                placeholderText='Date'
                required
              />
            </Form.Group>
            <Form.Group>
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
                minTime={minTime}
                maxTime={setHours(setMinutes(new Date(), 0), 16)}
                dateFormat='HH:mm'
                timeFormat='HH:mm'
                placeholderText='Time'
                required
              />
            </Form.Group>
          </Col>
          <Col md={6}>
            <h3>Customize your cake</h3>
            <Form.Group>
              <Form.Control name='style' as='select' ref={register} required>
                <option value='' selected disabled>
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
              <Form.Control name='size' as='select' ref={register} required>
                <option value='' selected disabled>
                  Size
                </option>
                <option value='6 inch'>Size: 6''</option>
                <option value='8 inch'>Size: 8''</option>
                <option value='10 inch'>Size: 10''</option>
              </Form.Control>
            </Form.Group>
            <Form.Group>
              <Form.Control name='base' as='select' ref={register} required>
                <option value='' selected disabled>
                  Base
                </option>
                <option value='Vanilla'>Base: Vanilla</option>
                <option value='Matcha'>Base: Matcha</option>
                <option value='Cacao'>Base: Cacao</option>
              </Form.Control>
            </Form.Group>
            <Form.Group>
              <Form.Control name='filling' as='select' ref={register} required>
                <option value='' selected disabled>
                  Filling
                </option>
                <option value='Mango'>Filling: Mango</option>
                <option value='Peach'>Filling: Peach</option>
                <option value='Lychee'>Filling: Lychee</option>
                <option value='Mix'>
                  Filling: Strawberry &amp; Raspberry Mix
                </option>
              </Form.Control>
            </Form.Group>
            <Form.Group>
              <Form.Control name='chocotag' as='select' ref={register} required>
                <option value='' selected disabled>
                  Chocotag
                </option>
                <option value='Without chocotag'>
                  Without "Happy Birthday" chocotag
                </option>
                <option value='With chocotag'>
                  With "Happy Birthday" chocotag
                </option>
              </Form.Control>
            </Form.Group>
          </Col>
          <Col md={6}>
            <h3>Notes</h3>
            <Form.Control
              name='notes'
              as='textarea'
              rows='3'
              className='mb-3'
              ref={register}
              placeholder='If without chocotag, do you want to have a message paper tag on the cake? Max 30 characters.'
            />
          </Col>
          <Col md={6}>
            <Button
              name='submit'
              variant='rar'
              type='submit'
              className='mb-2'
              disabled={formState.isSubmitting || submitStatus}
            >
              {formState.isSubmitting ? (
                <Spinner
                  as='span'
                  animation='border'
                  size='sm'
                  role='status'
                  aria-hidden='true'
                />
              ) : formState.submitCount > 0 ? (
                submitStatus ? (
                  "Thank you!"
                ) : (
                  "Retry"
                )
              ) : (
                "Send order to us"
              )}
            </Button>
            <small>
              * This is only an order request form. There won't be any
              auto-reply after your submission. We need time to confirm your
              order and we will get back to you very soon by email.
            </small>
            <ReCAPTCHA
              ref={recaptchaRef}
              size='invisible'
              badge='inline'
              sitekey={process.env.GATSBY_RECAPTCHA_PUBLIC_KEY}
              onChange={userVerified}
            />
          </Col>
        </Row>
      </Form>
    </Layout>
  )
}

export default TestTest
