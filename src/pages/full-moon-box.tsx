import { graphql, useStaticQuery } from 'gatsby'
import Img from 'gatsby-image'
import React from 'react'
import { Button, Form } from 'react-bootstrap'
import { useForm } from 'react-hook-form'
import { loadStripe } from '@stripe/stripe-js'

import Layout from '../layouts/layout'
import { fullmoon } from '../api/fullmoon'

const FullMoonBox = () => {
  const data = useStaticQuery(graphql`
    query {
      image1: file(relativePath: { eq: "page-full-moon-box/01.jpeg" }) {
        childImageSharp {
          fluid(maxWidth: 600) {
            ...GatsbyImageSharpFluid_withWebp
          }
        }
      }
      image2: file(relativePath: { eq: "page-full-moon-box/02.jpeg" }) {
        childImageSharp {
          fluid(maxWidth: 600) {
            ...GatsbyImageSharpFluid_withWebp
          }
        }
      }
      image3: file(relativePath: { eq: "page-full-moon-box/03.jpeg" }) {
        childImageSharp {
          fluid(maxWidth: 600) {
            ...GatsbyImageSharpFluid_withWebp
          }
        }
      }
    }
  `)

  const stripePromise = loadStripe(process.env.GATSBY_STRIPE_PUBLIC_KEY)

  const { formState, handleSubmit, register, watch } = useForm()

  const onSubmit = async data => {
    const res = await fullmoon(data)
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
  const quantity = watch('quantity')

  return (
    <Layout
      name='Full Moon Box Shipping'
      SEOtitle='Full Moon Box Shipping'
      SEOkeywords={['Full moon', 'Rotterdam']}
    >
      <div className='fullmoon-images'>
        <Img className='mb-4' fluid={data.image1.childImageSharp.fluid} />
        <Img className='mb-4' fluid={data.image2.childImageSharp.fluid} />
      </div>
      <h1>Full Moon Box Shipping</h1>

      <p>Please read before ordering:</p>
      <ul>
        <li>
          Minimal order <strong>3</strong> boxes
        </li>
        <li>Shipping cost within NL: € 5</li>
        <li>Shipping schedule </li>
      </ul>
      <p>
        1st shipping date: September 9th [Expected arrival date 10th or 11th]
        <br />
        For orders that have been placed before September 7th
      </p>
      <p>
        2nd shipping date: September 16th [Expected arrival date 17th or 18th]
        <br />
        For orders that have been placed before September 14th
      </p>
      <p>Mooncake shelf life: 7 days from the shipping date</p>
      <hr />

      <h2>Full Moon Box</h2>
      <Img
        className='mb-4 fullmoon-image'
        fluid={data.image3.childImageSharp.fluid}
      />
      <p>€ 21,00/Box</p>
      <ul>
        <li>1 X Premium matcha &amp; Egg Yolk</li>
        <li>1 X Beetroot &amp; Taro</li>
        <li>1 X Hojicha &amp; Pineapple &amp; Egg Yolk</li>
        <li>1 X Classic Peanut &amp; Red beans</li>
        <li>2 X Orange Madeleine</li>
      </ul>
      <hr />

      <h2>Order Below</h2>
      <Form onSubmit={handleSubmit(onSubmit)}>
        <Form.Group>
          <Form.Label>Quantity:</Form.Label>
          <Form.Control
            as='select'
            name='quantity'
            required
            ref={register}
            defaultValue=''
          >
            <option value='' disabled />
            <option value={3}>3 boxes</option>
            <option value={4}>4 boxes</option>
            <option value={5}>5 boxes</option>
            <option value={6}>6 boxes</option>
            <option value={7}>7 boxes</option>
            <option value={8}>8 boxes</option>
            <option value={9}>9 boxes</option>
            <option value={10}>10 boxes</option>
          </Form.Control>
        </Form.Group>
        <Form.Group>
          <Form.Label>Shipping Date:</Form.Label>
          <Form.Control
            as='select'
            name='date'
            required
            ref={register}
            defaultValue=''
          >
            <option value='' disabled />
            <option value='September 9th [Order before 7th]'>
              September 9th [Order before 7th]
            </option>
            <option value='September 16th [Order before 14th]'>
              September 16th [Order before 14th]
            </option>
          </Form.Control>
        </Form.Group>
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
        <Form.Group>
          <Form.Label>Pick-up notes:</Form.Label>
          <Form.Control name='notes' as='textarea' rows={2} ref={register} />
        </Form.Group>
        <p>
          <strong>Total:</strong>
          {quantity ? ` € ${quantity * 21 + 5}` : null}
        </p>
        <Button variant='rar' type='submit' disabled={formState.isSubmitting}>
          Pay Now
        </Button>
      </Form>
    </Layout>
  )
}

export default FullMoonBox
