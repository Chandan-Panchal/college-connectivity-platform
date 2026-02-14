import { ShoppingCart } from "lucide-react";

export default function BuySellCard() {
    return (
        <div className="card-glass">
            <div className="icon-wrapper">
                <ShoppingCart size={26} />
            </div>

            <h3 className="card-title">Buy & Sell</h3>
            <p className="card-desc">
                Trade books and essentials within your campus.
            </p>
        </div>
    );
}
