import React, { useEffect } from "react";
import { UPDATE_CATEGORIES, UPDATE_CURRENT_CATEGORY } from '../../utils/actions';
import { useQuery } from '@apollo/react-hooks';
import { QUERY_CATEGORIES } from "../../utils/queries";
import { idbPromise } from '../../utils/helpers';
// import { useStoreContext } from "../../utils/GlobalState";
import { connect } from 'react-redux';

function CategoryMenu(props) {
  // const { data: categoryData } = useQuery(QUERY_CATEGORIES);
  // const categories = categoryData?.categories || [];
  console.log('MyProps: ', props);
  //const state = props.state;

  const { categories } = props.categories;

  const { loading, data: categoryData } = useQuery(QUERY_CATEGORIES);

  useEffect(() => {
    if (categoryData) {
      props.dispatch({
        type: UPDATE_CATEGORIES,
        categories: categoryData.categories
      });
      categoryData.categories.forEach(category => {
        idbPromise('categories', 'put', category);
      });
    } else if (!loading) {
      idbPromise('categories', 'get').then(categories => {
        props.dispatch({
          type: UPDATE_CATEGORIES,
          categories: categories
        });
      });
    }
  }, [categoryData, loading, props.dispatch]);

  const handleClick = id => {
    props.dispatch({
      type: UPDATE_CURRENT_CATEGORY,
      currentCategory: id
    });
  };

  return (
    <div>
      <h2>Choose a Category:</h2>
      {props.categories.map(item => (
        <button
          key={item._id}
          onClick={() => {
            handleClick(item._id);
          }}
        >
          {item.name}
        </button>
      ))}
    </div>
  );
}

const mapStateToProps = (state) => {
  const { categories } = state;
  return { categories }
}

// const mapDispatchToProps = (dispatch) => {
//   return {
//     updateCategories: dispatch({
//       type: UPDATE_CATEGORIES,
//       categories: categoryData.categories
//     }),
//     handleClick: dispatch({
//       type: UPDATE_CURRENT_CATEGORY,
//       currentCategory: id
//     })
//   }
// }



export default connect(mapStateToProps)(CategoryMenu);
