import {
  UserDetails,
} from ".";

interface GlobalState {
  // products: Product[];
  // cart: (OrderItem & { name: string; image: string })[];
  // wishlist: [];
  // appointments: Appointment[];
  // orders: Order[];
  currentUser: UserDetails | null;
  loading: boolean;
  getCurrentUser: () => Promise<void>;
  removeUser: () => void;
}

export default GlobalState;
