import React from "react";
import Recaptcha from "react-recaptcha";
import { order_request } from "../../api/order";

export default class Form2019Christmas extends React.Component {
  state = {
    status: null, // 0 first visit; 1 sending; 2 success; 3 fail
    isCaptchaValid: false,
    name: "",
    phone: "",
    email: "",
    option1: "0",
    option2: "0",
    date: "",
    time: "",
    notes: ""
  };
  onCaptchaVerify = response => {
    this.setState({
      isCaptchaValid: true,
      status: 0
    });
  };
  handleInputChange = event => {
    const target = event.target;
    const value = target.value;
    const name = target.name;

    this.setState({
      [name]: value
    });
  };
  handleSubmit = event => {
    event.preventDefault();

    if (this.state.isCaptchaValid) {
      this.setState({ status: 1 });

      var desc =
        "**1 [Party of Ginger Man]:** " +
        this.state.option1 +
        "\n\n**2 [Snowy Forest]:** " +
        this.state.option2 +
        "\n\n**Notes:** " +
        this.state.notes;
      order_request(
        "Order from " + this.state.name,
        desc,
        "5dec120bdf7aed20e7d4dfd6,5ded572289d3de80a7ddb5e3",
        this.state.name,
        this.state.phone,
        this.state.email,
        this.state.date,
        this.state.time
      )
        .then(() => {
          this.setState({ status: 2 });
        })
        .catch(() => {
          this.setState({ status: 3 });
        });
    }
  };
  render() {
    return (
      <form id="theForm" onSubmit={this.handleSubmit}>
        <div className="form-group row">
          <label className="col-form-label col-md-3">Your name:</label>
          <div className="col-md-9">
            <input
              type="text"
              className="form-control"
              name="name"
              value={this.state.name}
              onChange={this.handleInputChange}
              required
              placeholder="Julia Jansen"
            />
          </div>
        </div>
        <div className="form-group row">
          <label className="col-form-label col-md-3">Your phone:</label>
          <div className="col-md-9">
            <input
              type="tel"
              className="form-control"
              name="phone"
              value={this.state.phone}
              onChange={this.handleInputChange}
              required
              placeholder="06********"
              pattern="[0-9]{10}"
            />
          </div>
        </div>
        <div className="form-group row">
          <label className="col-form-label col-md-3">Your email:</label>
          <div className="col-md-9">
            <input
              type="email"
              className="form-control"
              name="email"
              value={this.state.email}
              onChange={this.handleInputChange}
              required
              placeholder="email@example.com"
            />
          </div>
        </div>
        <div className="row">
          <div className="col-md-6">
            <div className="form-group">
              <label className="col-form-label">1 [Party of Ginger Man]:</label>
              <select
                className="form-control"
                name="option1"
                value={this.state.option1}
                onChange={this.handleInputChange}
                required
              >
                <option value="0">0 roll</option>
                <option value="1">1 roll</option>
                <option value="2">2 rolls</option>
                <option value="3">3 rolls</option>
                <option value="4">4 rolls</option>
                <option value="5">5 rolls</option>
                <option value="6">6 rolls</option>
                <option value="7">7 rolls</option>
                <option value="8">8 rolls</option>
                <option value="more" disabled>
                  For more rolls, please contact us
                </option>
              </select>
            </div>
          </div>
          <div className="col-md-6">
            <div className="form-group">
              <label className="col-form-label">2 [Snowy Forest]:</label>
              <select
                className="form-control"
                name="option2"
                value={this.state.option2}
                onChange={this.handleInputChange}
                required
              >
                <option value="0">0 roll</option>
                <option value="1">1 roll</option>
                <option value="2">2 rolls</option>
                <option value="3">3 rolls</option>
                <option value="4">4 rolls</option>
                <option value="5">5 rolls</option>
                <option value="6">6 rolls</option>
                <option value="7">7 rolls</option>
                <option value="8">8 rolls</option>
                <option value="more" disabled>
                  For more rolls, please contact us
                </option>
              </select>
            </div>
          </div>
        </div>
        <div className="form-group row">
          <label className="col-form-label col-md-3">Pick-up date:</label>
          <div className="col-md-9">
            <input
              type="date"
              className="form-control"
              name="date"
              value={this.state.date}
              onChange={this.handleInputChange}
              required
              min="2019-12-18"
              max="2019-12-24"
            />
          </div>
        </div>
        <div className="form-group row">
          <label className="col-form-label col-md-3">Pick-up time:</label>
          <div className="col-md-9">
            <input
              type="time"
              className="form-control"
              name="time"
              value={this.state.time}
              onChange={this.handleInputChange}
              required
            />
            <small className="form-text text-muted">
              From 18th till 21st, between 11:00 and 18:00
              <br />
              On 22nd, between 12:00 and 17:00
              <br />
              On 24th, between 11:00 and 16:30
            </small>
          </div>
        </div>
        <div className="form-group row">
          <label className="col-form-label col-md-3">Notes to us:</label>
          <div className="col-md-9">
            <textarea
              className="form-control"
              name="notes"
              value={this.state.notes}
              onChange={this.handleInputChange}
            />
          </div>
        </div>
        {(() => {
          switch (this.state.status) {
            default:
              return (
                <button type="submit" className="btn btn-outline-primary mb-3" disabled>
                  Submit order request
                </button>
              );
            case 0:
              return (
                <button type="submit" className="btn btn-outline-primary mb-3">
                  Submit order request
                </button>
              );
            case 1:
              return (
                <button
                  type="button"
                  className="btn btn-outline-secondary mb-3"
                  disabled
                >
                  Submitting
                </button>
              );
            case 2:
              return (
                <button
                  type="button"
                  className="btn btn-outline-success mb-3"
                  disabled
                >
                  Submit successful
                </button>
              );
            case 3:
              return (
                <button type="submit" className="btn btn-outline-danger mb-3">
                  Retry submit
                </button>
              );
          }
        })()}
        <Recaptcha
          sitekey="6LdQssYUAAAAAPVCoB_xP-40kXtXcgDne-AJa6FA"
          render="explicit"
          onloadCallback={() => console.log('loaded')}
          verifyCallback={this.onCaptchaVerify}
        />
      </form>
    );
  }
}
