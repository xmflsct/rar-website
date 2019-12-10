import React from "react";
import Reaptcha from 'reaptcha';
import { order_request } from "../../api/order";

export default class Form2019Christmas extends React.Component {
  constructor(props) {
    super(props);
    this.captcha = null;
  }
  state = {
    buttonStatus: 0, // 0 active; 1 sending; 2 success; 3 fail
    timeStatus1: true, // 11:00-12:00
    timeStatus2: true, // 16:30-17:00
    timeStatus3: true, // 17:00-18:00
    isFormValidated: false,
    isFormSubmitted: false,
    name: "",
    phone: "",
    email: "",
    option1: "0",
    option2: "0",
    date: "2019-12-31",
    time: "",
    notes: ""
  };
  onVerify = recaptchaResponse => {
    this.setState({ buttonStatus: 1 });

    var desc =
      "1 [Party of Ginger Man]: " +
      this.state.option1 +
      ". 2 [Snowy Forest]: " +
      this.state.option2 +
      ". Notes: " +
      this.state.notes;
    order_request(
      recaptchaResponse,
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
        this.setState({ buttonStatus: 2 });
        this.setState({ isFormSubmitted: true });
      })
      .catch(() => {
        this.setState({ buttonStatus: 3 });
      });
  };
  handleInputChange = event => {
    const target = event.target;
    const value = target.value;
    const name = target.name;

    // Date time validation
    if (name === "date") {
      if (
        value === "2019-12-18" ||
        value === "2019-12-19" ||
        value === "2019-12-20" ||
        value === "2019-12-21"
      ) {
        this.setState({ timeStatus1: true });
        this.setState({ timeStatus2: true });
        this.setState({ timeStatus3: true });
      } else if (value === "2019-12-22") {
        this.setState({ timeStatus1: false });
        this.setState({ timeStatus3: false });
        this.setState({ time: "" });
      } else if (value === "2019-12-23") {
        this.setState({ [name]: "" });
        return;
      } else if (value === "2019-12-24") {
        this.setState({ timeStatus2: false });
        this.setState({ timeStatus3: false });
        this.setState({ time: "" });
      }
    }

    this.setState({
      [name]: value
    });
  };
  handleValication = event => {
    this.setState({ isFormValidated: true });
  };
  handleSubmit = event => {
    event.preventDefault();
    this.captcha.execute();
  };
  render() {
    return (
      <form
        id="theForm"
        className={this.state.isFormValidated ? "was-validated" : ""}
        onSubmit={this.handleSubmit}
      >
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
              placeholder="Round Round"
              disabled={this.state.isFormSubmitted ? "disabled" : ""}
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
              disabled={this.state.isFormSubmitted ? "disabled" : ""}
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
              disabled={this.state.isFormSubmitted ? "disabled" : ""}
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
                disabled={this.state.isFormSubmitted ? "disabled" : ""}
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
                disabled={this.state.isFormSubmitted ? "disabled" : ""}
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
          <label className="col-form-label col-md-3">Pick-up date&time:</label>
          <div className="col-md-6">
            <input
              type="date"
              className="form-control"
              name="date"
              value={this.state.date}
              onChange={this.handleInputChange}
              required
              min="2019-12-18"
              max="2019-12-24"
              disabled={this.state.isFormSubmitted ? "disabled" : ""}
            />
            <small className="form-text text-muted">
              From 18th till 21st, between 11:00 and 18:00
              <br />
              On 22nd, between 12:00 and 17:00
              <br />
              On 24th, between 11:00 and 16:30
            </small>
          </div>
          <div className="col-md-3">
            <select
              className="form-control"
              name="time"
              value={this.state.time}
              onChange={this.handleInputChange}
              required
              disabled={this.state.isFormSubmitted ? "disabled" : ""}
            >
              <option value=""></option>
              <option
                value="11:00"
                disabled={this.state.timeStatus1 ? "" : "disabled"}
              >
                11:00
              </option>
              <option
                value="11:30"
                disabled={this.state.timeStatus1 ? "" : "disabled"}
              >
                11:30
              </option>
              <option value="12:00">12:00</option>
              <option value="12:30">12:30</option>
              <option value="13:00">13:00</option>
              <option value="13:30">13:30</option>
              <option value="14:00">14:00</option>
              <option value="14:30">14:30</option>
              <option value="15:00">15:00</option>
              <option value="15:30">15:30</option>
              <option value="16:00">16:00</option>
              <option
                value="16:30"
                disabled={this.state.timeStatus2 ? "" : "disabled"}
              >
                16:30
              </option>
              <option
                value="17:00"
                disabled={this.state.timeStatus3 ? "" : "disabled"}
              >
                17:00
              </option>
              <option
                value="17:30"
                disabled={this.state.timeStatus3 ? "" : "disabled"}
              >
                17:30
              </option>
            </select>
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
              disabled={this.state.isFormSubmitted ? "disabled" : ""}
            />
          </div>
        </div>
        <div className="row mb-3">
          <label className="col-form-label col-md-3">GDPR:</label>
          <div className="form-check col-md-9">
            <input
              type="checkbox"
              className="form-check-input"
              required
              disabled={this.state.isFormSubmitted ? "disabled" : ""}
            />
            <label className="form-check-label">
              I understand above data provided is solely for the purpose of
              processing my order request.
            </label>
          </div>
        </div>
        {(() => {
          switch (this.state.buttonStatus) {
            default:
              return;
            case 0:
              return (
                <button
                  type="submit"
                  className="btn btn-outline-primary"
                  onClick={this.handleValication}
                >
                  Submit order request
                </button>
              );
            case 1:
              return (
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  disabled
                >
                  Submitting
                </button>
              );
            case 2:
              return (
                <button
                  type="button"
                  className="btn btn-outline-success"
                  disabled
                >
                  Submit successful
                </button>
              );
            case 3:
              return (
                <button
                  type="submit"
                  className="btn btn-outline-danger"
                  onClick={this.handleValication}
                >
                  Retry submit
                </button>
              );
          }
        })()}
        <div className="g-recaptcha mt-3"></div>
        <Reaptcha
          ref={e => (this.captcha = e)}
          sitekey="6Le85MYUAAAAAFIN9CKLxzyqnep4zJjeFxr4RpxU"
          onVerify={this.onVerify}
          size="invisible"
          badge="inline"
        />
      </form>
    );
  }
}
