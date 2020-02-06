import React from "react";
import axios from "axios";
import { Col, Container, Row, Spinner } from "react-bootstrap";

class Instagram extends React.Component {
  state = {
    loading: false,
    error: false,
    images: []
  };

  componentDidMount() {
    this.fetchImages();
  }

  render() {
    return (
      <Container className="px-2 px-lg-2 instagram">
        <Row>
          {this.state.loading ? (
            <Col>
              <Spinner animation="grow" variant="secondary" role="status">
                <span className="sr-only">Loading...</span>
              </Spinner>
            </Col>
          ) : this.state.images ? (
            this.state.images.map(({ node }, index) => {
              if (index < 9) {
                return (
                  <Col lg={4} className="px-2 px-lg-2 mb-3" key={index}>
                    <a
                      href={"https://instagram.com/p/" + node.shortcode}
                      alt="Instagram post"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <img
                        alt={node.accessibility_caption}
                        src={node.thumbnail_resources[4].src}
                      />
                    </a>
                  </Col>
                );
              } else {
                return null;
              }
            })
          ) : (
            <Col>Unfortunately, Instagram is not available at this moment.</Col>
          )}
        </Row>
      </Container>
    );
  }

  fetchImages = () => {
    this.setState({ loading: true });
    axios
      .get(`https://www.instagram.com/roundandround_rotterdam/?__a=1`)
      .then(instagram => {
        this.setState({
          loading: false,
          images: instagram.data.graphql.user.edge_owner_to_timeline_media.edges
        });
      })
      .catch(error => {
        this.setState({ loading: false, error });
      });
  };
}

export default Instagram;
