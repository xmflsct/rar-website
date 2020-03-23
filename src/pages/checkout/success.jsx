import React from "react";

import Layout from "../../components/layout";

const CheckoutSuccess = ({ location }) => {
  return (
    <Layout
      location={location}
      name="Thank you!"
      SEOtitle="Thank you!"
      SEOkeywords={["Checkout", "Rotterdam"]}
    >
      <h3 className="sub-heading mb-3" id="matcha-lovers">
        Thank you for your order!
      </h3>
      <p>
        You should receive a payment confirmation email pretty soon. In case you
        have any question, feel free to contact us.
      </p>
    </Layout>
  );
};

export default CheckoutSuccess;
