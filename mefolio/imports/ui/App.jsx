import { PortfolioBuilderView } from "./PortfolioBuilderView.jsx";
import { PortfolioView } from "./PortfolioView.jsx";
import { BrowserRouter, Routes, Route} from "react-router-dom";

export const App = () => (
  <BrowserRouter>
    <Routes>
      {/* Builder dashboard */}
      <Route path="/" element={<PortfolioBuilderView />} />

      {/* Public portfolio */}
      <Route path="/portfolio/:username" element={<PortfolioView />} />
    </Routes>
  </BrowserRouter>
);
