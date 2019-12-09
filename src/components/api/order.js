export async function order_request(
  recaptchaToken,
  card,
  description,
  label,
  name,
  phone,
  email,
  date,
  time
) {
  if (time) {
    Date.prototype.stdTimezoneOffset = function() {
      var jan = new Date(this.getFullYear(), 0, 1);
      var jul = new Date(this.getFullYear(), 6, 1);
      return Math.max(jan.getTimezoneOffset(), jul.getTimezoneOffset());
    };

    Date.prototype.isDstObserved = function() {
      return this.getTimezoneOffset() < this.stdTimezoneOffset();
    };

    var today = new Date();
    if (today.isDstObserved()) {
      date = date + "T" + time + ":00.000+02:00";
    } else {
      date = date + "T" + time + ":00.000+01:00";
    }
  } else {
    date = date + "T12:00:00.000Z";
  }

  await fetch("https://europe-west1-rar-api.cloudfunctions.net/order", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      recaptchaToken: recaptchaToken,
      card: card,
      description: description,
      label: label,
      name: name,
      phone: phone,
      email: email,
      date: date
    })
  }).then(response => {
    if (response.status === 200) {
      return Promise.resolve();
    } else {
      return Promise.reject();
    }
  });
}
