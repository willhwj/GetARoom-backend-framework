const {Order, Cart_item} = require('../models');

const getOrdersByCustId = async( custId) => {
    return await Order.where({
        'customer_id': custId
    }).fetchAll({
        require: false,
        withRelated: ['cartItems']
    })
}

// const getCartItemsByOrderId = async (orderId)=> {
//     return await Cart_item.where({
//         'order_id': orderId
//     }).fetchAll({
//         require: false
//     })
// }

// const getCartItemsByCustId = async (custId)=> {
//     let order = getO
// }

module.exports = {getOrdersByCustId}