import { graphql, useStaticQuery } from "gatsby";
import Img from "gatsby-image";
import React from "react";
import Layout from "../layouts/layout";

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
  `);

  return (
    <Layout
      name="Full Moon Box Shipping"
      SEOtitle="Full Moon Box Shipping"
      SEOkeywords={["Full moon", "Rotterdam"]}
    >
      <div className="fullmoon-images">
        <Img className="mb-4" fluid={data.image1.childImageSharp.fluid} />
        <Img className="mb-4" fluid={data.image2.childImageSharp.fluid} />
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
        className="mb-4 fullmoon-image"
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
    </Layout>
  );
};

export default FullMoonBox;
