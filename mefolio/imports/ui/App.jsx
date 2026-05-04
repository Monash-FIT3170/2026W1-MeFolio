import { PortfolioBuilderView } from "./PortofolioBuilderView.jsx";
import { BrowserRouter as Router} from "react-router-dom";

export const App = () => (
  <Router>
  <div className="page">
    <PortfolioBuilderView />
  </div>
  </Router>
);
