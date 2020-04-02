import React, { useContext, useState } from "react"
// import { Col, Row, Spinner } from "react-bootstrap"

import Layout from "../layouts/layout"
import { ContextBag } from "../layouts/context-bag"
// import { thankYou } from "../api/thank-you"

const ThankYou = () => {
  // const [recaptcha, setRecaptcha] = useState(null)
  // const [loading, setLoading] = useState(true)
  // const [sessionId, setSessionId] = useState(
  //   new URLSearchParams(window.location.search).get("session_id")
  // )
  // const [sessionData, setSessionData] = useState({})

  const { dispatch } = useContext(ContextBag)
  const [cleared, setCleared] = useState(false)
  let session_id = null
  if (typeof window !== "undefined") {
    session_id = new URLSearchParams(window.location.search).get("session_id")
  }
  if (!cleared && session_id) {
    dispatch({
      type: "clear"
    })
    setCleared(true)
  }
  return (
    <Layout
      name='Thank you!'
      SEOtitle='Thank you!'
      SEOkeywords={["Checkout", "Rotterdam"]}
    >
      <h1 className='sub-heading mb-3' id='matcha-lovers'>
        Thank you for your order!
      </h1>
      <p>
        You should receive a payment confirmation email pretty soon. In case you
        have any question, feel free to contact us :)
      </p>
      {/* {sessionId ? (
        <>
          {loading ? (
            <Row>
              <Col xs={12} className='mb-5 text-center'>
                <Spinner animation='grow' />
              </Col>
              <Col xs={12}>
              </Col>
            </Row>
          ) : (
            <Row className='justify-content-center'>
              <Col xs={12} md={8} className='mb-3'>
                <p>Confirmation sent to: {sessionData.email}</p>
                {this.state.sessionData.things.map(thing => (
                    <Row key={thing.custom.name}>
                      <Col xs={5}>
                        <img
                          src={thing.custom.images[0]}
                          alt={thing.custom.name}
                        />
                      </Col>
                      <Col xs={7}>
                        <h4>{thing.custom.name}</h4>
                        <p stly={{ fontSize: "0.8em" }}>
                          {thing.quantity}
                          <br />
                          <br />
                          {thing.amount / 100}
                        </p>
                      </Col>
                    </Row>
                  ))}
              </Col>
            </Row>
          )}
        </>
      ) : (
        <>
          <p>
            You should receive a payment confirmation email pretty soon. In case
            you have any question, feel free to contact us.
          </p>
        </>
      )} */}
    </Layout>
  )
}

export default ThankYou
