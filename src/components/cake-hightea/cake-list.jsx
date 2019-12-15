import React from 'react';

import Img from 'gatsby-image';

import { currency } from './currency';

const CakeList = ({ node }) => (
  <div className="col-12 col-md-4">
    <Img
      fluid={node.frontmatter.thumbnail.childImageSharp.fluid}
      style={{
        position: 'relative',
        overflow: 'hidden',
        paddingBottom: '100%',
        height: '0',
      }}
    />
    <div className="row mt-2 no-gutters">
      <h6 className="col">{node.frontmatter.cake_hightea.name}</h6>
      <span className="col-auto price">
        {node.frontmatter.cake_hightea.price
          ? node.frontmatter.cake_hightea.price.piece
            ? node.frontmatter.cake_hightea.price.whole
              ? `${currency(node.frontmatter.cake_hightea.price.piece)
              }/${
                currency(node.frontmatter.cake_hightea.price.whole)}`
              : currency(node.frontmatter.cake_hightea.price.piece)
            : node.frontmatter.cake_hightea.price.whole
              ? currency(node.frontmatter.cake_hightea.price.whole)
              : ''
          : ''}
      </span>
    </div>

    {node.frontmatter.cake_hightea.description ? (
      <div
        dangerouslySetInnerHTML={{
          __html: node.frontmatter.cake_hightea.description,
        }}
        style={{ whiteSpace: 'pre-line' }}
        className="description mb-4"
      />
    ) : (
      ''
    )}
  </div>
);

export default CakeList;
