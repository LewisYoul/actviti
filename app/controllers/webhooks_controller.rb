class WebhooksController < ApplicationController
  protect_from_forgery with: :null_session

  def stripe
    # TODO: authorize
    event = Stripe::Event.construct_from(params.permit!.to_h)

    case event.type
    when "checkout.session.completed"
      puts "\n\n\n SESSION COMPLETE \n\n\n"

      StripeServices::CheckoutSessionCompleter.new(event.data.object).complete
    when 'customer.subscription.updated'
      puts "\n\n\n SUBSCRIPTION UPDATED \n\n\n"

      stripe_subscription = event.data.object

      subscription = Subscription.find_by!(stripe_subscription_id: stripe_subscription.id)

      subscription.update!(cancel_at_period_end: stripe_subscription.cancel_at_period_end)

      # extract to service
      # send an email?
    when "customer.subscription.deleted"
      puts "\n\n\n SUBSCRIPTION CANCELLED \n\n\n"

      StripeServices::SubscriptionCanceller.new(event.data.object).cancel!
    when 'invoice.paid'
      puts "\n\n\n INVOICE PAID \n\n\n"
      
      invoice = event.data.object

      subscription = Subscription.find_by(stripe_subscription_id: invoice.subscription)

      subscription.update!(status: 'active')
    when 'invoice.payment_failed'
      puts "\n\n\n INVOICE PAYMENT FAILED \n\n\n"

      invoice = event.data.object

      subscription = Subscription.find_by(stripe_subscription_id: invoice.subscription)

      subscription.update!(status: 'past_due')
    else
      puts "\n\n\n Unhandled event type #{event.type} \n\n\n"
    end
  end
end