/* eslint-disable */
import axios from 'axios';
const stripe = Stripe(
  'pk_test_51LHCOsKzs9BlkJIhSatrtuCoxNSCJs3TRPcOwMizAKBZasWbyU8HIPnCO6UECtZxg49v9PdtZ5DSI95OpHTBFl8u00R2O4di0r'
);

export const bookTour = async (tourId) => {
  try {
    //1) get checkout session from endpoint/API
    const session = await axios(`/api/v1/booking/checkout-session/${tourId}`);
    // console.log(session);

    //2) create checkout from + charge credit card
    await stripe.redirectToCheckout({
      sessionId: session.data.session.id,
    });
  } catch (err) {
    console.log(err);
  }
};
