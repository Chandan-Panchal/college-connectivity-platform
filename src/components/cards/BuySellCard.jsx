import { ShoppingCart } from "lucide-react";
import { Link } from "react-router-dom";

export default function BuySellCard() {
    return (
        <Link to="/buy-sell" className="card-glass block">
            <div className="icon-wrapper">
                <ShoppingCart size={26} />
            </div>

            <h3 className="card-title">Buy & Sell</h3>
            <p className="card-desc">
                Trade books and essentials within your campus.
            </p>
        </Link>
    );
}
