const express = require('express');
const router = express.Router();
const stripe = require('stripe')('sk_test_51OpvfCKcaXlZmQKjYgT70lzk7V1jhRCiFQstpGOzW0YQswpiZwreRoNwX4RkrnQEfwOSeGJYIMn2MLWJ64c5K2XL00rhrbnahY');
//router endpoint
router.post('/intents', async(req, res) =>{
    try {
          //create payment intent
          const paymentIntent = await stripe.paymentIntents.create({
            amount: req.body.amount,
            currency: 'eur',
            automatic_payment_methods: {
              enabled: true,
            },
            payment_method_type: ["card"] //by default
          });
             //return the secret
             const clientSecret = paymentIntent.client_secret;

             res.json({
               clientSecret: clientSecret,
             });
        
    } catch (e) {
        res.status(400).json({
            error: e.message,
        });
    }
  
   
})

module.exports = router;