import React from "react";
import { useStaticQuery, graphql } from "gatsby";
import { Link } from "gatsby";
import Img from "gatsby-image";

import OpeningHours from "./sidebar/opening-hours";

const Header = () => {
  const data = useStaticQuery(graphql`
    {
      file(relativePath: { regex: "/(header/logo.png)/" }) {
        childImageSharp {
          fluid(maxWidth: 300) {
            ...GatsbyImageSharpFluid_withWebp_noBase64
          }
        }
      }
    }
  `);
  return (
    <header className="header row">
      <div className="header-left col-lg-3 col-md-12">
        <Link to={`/`}>
          <Img className="m-3" fluid={data.file.childImageSharp.fluid} />
        </Link>
        <div className="opening-hours-details">
          <OpeningHours />
        </div>
      </div>
      <div className="header-center col-9">
        <p>A Little</p>
        <p>
          <b>Matcha</b> Forest
        </p>
        <p>in Rotterdam.</p>
      </div>
    </header>
  );
};

export default Header;
