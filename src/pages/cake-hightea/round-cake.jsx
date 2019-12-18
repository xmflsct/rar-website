import React from 'react';
import { useStaticQuery, graphql, Link } from 'gatsby';

import Layout from '../../components/layout';
import SEO from '../../components/seo';
import CakeList from '../../components/cake-hightea/cake-list';

const RoundCake = ({ location }) => {
  const data = useStaticQuery(graphql`
    {
      allMarkdownRemark(
        filter: { fileAbsolutePath: { regex: "/(cake-hightea/round-cake)/" } }
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
    <Layout location={location} name="cake-hightea round-cake">
      <SEO title="Round Cake" keywords={['Round&Round', 'Rotterdam']} />

      <h3 className="sub-heading mb-3">Round Cake</h3>

      <p>
        We also have sliced round cakes everyday in shop. The entire round cakes
        below can be pre-ordered by
        {' '}
        <a href="mailto:info@roundandround.nl">sending us an email</a>
,
        {' '}
        <a href="tel:0031107856545">calling us</a>
        or
        {' '}
        <a
          href="https://www.facebook.com/roundandround.nl/"
          target="_blank"
          rel="noopener noreferrer"
        >
          Facebook messaging us
        </a>
        . Please place your order 5 days in advance for certainty.
      </p>
      <p>
        For further information, please read our
        {' '}
        <Link to="/shop-info#q-a">Q&amp;A</Link>
.
        {' '}
      </p>

      <div className="row">
        {data.allMarkdownRemark.edges.map(({ node }) => (
          <CakeList node={node} key={node.index} />
        ))}
      </div>
    </Layout>
  );
};

export default RoundCake;