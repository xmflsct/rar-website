import React from "react";
import { useStaticQuery, graphql } from "gatsby";
import Img from "gatsby-image";
import { Link } from "gatsby";

import Layout from "../../components/layout";
import SEO from "../../components/seo";
import CakeList from "../../components/cake-hightea/cake-list";

const SignatureCakeRoll = ({ location }) => {
  const data = useStaticQuery(graphql`
    {
      image1: file(
        relativePath: { regex: "/(cake-hightea/signature-cake-roll/01.jpg)/" }
      ) {
        childImageSharp {
          fluid {
            ...GatsbyImageSharpFluid_withWebp
          }
        }
      }
      allMarkdownRemark(
        filter: {
          fileAbsolutePath: { regex: "/(cake-hightea/signature-cake-roll)/" }
        }
        sort: { order: ASC, fields: frontmatter___cake_hightea___order }
      ) {
        edges {
          node {
            frontmatter {
              cake_hightea {
                name
                order
                category
                description
                price {
                  piece
                  whole
                }
              }
              thumbnail {
                childImageSharp {
                  fluid {
                    ...GatsbyImageSharpFluid_withWebp
                  }
                }
              }
            }
          }
        }
      }
    }
  `);
  return (
    <Layout location={location} name="signature-cake-roll">
      <SEO title="Signature Cake Roll" keywords={[`Round&Round`, `Rotterdam`]} />

      <Img fluid={data.image1.childImageSharp.fluid} />

      <h3 className="sub-heading mb-3">Signature Cake Rolls</h3>

      <p>
        Our cake rolls are fluffy and light with low sugar. We use natural
        colourings, homemade sauce and seasonal ingredients. We love to do
        experiment with new combinations. That is why we often have some new
        cake roll flavours. The entire cake rolls below can be pre-ordered by{" "}
        <a href="mailto:info@roundandround.nl">sending us an email</a>,{" "}
        <a href="tel:0031107856545">calling us</a> or{" "}
        <a
          href="https://www.facebook.com/roundandround.nl/"
          target="_blank"
          rel="noopener noreferrer"
        >
          Facebook messaging us
        </a>
        .
      </p>
      <p>
        If you have any questions, feel free to{" "}
        <Link to="/shop-info#contact">contact us</Link> or read our{" "}
        <Link to="/shop-info#q-a">Q&A</Link>.
        <br />
        <i>
          * Price below is per slice/roll. Sliced cakes are only available in
          our café.
        </i>
      </p>

      <div className="row">
        {data.allMarkdownRemark.edges.map(({ node }, index) => (
          <CakeList node={node} key={index} />
        ))}
      </div>
    </Layout>
  );
};

export default SignatureCakeRoll;
