import { graphql, useStaticQuery } from 'gatsby'
import Img from "gatsby-image"
import React from 'react'

import Layout from '../layouts/layout'

const Hightea = () => {
  const data = useStaticQuery(graphql`
    query {
      image: file(relativePath: { eq: "page-hightea/hightea.jpg" }) {
        childImageSharp {
          fluid(maxWidth: 350) {
            ...GatsbyImageSharpFluid_withWebp
          }
        }
      }
    }
  `)

  return (
    <Layout
      name='Hightea'
      SEOtitle='Hightea'
      SEOkeywords={['Hightea', 'Rotterdam']}
    >
      <Img className='mb-4' fluid={data.image.childImageSharp.fluid} />
      <h2>Round &amp; Round Hightea Menu</h2>
      <p>
        Full version: 33 euro/p.p.
        <br />
        Mini version: 24 euro/ p.p. (Exclude items with <strong>*</strong>)
      </p>
      <ul>
        <li>[Starter] Lavender Calpis soda</li>
        <li>[Daily Cake Rolls]</li>
        <li>[Daily Signature Cakes]</li>
        <li>[Stewed Apple Tart with fruit topping]</li>
        <li>
          [Seasonal Pudding <strong>*</strong>]
        </li>
        <li>
          [Passion Fruit Pound Cake <strong>*</strong>]
        </li>
        <li>
          [Dorayaki <strong>*</strong>]
        </li>
        <li>[Matcha Hojicha Cookies]</li>
        <li>[Matcha Nama Chocolate]</li>
        <li>[Daily Japanese Sandwich]</li>
        <li>[2h Unlimited Tea from Tea Menu]</li>
      </ul>
      <h2>Hightea Time</h2>
      <p>
        We serve High-tea from Wednesday to Sunday.
        <br />
        <strong>First round</strong> 12:00-14:15, we suggest you book your start
        time no later than 12:45.
        <br />
        <strong>Second round</strong> 14:30-16:45, we suggest you book your
        start time no later than 15:15.
      </p>
      <h2>How to reserve</h2>
      <ol>
        <li>
          Reservation can be made via email info@roundandround.nl Please mention
          which type of high-tea(Full or Mini), your preferred start time and
          your phone number.
        </li>
        <li>Minimal 2 people.</li>
        <li>Please reserve 2 working days in advance for certainty. </li>
      </ol>
      <h2>Cancellation policy</h2>
      <p>If you want to cancel, please let us know at least 24 hours prior to your booking time.</p>
      <p>If you simply do not show up to a booked Hightea without contacting us or consecutively late you may not be able to make any future appointments.</p>
      <p>Thank you for understanding.</p>
      <h2>Allergy</h2>
      <p>
        Please let us know ASAP once you book your hightea, we will take care of
        it.
      </p>
    </Layout>
  )
}

export default Hightea
