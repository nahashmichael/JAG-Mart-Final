import { create } from 'zustand';
import { User } from '@supabase/supabase-js';
import { CartStore } from './types';
import { supabase } from './supabase';

interface AuthState {
  user: User | null;
  setUser: (user: User | null) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
}));

export const useCartStore = create<CartStore>((set, get) => ({
  items: [],
  
  addItem: async (product, quantity) => {
    const user = useAuthStore.getState().user;
    if (!user) throw new Error('Must be logged in to add items to cart');

    const { data: existingCart } = await supabase
      .from('carts')
      .select('id')
      .eq('user_id', user.id)
      .single();

    let cartId = existingCart?.id;

    if (!cartId) {
      const { data: newCart } = await supabase
        .from('carts')
        .insert({ user_id: user.id })
        .select('id')
        .single();
      cartId = newCart?.id;
    }

    if (!cartId) throw new Error('Failed to create cart');

    await supabase
      .from('cart_items')
      .upsert({
        cart_id: cartId,
        product_id: product.id,
        quantity,
      });

    const { data: items } = await supabase
      .from('cart_items')
      .select('*, product:products(*)')
      .eq('cart_id', cartId);

    set({ items: items || [] });
  },

  removeItem: async (productId) => {
    const user = useAuthStore.getState().user;
    if (!user) return;

    const { data: cart } = await supabase
      .from('carts')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (cart) {
      await supabase
        .from('cart_items')
        .delete()
        .eq('cart_id', cart.id)
        .eq('product_id', productId);

      const { data: items } = await supabase
        .from('cart_items')
        .select('*, product:products(*)')
        .eq('cart_id', cart.id);

      set({ items: items || [] });
    }
  },

  updateQuantity: async (productId, quantity) => {
    const user = useAuthStore.getState().user;
    if (!user) return;

    const { data: cart } = await supabase
      .from('carts')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (cart) {
      await supabase
        .from('cart_items')
        .update({ quantity })
        .eq('cart_id', cart.id)
        .eq('product_id', productId);

      const { data: items } = await supabase
        .from('cart_items')
        .select('*, product:products(*)')
        .eq('cart_id', cart.id);

      set({ items: items || [] });
    }
  },

  clearCart: async () => {
    const user = useAuthStore.getState().user;
    if (!user) return;

    const { data: cart } = await supabase
      .from('carts')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (cart) {
      await supabase
        .from('cart_items')
        .delete()
        .eq('cart_id', cart.id);

      set({ items: [] });
    }
  },
}));