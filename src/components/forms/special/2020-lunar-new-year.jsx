import React from "react";
import Reaptcha from "reaptcha";
import { order_request_sendgrid } from "../../api/order-request-sendgrid";

export default class Form2020LunarNewYear extends React.Component {
  constructor(props) {
    super(props);
    this.captcha = null;
  }
  state = {
    buttonStatus: 0, // 0 active; 1 sending; 2 success; 3 fail
    timeStatus: true, // 11:30-17:30 else 12:30-16:30
    isFormValidated: false,
    isFormSubmitted: false,
    name: "",
    phone: "",
    email: "",
    option1: "0",
    option2: "0",
    date: "2020-01-22",
    time: "",
    notes: ""
  };
  onVerify = token => {
    var content =
      "[Golden Rat Year]: " +
      this.state.option1 +
      ".<br /> [Happiness is here]: " +
      this.state.option2 +
      ".<br /> Notes: " +
      this.state.notes;
    var datetime = this.state.date + " at " + this.state.time;
    // order_request_sendgrid(
    //   token,
    //   this.state.email,
    //   "[2020 Lunar New Year] Order from " + this.state.name,
    //   content,
    //   this.state.name,
    //   this.state.phone,
    //   datetime
    // )
    //   .then(() => {
    //     this.setState({ buttonStatus: 2 });
    //     this.setState({ isFormSubmitted: true });
    //   })
    //   .catch(() => {
    //     this.setState({ buttonStatus: 3 });
    //   });
  };
  handleInputChange = event => {
    const target = event.target;
    const value = target.value;
    const name = target.name;

    // Date time validation
    if (name === "date") {
      if (
        value === "2020-01-22" ||
        value === "2020-01-23" ||
        value === "2020-01-24" ||
        value === "2020-01-25"
      ) {
        this.setState({ timeStatus: true });
      } else if (value === "2020-01-26") {
        this.setState({ timeStatus: false });
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
    this.setState({ buttonStatus: 1 });
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
          <label className="col-form-label col-md-3" htmlFor="name">Your name:</label>
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
          <label className="col-form-label col-md-3" htmlFor="phone">Your phone:</label>
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
          <label className="col-form-label col-md-3" htmlFor="email">Your email:</label>
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
              <label className="col-form-label" htmlFor="option1">1 [Golden Rat Year]:</label>
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
              <label className="col-form-label" htmlFor="option2">2 [Happiness is here]:</label>
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
          <label className="col-form-label col-md-3" htmlFor="date">Pick-up date&amp;time:</label>
          <div className="col-md-6">
            <input
              type="date"
              className="form-control"
              name="date"
              value={this.state.date}
              onChange={this.handleInputChange}
              required
              min="2020-01-22"
              max="2020-01-26"
              disabled={this.state.isFormSubmitted ? "disabled" : ""}
            />
            <small className="form-text text-muted">
              From 22nd till 25th, between 11:30 and 17:30
              <br />
              On 26th, between 12:30 and 16:00
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
                value="11:30"
                disabled={this.state.timeStatus ? "" : "disabled"}
              >
                11:30
              </option>
              <option
                value="12:00"
                disabled={this.state.timeStatus ? "" : "disabled"}
              >
                12:00
              </option>
              <option value="12:30">12:30</option>
              <option value="13:00">13:00</option>
              <option value="13:30">13:30</option>
              <option value="14:00">14:00</option>
              <option value="14:30">14:30</option>
              <option value="15:00">15:00</option>
              <option value="15:30">15:30</option>
              <option value="16:00">16:00</option>
              <option value="16:00">16:30</option>
              <option
                value="17:00"
                disabled={this.state.timeStatus ? "" : "disabled"}
              >
                17:00
              </option>
              <option
                value="17:30"
                disabled={this.state.timeStatus ? "" : "disabled"}
              >
                17:30
              </option>
            </select>
          </div>
        </div>
        <div className="form-group row">
          <label className="col-form-label col-md-3" htmlFor="notes">Notes to us:</label>
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
          <label className="col-form-label col-md-3" htmlFor="gdpr">GDPR:</label>
          <div className="form-check col-md-9">
            <input
              type="checkbox"
              className="form-check-input"
              name="gdpr"
              required
              disabled={this.state.isFormSubmitted ? "disabled" : ""}
            />
            <label className="form-check-label" htmlFor="consent">
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
