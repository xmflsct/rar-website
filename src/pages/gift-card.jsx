import React, { useState } from "react";
import { useStaticQuery, graphql, Link } from "gatsby";
import Img from "gatsby-image";
import { Button, Col, Form, InputGroup } from "react-bootstrap";
import { useForm, Controller } from "react-hook-form";
import Reaptcha from "reaptcha";
import { loadStripe } from "@stripe/stripe-js";
import { checkout } from "../components/api/checkout";

import Layout from "../components/layout";

const GiftCard = ({ location }) => {
  // const data = useStaticQuery(graphql`
  //   {
  //     matcha: allFile(
  //       filter: { relativeDirectory: { regex: "/(matcha)/" } }
  //       sort: { order: ASC, fields: name }
  //     ) {
  //       nodes {
  //         childImageSharp {
  //           fluid(maxWidth: 700) {
  //             ...GatsbyImageSharpFluid_withWebp
  //           }
  //         }
  //         name
  //       }
  //     }
  //   }
  // `);
  const stripePromise = loadStripe(
    "pk_test_zeXIOyCPled3HXSt7ZHA02dF00QsL1i5hd"
  );
  const { control, getValues, register, handleSubmit, watch } = useForm();
  const [amount20, setAmount20] = useState(0);
  const [amount50, setAmount50] = useState(0);
  const [amount100, setAmount100] = useState(0);
  const [amountTotal, setAmountTotal] = useState(0);
  const [buttonState, setButtonState] = useState(false);
  const [recaptcha, setRecaptcha] = useState(null);

  const onChangeAmount = e => {
    switch (e.target.name) {
      case "option20":
        setAmount20(e.target.value * 20);
        setAmountTotal(e.target.value * 20 + amount50 + amount100);
        break;
      case "option50":
        setAmount50(e.target.value * 50);
        setAmountTotal(amount20 + e.target.value * 50 + amount100);
        break;
      case "option100":
        setAmount100(e.target.value * 100);
        setAmountTotal(amount20 + amount50 + e.target.value * 100);
        break;
      default:
        break;
    }
  };

  const onVerify = async token => {
    const data = getValues();
    const customer = { email: data.email };
    const items = [
      {
        name: "Gift Card € 20",
        amount: 2000,
        currency: "eur",
        quantity: parseInt(data.option20)
      },
      {
        name: "Gift Card € 50",
        amount: 5000,
        currency: "eur",
        quantity: parseInt(data.option50)
      },
      {
        name: "Gift Card € 100",
        amount: 10000,
        currency: "eur",
        quantity: parseInt(data.option100)
      }
    ];
    const metadata = {
      name: data.name,
      phone: data.phone,
      notes: data.notes
    };
    const url = {
      success: window.location.origin + "/checkout/success",
      cancel: window.location.origin + "/gift-card"
    };
    const res =
      data.delivery === "pickup"
        ? await checkout(token, customer, items, metadata, url, false)
        : await checkout(token, customer, items, metadata, url, true);
    if (res.ok) {
      const stripe = await stripePromise;
      const { error } = await stripe.redirectToCheckout({
        sessionId: res.body.sessionId
      });
      if (error) {
        console.warn("Error:", error);
      }
    } else {
      setButtonState(false);
    }
  };

  const onSubmit = async data => {
    if (amountTotal === 0) {
      console.log("error");
      return;
    }
    recaptcha.execute();
    setButtonState(true);
  };

  return (
    <Layout
      location={location}
      name="Gift Card"
      SEOtitle="Gift Card"
      SEOkeywords={["Gift Card", "Gift", "Card", "Rotterdam"]}
    >
      <h3 className="sub-heading mb-3" id="matcha-lovers">
        Buy Round&amp;Round Gift Card
      </h3>
      <h5 className="mb-3">About Gift Card</h5>
      <p>
        Round&amp;Round Gift Card is valid indefinitely and can be exchanged at
        any time for both food and non-food products in the shop. It is a great
        surprise for someone you love and care.
      </p>
      <h5 className="mb-3">Details</h5>
      <ul>
        <li>We have 3 different values of gift card: € 20/50/100.</li>
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
      <h5 className="mb-3" style={{ color: "rgb(80, 175, 19)" }}>
        Support our little shop during Corona Crisis
      </h5>
      <p style={{ color: "rgb(80, 175, 19)" }}>
        Many local small businesses are affected by Corona outbreak including
        Round&amp;Round. Please support us by purchasing a gift card for later
        use. In this period we will offer special voucher and gifts for you.
      </p>
      <h5 className="mb-3">Order Online</h5>
      <Form onSubmit={handleSubmit(onSubmit)}>
        <Form.Text as="p">
          Please choose the gift cards you would like to buy:
        </Form.Text>
        <Form.Row>
          <Form.Group as={Col} lg={4}>
            <Form.Label>€ 20 Gift Card</Form.Label>
            <Form.Text>
              Plus a postcard and a 10% off Birthday cake voucher
            </Form.Text>
            <InputGroup>
              <InputGroup.Prepend>
                <InputGroup.Text>€ 20</InputGroup.Text>
              </InputGroup.Prepend>
              <Form.Control
                name="option20"
                as="select"
                onChange={e => onChangeAmount(e)}
                ref={register}
                required={amountTotal === 0}
              >
                <option value="">0</option>
                <option value={1}>× 1</option>
                <option value={2}>× 2</option>
                <option value={3}>× 3</option>
                <option value={4}>× 4</option>
                <option value={5}>× 5</option>
              </Form.Control>
            </InputGroup>
          </Form.Group>
          <Form.Group as={Col} lg={4}>
            <Form.Label>€ 50 Gift Card</Form.Label>
            <Form.Text>
              Plus a postcard and a 20% off Birthday cake voucher
            </Form.Text>
            <InputGroup>
              <InputGroup.Prepend>
                <InputGroup.Text>€ 50</InputGroup.Text>
              </InputGroup.Prepend>
              <Form.Control
                name="option50"
                as="select"
                onChange={e => onChangeAmount(e)}
                ref={register}
                required={amountTotal === 0}
              >
                <option value="">0</option>
                <option value={1}>× 1</option>
                <option value={2}>× 2</option>
                <option value={3}>× 3</option>
                <option value={4}>× 4</option>
                <option value={5}>× 5</option>
              </Form.Control>
            </InputGroup>
          </Form.Group>
          <Form.Group as={Col} lg={4}>
            <Form.Label>€ 100 Gift Card</Form.Label>
            <Form.Text>
              Plus a postcard, a 10% off Birthday cake voucher and a R&amp;R
              tote bag
            </Form.Text>
            <InputGroup>
              <InputGroup.Prepend>
                <InputGroup.Text>€ 100</InputGroup.Text>
              </InputGroup.Prepend>
              <Form.Control
                name="option100"
                as="select"
                onChange={e => onChangeAmount(e)}
                ref={register}
                required={amountTotal === 0}
              >
                <option value="">0</option>
                <option value={1}>× 1</option>
                <option value={2}>× 2</option>
                <option value={3}>× 3</option>
                <option value={4}>× 4</option>
                <option value={5}>× 5</option>
              </Form.Control>
            </InputGroup>
          </Form.Group>
        </Form.Row>
        <Form.Text as="p">
          Please choose how would you like to collect them:
        </Form.Text>
        <Form.Group>
          <InputGroup className="mb-3">
            <InputGroup.Prepend>
              <Controller
                as={<InputGroup.Radio />}
                name="delivery"
                value="pickup"
                valueName="label"
                required
                control={control}
              />
            </InputGroup.Prepend>
            <InputGroup.Text>Pickup at our shop</InputGroup.Text>
          </InputGroup>
          <InputGroup className="mb-3">
            <InputGroup.Prepend>
              <Controller
                as={<InputGroup.Radio value="test2" />}
                name="delivery"
                value="mail"
                valueName="label"
                required
                control={control}
              />
            </InputGroup.Prepend>
            <InputGroup.Text>
              Mail to a postal address in NL<br />(add address during checkout)
            </InputGroup.Text>
          </InputGroup>
        </Form.Group>
        <Form.Text as="p">We would need your contact information:</Form.Text>
        <Form.Group>
          <Form.Row>
            <Col lg={6}>
              <InputGroup className="mb-3">
                <InputGroup.Prepend>
                  <InputGroup.Text>Name</InputGroup.Text>
                </InputGroup.Prepend>
                <Form.Control name="name" type="text" required ref={register} />
              </InputGroup>
            </Col>
            <Col lg={6}>
              <InputGroup className="mb-3">
                <InputGroup.Prepend>
                  <InputGroup.Text>Email</InputGroup.Text>
                </InputGroup.Prepend>
                <Form.Control
                  name="email"
                  type="email"
                  required
                  ref={register}
                />
              </InputGroup>
            </Col>
            <Col lg={6}>
              <InputGroup className="mb-3">
                <InputGroup.Prepend>
                  <InputGroup.Text>Phone</InputGroup.Text>
                </InputGroup.Prepend>
                <Form.Control
                  name="phone"
                  type="tel"
                  pattern="06\d{8}"
                  placeholder="0612345678"
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
                <Form.Control name="notes" as="textarea" ref={register} />
              </InputGroup>
            </Col>
          </Form.Row>
        </Form.Group>
        <Form.Text as="p">We would need your contact information:</Form.Text>
        <InputGroup className="mb-3">
          <InputGroup.Prepend>
            <InputGroup.Text>Total</InputGroup.Text>
          </InputGroup.Prepend>
          <InputGroup.Text>
            € {amountTotal} = € 20 × {amount20 / 20} + € 50 × {amount50 / 50} +
            € 100 × {amount100 / 100}
          </InputGroup.Text>
        </InputGroup>
        <Button type="submit" disabled={buttonState} className="mb-3">
          {buttonState ? "Please wait" : "Buy now"}
        </Button>
        <Reaptcha
          ref={e => setRecaptcha(e)}
          sitekey="6Le85MYUAAAAAFIN9CKLxzyqnep4zJjeFxr4RpxU"
          onVerify={onVerify}
          size="invisible"
          badge="inline"
        />
      </Form>
    </Layout>
  );
};

export default GiftCard;
