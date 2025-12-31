// client/src/lib/cart.ts

export interface CartItem {
  id: string;
  title: string;
  price: number;
  image: string;
  size?: string;
  color?: string;
  quantity: number;
  stock?: number;
  category?: string;
  normalPrice?: number;
  originalPrice?: number;
  offerPrice?: number;
}

// Get cart from localStorage
export const getCart = (): CartItem[] => {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem("cart") || "[]");
  } catch (error) {
    console.error("Error parsing cart from localStorage:", error);
    return [];
  }
};

// Save cart to localStorage
export const saveCart = (cart: CartItem[]) => {
  if (typeof window === "undefined") return;
  localStorage.setItem("cart", JSON.stringify(cart));
};

// Add item to cart
export const addToCart = (item: CartItem) => {
  const cart = getCart();
  const index = cart.findIndex(
    (i) => i.id === item.id && i.size === item.size && i.color === item.color
  );

  if (index >= 0) {
    cart[index].quantity += item.quantity;
  } else {
    cart.push(item);
  }

  saveCart(cart);
  window.dispatchEvent(new Event("cart-updated"));
};

// Remove item from cart
export const removeFromCart = (id: string, size?: string, color?: string) => {
  const cart = getCart();
  const updated = cart.filter(
    (i) => !(i.id === id && i.size === size && i.color === color)
  );
  saveCart(updated);
  window.dispatchEvent(new Event("cart-updated"));
};

// Update quantity
export const updateQuantity = (id: string, delta: number, size?: string, color?: string) => {
  const cart = getCart();
  const updated = cart.map((item) => {
    if (item.id === id && item.size === size && item.color === color) {
      const newQty = Math.min(Math.max(item.quantity + delta, 1), item.stock || 99);
      return { ...item, quantity: newQty };
    }
    return item;
  });
  saveCart(updated);
  window.dispatchEvent(new Event("cart-updated"));
};

// Get total price
export const getCartTotal = (): number => {
  const cart = getCart();
  return cart.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 1), 0);
};

// Get total items count
export const getCartItemCount = (): number => {
  const cart = getCart();
  return cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
};
