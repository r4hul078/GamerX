import React, { useState } from "react";

const Cart = () => {
  const [cart, setCart] = useState([
    { id: 1, name: "RGB Gaming Mouse", price: 2500 },
    { id: 2, name: "Mechanical Keyboard (Blue Switch)", price: 7800 },
    { id: 3, name: "7.1 Surround Gaming Headset", price: 5200 },
    { id: 4, name: "Gaming Mouse Pad XL", price: 1500 },
    { id: 5, name: "PS Controller Charger Dock", price: 3200 },
  ]);

  const removeFromCart = (id) => {
    setCart(cart.filter((item) => item.id !== id));
  };

  const totalPrice = cart.reduce((sum, item) => sum + item.price, 0);

  return (
    <div style={styles.body}>
      <header style={styles.header}>🛒 GAMER X CART</header>

      <div style={styles.cartContainer}>
        {cart.length === 0 ? (
          <div style={styles.empty}>Your Gamer X cart is empty 🎮</div>
        ) : (
          cart.map((item) => (
            <div key={item.id} style={styles.cartItem}>
              <div style={styles.itemInfo}>
                <h3 style={styles.itemName}>{item.name}</h3>
                <p style={styles.price}>Rs. {item.price}</p>
              </div>
              <button style={styles.button} onClick={() => removeFromCart(item.id)}>
                Remove
              </button>
            </div>
          ))
        )}
      </div>

      {cart.length > 0 && (
        <div style={styles.totalContainer}>
          <span>Total</span>
          <span>Rs. {totalPrice}</span>
        </div>
      )}
    </div>
  );
};

const styles = {
  body: {
    fontFamily: "Segoe UI, sans-serif",
    margin: 0,
    padding: 0,
    background: "#f9f9f9",
    color: "#111",
    minHeight: "100vh",
  },
  header: {
    padding: "20px",
    textAlign: "center",
    fontSize: "28px",
    fontWeight: "bold",
    letterSpacing: "2px",
    color: "#3b82f6",
    backgroundColor: "#fff",
    boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
  },
  cartContainer: {
    maxWidth: "800px",
    margin: "40px auto",
    padding: "0 20px",
  },
  cartItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    background: "#fff",
    marginBottom: "15px",
    padding: "18px",
    borderRadius: "12px",
    boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
    transition: "transform 0.2s, box-shadow 0.2s",
  },
  cartItemHover: {
    transform: "scale(1.02)",
    boxShadow: "0 0 15px rgba(59, 130, 246, 0.3)",
  },
  itemInfo: {},
  itemName: {
    margin: 0,
    fontSize: "20px",
  },
  price: {
    margin: "6px 0",
    color: "#6b7280",
    fontWeight: "bold",
  },
  button: {
    background: "#ef4444",
    border: "none",
    color: "#fff",
    padding: "10px 16px",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "14px",
  },
  totalContainer: {
    maxWidth: "800px",
    margin: "20px auto",
    padding: "20px",
    background: "#fff",
    borderRadius: "12px",
    fontSize: "22px",
    display: "flex",
    justifyContent: "space-between",
    boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
  },
  empty: {
    textAlign: "center",
    fontSize: "20px",
    marginTop: "50px",
    color: "#6b7280",
  },
};

export default Cart;