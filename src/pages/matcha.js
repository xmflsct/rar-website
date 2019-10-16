import React from "react";
import { useStaticQuery, graphql } from "gatsby";
import Img from "gatsby-image";
import { Link } from "gatsby";
import { FaCircle } from "react-icons/fa";
import { FaRegCircle } from "react-icons/fa";

import Layout from "../components/layout";

const Matcha = ({ location }) => {
  const data = useStaticQuery(graphql`
    {
      matcha: allFile(
        filter: { relativeDirectory: { regex: "/(matcha)/" } }
        sort: { order: ASC, fields: name }
      ) {
        nodes {
          childImageSharp {
            fluid {
              ...GatsbyImageSharpFluid_withWebp
            }
          }
          name
        }
      }
    }
  `);
  return (
    <Layout location={location} name="matcha">
      <h3 className="sub-heading mb-3" id="matcha-lovers">
        We are Matcha Lovers
      </h3>
      <p style={{ color: "rgb(80, 175, 19)" }}>
        We love Matcha.
        <br />
        We use premium Matcha from Japan.
      </p>
      <p>
        抹茶のことが大好きだから、
        <br />
        みんなに最高のものを届けたくて。
      </p>
      <p>
        Matcha is our passion. We have been to tea farms, tea factories and
        matcha shops in Japan and China several times for enriching our matcha
        knowledge. We want to explore all the possibilities of using matcha, and
        bring complete matcha experience to people in the Netherlands.
      </p>
      <Img
        fluid={data.matcha.nodes[0].childImageSharp.fluid}
        className="mb-3"
      />
      <Img
        fluid={data.matcha.nodes[1].childImageSharp.fluid}
        className="mb-3"
      />
      <Img
        fluid={data.matcha.nodes[2].childImageSharp.fluid}
        className="mb-5"
      />

      <h3 className="sub-heading mb-3" id="what-is-matcha">
        What is Matcha?
      </h3>
      <Img
        fluid={data.matcha.nodes[3].childImageSharp.fluid}
        className="mb-3"
      />
      <p>Where our matcha originally comes from.</p>
      <p>
        Matcha is a type of green tea powder. It is made of the youngest, finest
        leaves that are carefully handpicked and ground slowly to ensure that it
        retains its high nutritional value.
      </p>

      <h3 className="sub-heading mt-4 mb-3" id="how-is-matcha-made">
        How is Matcha made?
      </h3>
      <Img fluid={data.matcha.nodes[4].childImageSharp.fluid} />

      <h3 className="sub-heading mt-4 mb-3" id="our-matcha-powder">
        Our Matcha Powder
      </h3>
      <p>In 2017, we launched our own matcha powder.</p>
      <div className="row mb-3">
        <div className="col-4">
          <Img fluid={data.matcha.nodes[5].childImageSharp.fluid} />
        </div>
        <div className="col-4">
          <Img fluid={data.matcha.nodes[6].childImageSharp.fluid} />
        </div>
        <div className="col-4">
          <Img fluid={data.matcha.nodes[7].childImageSharp.fluid} />
        </div>
      </div>
      <p>
        <b>NO.101 Mt. Fuji:</b> The tea leaves of this selected matcha is
        cultivated at the foot of Mt. Fuji.
        <br />
        The dried leaves are carefully ground by the stone mill to prevent
        heating by friction so as to make high quality powdered green tea.
      </p>
      <p>
        <b>Region:</b> Shizuoka, Japan
        <br />
        <b>Recommended direction:</b> Drinking, Premium Baking
        <br />
        <b>Price:</b> € 19.90 / 50g
      </p>
      <table className="table table-borderless">
        <tbody>
          <tr>
            <th scope="row">Colour Brightness:</th>
            <td>
              <FaCircle />
              <FaCircle />
              <FaCircle />
            </td>
          </tr>
          <tr>
            <th scope="row">Colour Saturation:</th>
            <td>
              <FaCircle />
              <FaCircle />
              <FaCircle />
            </td>
          </tr>
          <tr>
            <th scope="row">Sweetness:</th>
            <td>
              <FaCircle />
              <FaCircle />
              <FaCircle />
            </td>
          </tr>
          <tr>
            <th scope="row">Grassiness:</th>
            <td>
              <FaCircle />
              <FaRegCircle />
              <FaRegCircle />
            </td>
          </tr>
          <tr>
            <th scope="row">Strength:</th>
            <td>
              <FaCircle />
              <FaCircle />
              <FaRegCircle />
            </td>
          </tr>
        </tbody>
      </table>
      <p>
        <b>NO.201 Premium Baking:</b> Our selected premium baking matcha will
        add a rich flavour and vivid colour to your baking. Of course you can
        also make drinks with it.
      </p>
      <p>
        <b>Region:</b> Mie, Japan
        <br />
        <b>Recommended direction:</b> Premium Baking
        <br />
        <b>Price:</b> € 13.50 / 50g
      </p>
      <table className="table table-borderless">
        <tbody>
          <tr>
            <th scope="row">Colour Brightness:</th>
            <td>
              <FaCircle />
              <FaCircle />
              <FaRegCircle />
            </td>
          </tr>
          <tr>
            <th scope="row">Colour Saturation:</th>
            <td>
              <FaCircle />
              <FaCircle />
              <FaRegCircle />
            </td>
          </tr>
          <tr>
            <th scope="row">Sweetness:</th>
            <td>
              <FaCircle />
              <FaRegCircle />
              <FaRegCircle />
            </td>
          </tr>
          <tr>
            <th scope="row">Grassiness:</th>
            <td>
              <FaCircle />
              <FaCircle />
              <FaRegCircle />
            </td>
          </tr>
          <tr>
            <th scope="row">Strength:</th>
            <td>
              <FaCircle />
              <FaCircle />
              <FaRegCircle />
            </td>
          </tr>
        </tbody>
      </table>

      <h3 className="sub-heading mt-4 mb-3" id="matcha-workshop">
        Our Matcha Ceremony Workshop
      </h3>
      <p>
        We host matcha/tea ceremony and other workshops regularly.
        <br />
        Please check out our{" "}
        <Link to={`/workshop-event`}>Workshop & Event</Link> page or facebook
        page for more info.
      </p>
    </Layout>
  );
};

export default Matcha;
