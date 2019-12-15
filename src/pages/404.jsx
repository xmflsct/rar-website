import React from 'react';
import { useStaticQuery, graphql, Link } from 'gatsby';
import Img from 'gatsby-image';

import Header from '../components/header';
import Footer from '../components/footer';
import SEO from '../components/seo';

const PageNotFound = () => {
  const data = useStaticQuery(graphql`
    query {
      image: file(relativePath: { regex: "/(404.jpg)/" }) {
        childImageSharp {
          fluid(maxWidth: 920) {
            ...GatsbyImageSharpFluid_withWebp
          }
        }
      }
    }
  `);
  return (
    <div className="site-wrapper craft">
      <Header />
      <SEO
        title="404: where is the cake"
        keywords={['Round&Round', 'Rotterdam', '404']}
      />
      <main id="site-main" className="site-main transition-fade">
        <div className="row text-center">
          <h3 className="col-12">404: where is the cake</h3>
          <Link
            to="/cake-hightea/signature-cake-roll"
            className="mt-3 mb-5"
            style={{ marginLeft: 'auto', marginRight: 'auto' }}
          >
            Take a look at our signature cake roll?
          </Link>
          <Img fluid={data.image.childImageSharp.fluid} className="col-12" />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PageNotFound;
