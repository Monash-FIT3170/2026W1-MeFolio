import "./TestPortfolioView.css";
import {ModeSwitch} from "./ModeButton.jsx";
import {useNavigate} from "react-router-dom";

export const TestPortfolioView = () => {
    const navigate = useNavigate();

    return (
        <div className="test-portfolio-view">
            <h1 className="test-title">test portfolio view.</h1>
            <ModeSwitch 
            initialPreview={true}
            onToggle={() => navigate("/")}
             />
        </div>
        
    );
}