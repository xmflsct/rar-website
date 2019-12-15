import React from "react";
import axios from "axios";

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
      <div className="row px-2 px-lg-2 instagram">
      {this.state.loading ? (
        <div className="col">Loading...</div>
      ) : (
        this.state.images ? (
          this.state.images.map(({ node }, index) => {
            if (index < 9) {
              return (
                <div className="col-lg-4 px-2 px-lg-2 mb-3">
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
                </div>
              );
            } else {
              return null
            }
          })
        ) : (
          <div className="col">Unfortunately, Instagram is not available at this moment.</div>
        )
      )}
      </div>
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
