import React from "react";
import { Link } from "react-router-dom";
import { pluralize } from "../../utils/helpers"
// import { useStoreContext } from '../../utils/GlobalState';
import { ADD_TO_CART, UPDATE_CART_QUANTITY } from '../../utils/actions';
import { idbPromise } from "../../utils/helpers";
import { connect } from 'react-redux';

function ProductItem(props) {
  console.log('Product Item Props: ', props)
  //const [state, dispatch] = useStoreContext();
  const { cart } = props.state;

  const item = {
    image: props.image,
    name: props.name,
    _id: props._id,
    price: props.price,
    quantity: props.quantity
  }

  const addToCart = () => {
    const itemInCart = cart.find((cartItem) => cartItem._id === props._id)
    if (itemInCart) {
      props.dispatch({
        type: UPDATE_CART_QUANTITY,
        _id: props._id,
        purchaseQuantity: parseInt(itemInCart.purchaseQuantity) + 1
      });
      idbPromise('cart', 'put', {
        ...itemInCart,
        purchaseQuantity: parseInt(itemInCart.purchaseQuantity) + 1
      });
    } else {
      props.dispatch({
        type: ADD_TO_CART,
        product: { ...item, purchaseQuantity: 1 }
      });
      idbPromise('cart', 'put', { ...item, purchaseQuantity: 1 });
    }
  }
  // const {
  //   image,
  //   name,
  //   _id,
  //   price,
  //   quantity
  // } = props.item;

  return (
    <div className="card px-1 py-1">
      <Link to={`/products/${props._id}`}>
        <img
          alt={props.name}
          src={`/images/${props.image}`}
        />
        <p>{props.name}</p>
      </Link>
      <div>
        <div>{props.quantity} {pluralize("item", props.quantity)} in stock</div>
        <span>${props.price}</span>
      </div>
      <button onClick={addToCart}>Add to cart</button>
    </div>
  );
}

const mapStateToProps = (state) => {
  return { state }
}


export default connect(mapStateToProps)(ProductItem);
