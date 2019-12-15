import React from 'react';
import { graphql } from 'gatsby';
import Img from 'gatsby-image';

import Layout from '../components/layout';
import SEO from '../components/seo';

class ProjectTemplate extends React.Component {
  render() {
    const post = this.props.data.markdownRemark;
    const localDate = new Date(post.frontmatter.date).toLocaleDateString(
      'en-UK',
      {
        weekday: 'long',
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      }
    );

    return (
      <Layout location={this.props.location} name={post.frontmatter.title}>
        <SEO
          title={post.frontmatter.title}
          keywords={['Round&Round', 'Workshop', 'Rotterdam']}
        />

        <h3 className="mb-4">{post.frontmatter.title}</h3>

        <div className="row mb-4">
          <div className="col-md-3">
            <h6>Date</h6>
            <p>{localDate}</p>
            <h6>Time</h6>
            <p>{post.frontmatter.time}</p>
            <h6>Link</h6>
            <p>
              <a
                href={post.frontmatter.link}
                target="_blank"
                rel="noopener noreferrer"
                alt="Facebook event link"
              >
                Facebook Event
              </a>
            </p>
          </div>

          <div className="col-md-9">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2460.6118759084343!2d4.490871915785305!3d51.92279197970556!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x47c433451debd72f%3A0xc4ada4e0ae53ac9c!2sRound%26Round%20Rotterdam!5e0!3m2!1sen!2sse!4v1571081880892!5m2!1sen!2sse"
              title="Google Maps"
              width="100%"
              height="300"
              frameBorder="0"
              style={{ border: 0 }}
              allowFullScreen={false}
            />
          </div>
        </div>

        <Img
          fluid={post.frontmatter.thumbnail.childImageSharp.fluid}
          className="mb-4"
        />

        <div dangerouslySetInnerHTML={{ __html: post.html }} />
      </Layout>
    );
  }
}

export default ProjectTemplate;

export const pageQuery = graphql`
  query ProjectBySlug($slug: String!) {
    markdownRemark(fields: { slug: { eq: $slug } }) {
      html
      frontmatter {
        title
        date
        time
        thumbnail {
          childImageSharp {
            fluid(maxWidth: 700) {
              ...GatsbyImageSharpFluid_withWebp
            }
          }
        }
        link
      }
    }
  }
`;
