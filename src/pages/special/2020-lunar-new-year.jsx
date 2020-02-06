import React from "react";
import { useStaticQuery, graphql, Link } from "gatsby";
import Img from "gatsby-image";

import Layout from "../../components/layout";

// import Form2020LunarNewYear from "../../components/forms/special/2020-lunar-new-year";

const Special2020LunarNewYear = ({ location }) => {
  const data = useStaticQuery(graphql`
    {
      images: allFile(
        filter: {
          relativeDirectory: { regex: "/(special/2020-lunar-new-year)/" }
        }
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
    }
  `);
  return (
    <Layout
      location={location}
      name="special-2020-lunar-new-year"
      SEOtitle="2020 Lunar New Year Special"
      SEOkeywords={["Lunar new year", "Chinese new year", "Rotterdam"]}
    >
      <h3 className="sub-heading mb-3">2020 Lunar New Year Special</h3>
      <div className="row justify-content-center mb-3">
        <div className="col-12 col-md-10">
          <Img fluid={data.images.nodes[0].childImageSharp.fluid} />
        </div>
      </div>
      <p>
        It is almost Lunar New Year (Chinese Spring Festival) again! From now
        on, you can order our beloved Spring Festival Special Cake Roll.
      </p>
      <p>This year we got 2 flavors for you.</p>
      <div className="row">
        <div className="col-12 col-md-6">
          <Img fluid={data.images.nodes[1].childImageSharp.fluid} />
          <h5 className="mt-2">1 [Golden Rat Year 金鼠献瑞]</h5>
          <p>
            <strong>Flavour:</strong> Red yeast rice powder colored cake, Red
            bean cream, Strawberry; Topped with Vanilla cream, Mouse head
            cookie, Raspberry and Blueberry.
          </p>
        </div>
        <div className="col-12 col-md-6">
          <Img fluid={data.images.nodes[2].childImageSharp.fluid} />
          <h5 className="mt-2">2 [Happiness is here 福气临门]</h5>
          <p>
            <strong>Flavour:</strong> Red yeast rice powder colored cake, Matcha
            cream and Red beans.
          </p>
        </div>
      </div>
      <br />
      <p>
        <strong>Size:</strong> Only complete roll can be pre-ordered. One
        complete roll is 24cm long, can be cut into 7-8 slices.
      </p>
      <p>
        <strong>Price:</strong>€ 23,50 per roll
      </p>
      <p>
        <strong>Shelf life:</strong> 3 days (below 5 °C)
      </p>
      <p>
        Please fill in the form below to order. A confirmation email will be
        sent to you once your order is confirmed.
      </p>
      <p>
        For short-notice orders, you can always{" "}
        <Link to="/shop-info#contact">email or call us</Link> to check
        availability of the day.
      </p>
      {/* <Form2020LunarNewYear /> */}
    </Layout>
  );
};

export default Special2020LunarNewYear;
