import React from "react";
import { useStaticQuery, graphql } from "gatsby";
import Img from "gatsby-image";
import { Link } from "gatsby";

import Layout from "../../components/layout";

const ForestHightea = ({ location }) => {
  const data = useStaticQuery(graphql`
    {
      allFile(
        filter: {
          relativeDirectory: { regex: "/(cake-hightea/forest-hightea)/" }
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
      name="cake-hightea forest-hightea"
      SEOtitle="Forest Hightea"
      SEOkeywords={["Hightea", "Rotterdam"]}
    >
      <h3 className="sub-heading mb-3" id="press">
        Forest Hightea (reservation required)
      </h3>
      <p>
        Our hightea needs to be pre-ordered by{" "}
        <a href="mailto:info@roundandround.nl">sending us an email</a>,{" "}
        <a href="tel:0031107856545">calling us</a> or{" "}
        <a
          href="https://www.facebook.com/roundandround.nl/"
          target="_blank"
          rel="noopener noreferrer"
        >
          Facebook messaging us
        </a>
        . Please place your order 5 days in advance for certainty. Minimal 2
        people.
      </p>
      <Img fluid={data.allFile.nodes[0].childImageSharp.fluid} />
      <h5 className="mt-4">1. Sakura Hightea (March-April Spring Special)</h5>
      <p>Full: € 27.00/p.p. Mini: € 19.00/p.p.</p>
      <p>
        <b>[Starter]</b>
        <br />
        Sakura Calpis Soda
        <br />
        <b>[Cake Roll]</b>
        <br />
        Beetroot | Blackberry
        <br />
        <b>[Hanami Cheese Cake]</b>
        <br />
        Raspberry | Blackberry | Yoghurt
        <br />
        <b>[Tart]</b>
        <br />
        Stewed Apple | Strawberry
        <br />
        <b>[Jelly *]</b>
        <br />
        Almond Tofu | Lychee Jelly | Salted Sakura
        <br />
        <b>[Pound Cake *]</b>
        <br />
        Matcha &amp; English Tea
        <br />
        <b>[Dorayaki *]</b>
        <br />
        Beetroot | Sweetened Red Beans
        <br />
        <b>[Small Bites]</b>
        <br />
        Cookies | Earl Grey Nama Chocolate
        <br />
        <b>[Sth Savory]</b>
        <br />
        Daily Japanese Sandwich
        <br />
        <b>[2h Unlimited Loose Tea]</b>
        <br />
        Choose from our Tea Menu
      </p>
      <p>
        <i>
          Full: € 27.00/p.p
          <br />
          Mini: € 19.00/p.p. (exclude items with *)
          <br />
          Reservation Required
        </i>
      </p>

      <Img
        fluid={data.allFile.nodes[1].childImageSharp.fluid}
        className="mt-5"
      />
      <h5 className="mt-4">2. Matcha Lover Hightea (€ 24.50/p.p)</h5>
      <p>
        Example menu:
        <br />
        - Matcha chocolate and cookie
        <br />
        - Matcha pound cake
        <br />
        - Matcha cake of the day
        <br />
        - Matcha cake roll
        <br />
        - Matcha dorayaki
        <br />
        - Matcha pudding
        <br />
        - Matcha Tamagoyaki with seasoned gyokuro tea leaves
        <br />- Premium green tea
      </p>
      <p>
        Please read our <Link to="/shop-info#q-a">Q&A</Link> for more info about
        Hightea reservation and cancellation policy.
      </p>
    </Layout>
  );
};

export default ForestHightea;
