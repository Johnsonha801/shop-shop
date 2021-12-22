import React, { useEffect } from 'react';
import CartItem from '../CartItem';
import Auth from '../../utils/auth';
import './style.css';
//import { useStoreContext } from '../../utils/GlobalState';
import { TOGGLE_CART, ADD_MULTIPLE_TO_CART } from "../../utils/actions";
import { idbPromise } from "../../utils/helpers";
import { QUERY_CHECKOUT } from '../../utils/queries';
import { loadStripe } from '@stripe/stripe-js';
import { useLazyQuery } from '@apollo/react-hooks';
import { connect } from 'react-redux';
const stripePromise = loadStripe('pk_test_TYooMQauvdEDq54NiTphI7jx');

const Cart = (props) => {
    //const [state, dispatch] = useStoreContext();
    
    const [getCheckout, { data }] = useLazyQuery(QUERY_CHECKOUT);

    useEffect(() => {
        async function getCart() {
          const cart = await idbPromise('cart', 'get');
          props.dispatch({ type: ADD_MULTIPLE_TO_CART, products: [...cart] });
        };
      
        if (!props.state.cart.length) {
          getCart();
        }
    }, [props.state.cart.length, props.dispatch]);

    // redirect to Stripe if data exists from useLazyQuery hook
    useEffect(() => {
        if (data) {
          stripePromise.then((res) => {
            res.redirectToCheckout({ sessionId: data.checkout.session });
          });
        }
    }, [data]);

    console.log(props.state)

    // ToggleCart
    function toggleCart() {
      props.dispatch({ type: TOGGLE_CART });
    }

    // Calculate total price
    function calculateTotal() {
        let sum = 0;
        props.state.cart.forEach(item => {
          sum += item.price * item.purchaseQuantity;
        });
        return sum.toFixed(2);
    }

    // Submit stripe checkout
    function submitCheckout() {
        const productIds = [];
      
        props.state.cart.forEach((item) => {
          for (let i = 0; i < item.purchaseQuantity; i++) {
            productIds.push(item._id);
          }
        });

        // Get Checkout - Calls useLazyQuery Hook
        getCheckout({
            variables: { products: productIds }
        });
    }

    if (!props.state.cartOpen) {
        return (
          <div className="cart-closed" onClick={toggleCart}>
            <span
              role="img"
              aria-label="trash">🛒</span>
          </div>
        );
    }

    return (
        <div className="cart">
            <div className="close" onClick={toggleCart}>[close]</div>
            <h2>Shopping Cart</h2>
            {props.state.cart.length ? (
                <div>
                {props.state.cart.map(item => (
                    <CartItem key={item._id} item={item} />
                ))}
                <div className="flex-row space-between">
                    <strong>Total: ${calculateTotal()}</strong>
                    {
                    Auth.loggedIn() ?
                        <button onClick={submitCheckout}>
                            Checkout
                        </button>
                        :
                        <span>(log in to check out)</span>
                    }
                </div>
                </div>
            ) : (
                <h3>
                <span role="img" aria-label="shocked">
                    😱
                </span>
                You haven't added anything to your cart yet!
                </h3>
            )}
        </div>
    );
};

const mapStateToProps = (state) => {
  return { state }
}

export default connect(mapStateToProps)(Cart);