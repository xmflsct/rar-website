import React from "react";
import { useStaticQuery, graphql, Link } from "gatsby";
import Img from "gatsby-image";

import Layout from "../../components/layout";
import SEO from "../../components/seo";

import Form2019Christmas from "../../components/forms/special/2019-christmas";

const Special2019Christmas = ({ location }) => {
  const data = useStaticQuery(graphql`
    {
      images: allFile(
        filter: { relativeDirectory: { regex: "/(special/2019-christmas)/" } }
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
    <Layout location={location} name="special-2019-christmas">
      <SEO
        title="2019 Christmas Special"
        keywords={["Round&Round", "Rotterdam"]}
      />

      <h3 className="sub-heading mb-3">2019 Christmas Special</h3>
      <div className="row mb-3">
        <div className="col-6">
          <Img fluid={data.images.nodes[0].childImageSharp.fluid} />
        </div>
        <div className="col-6">
          <Img fluid={data.images.nodes[1].childImageSharp.fluid} />
        </div>
      </div>
      <p>
        It is almost Christmas time again! From Now, you can order our beloved
        Christmas Special Cake Roll.
      </p>
      <p>This year we got 2 flavors for you.</p>
      <div className="row">
        <div className="col-12 col-md-6">
          <Img fluid={data.images.nodes[2].childImageSharp.fluid} />
          <h5 className="mt-2">1 [Party of Ginger Man]</h5>
          <p>
            <strong>Flavour:</strong> Pure Cacao Cake Roll, Seasalt-Oreo Cream,
            Mango; Topped with Vanilla cream, Ginger man cookies, Oven dried
            Orange, Rosemary and Blueberries.
          </p>
        </div>
        <div className="col-12 col-md-6">
          <Img fluid={data.images.nodes[3].childImageSharp.fluid} />
          <h5 className="mt-2">2 [Snowy Forest]</h5>
          <p>
            <strong>Flavour:</strong> Pure Matcha Cake Roll, Raspberry Cream,
            Strawberry; Topped with Vanilla cream, Christmas tree cookies and
            Fresh Berries.
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
      <Form2019Christmas />
    </Layout>
  );
};

export default Special2019Christmas;
