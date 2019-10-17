import React from "react";
import { useStaticQuery, graphql } from "gatsby";

import Layout from "../../components/layout";
import SEO from "../../components/seo";
import CakeList from "../../components/cake-hightea/cake-list";

const BirthdayCake = ({ location }) => {
  const data = useStaticQuery(graphql`
    {
      cakeA: allMarkdownRemark(
        filter: {
          fileAbsolutePath: { regex: "/(cake-hightea/birthday-cake)/" }
          frontmatter: { cake_hightea: { group: { eq: "A" } } }
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
                  fluid(maxWidth: 250) {
                    ...GatsbyImageSharpFluid_withWebp
                  }
                }
              }
            }
          }
        }
      }
      cakeB: allMarkdownRemark(
        filter: {
          fileAbsolutePath: { regex: "/(cake-hightea/birthday-cake)/" }
          frontmatter: { cake_hightea: { group: { eq: "B" } } }
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
                  fluid(maxWidth: 250) {
                    ...GatsbyImageSharpFluid_withWebp
                  }
                }
              }
            }
          }
        }
      }
      cakeC: allMarkdownRemark(
        filter: {
          fileAbsolutePath: { regex: "/(cake-hightea/birthday-cake)/" }
          frontmatter: { cake_hightea: { group: { eq: "C" } } }
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
                  fluid(maxWidth: 250) {
                    ...GatsbyImageSharpFluid_withWebp
                  }
                }
              }
            }
          }
        }
      }
      cakeD: allMarkdownRemark(
        filter: {
          fileAbsolutePath: { regex: "/(cake-hightea/birthday-cake)/" }
          frontmatter: { cake_hightea: { group: { eq: "D" } } }
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
                  fluid(maxWidth: 250) {
                    ...GatsbyImageSharpFluid_withWebp
                  }
                }
              }
            }
          }
        }
      }
      cakeE: allMarkdownRemark(
        filter: {
          fileAbsolutePath: { regex: "/(cake-hightea/birthday-cake)/" }
          frontmatter: { cake_hightea: { group: { eq: "E" } } }
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
                  fluid(maxWidth: 250) {
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
    <Layout location={location} name="cake-hightea birthday-cake">
      <SEO title="Birthday Cake" keywords={[`Round&Round`, `Rotterdam`]} />

      <h3 className="sub-heading mb-3">Birthday Cake</h3>

      <p>
        Our birthday cake is made with soft chiffon cake with fresh cream,
        mascarpone, bio-jam and fresh fruit. The birthday cakes below can be
        pre-ordered by sending us an email, calling us or Facebook messaging us.
        You can just let us know the style number. Please order 5 days in
        advance for certainty.
      </p>
      <p>
        Usually we will put "Happy Birthday" chocolate tag and Bunny cookies as
        shown in the cake photos. If you want to skip it, please let us know. If
        you want other text than "Happy Birthday", it is possible to have a
        paper message tag on the cake. Please leave us the message when you
        place the order (please keep the message short).
      </p>

      <h4 className="sub-heading mt-4">A. 6” Cakes (for 2-4 people) € 19,-</h4>
      <p>Vanilla Chiffon base. (Cacao/Matcha Base + € 2,-)</p>
      <div className="row">
        {data.cakeA.edges.map(({ node }, index) => (
          <CakeList node={node} key={index} />
        ))}
      </div>

      <h4 className="sub-heading mt-4">B. 8” Cakes (for 6-8 people) € 26,-</h4>
      <p>Vanilla Chiffon base. (Cacao/Matcha Base + € 2,-)</p>
      <div className="row">
        {data.cakeB.edges.map(({ node }, index) => (
          <CakeList node={node} key={index} />
        ))}
      </div>

      <h4 className="sub-heading mt-4">
        C. 10” Cakes (for 10-12 people) € 33,-
      </h4>
      <p>Vanilla Chiffon base. (Cacao/Matcha Base + € 2,-)</p>
      <div className="row">
        {data.cakeC.edges.map(({ node }, index) => (
          <CakeList node={node} key={index} />
        ))}
      </div>

      <h4 className="sub-heading mt-4">
        D. Flower Deco High Cakes (for a small party) € 45,-
      </h4>
      <p>
        <b>Base:</b> 3 layers of 8” Chiffon cakes (Default flavour Matcha, you
        can also choose Vanilla/ Cacao).
        <br />
        <b>Cream flavour:</b> Vanilla, Strawberry or Lemon.
        <br />
        <b>Filling:</b> Strawberry or Mango.
        <br />
        <i>
          * We use seasonal flowers. If you have any color theme preference,
          please let us know.
        </i>
      </p>
      <div className="row">
        {data.cakeD.edges.map(({ node }, index) => (
          <CakeList node={node} key={index} />
        ))}
      </div>

      <h4 className="sub-heading mt-4">E. Celebration Cakes</h4>
      <div className="row">
        {data.cakeE.edges.map(({ node }, index) => (
          <CakeList node={node} key={index} />
        ))}
      </div>
    </Layout>
  );
};

export default BirthdayCake;
