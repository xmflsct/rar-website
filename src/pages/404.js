import React from "react";
import { graphql } from "gatsby";
import Img from "gatsby-image";
import { Link } from "gatsby";

import Header from "../components/header";
import Footer from "../components/footer";

class PageNotFound extends React.Component {
  render() {
    const { data } = this.props;

    return (
      <div className="site-wrapper craft">
        <Header />
        <main id="site-main" className="site-main transition-fade">
          <div className="row text-center">
            <h3 className="col-12">404: where is the cake</h3>
            <Link to={`/cake-hightea/signature-cake-roll`} className="mt-3 mb-5" style={{ marginLeft: "auto", marginRight: "auto"}}>
              Take a look at our signature cake roll?
            </Link>
            <Img fluid={data.image.childImageSharp.fluid} className="col-12" />
          </div>
        </main>
        <Footer />
      </div>
    );
  }
}

export default PageNotFound;

export const pageQuery = graphql`
  query {
    image: file(relativePath: { regex: "/(404.jpg)/" }) {
      childImageSharp {
        fluid(maxWidth: 1280) {
          ...GatsbyImageSharpFluid_withWebp
        }
      }
    }
  }
`;
