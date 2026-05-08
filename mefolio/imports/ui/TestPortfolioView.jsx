import { ModeSwitch } from "./ModeButton.jsx";
import { useNavigate } from "react-router-dom";

//test page will be replaced with the actual preview
export const TestPortfolioView = () => {
    const navigate = useNavigate();

    return (
        <div className="placeholder-card" style={{ margin: '40px' }}>
            <h1>Test Portfolio Preview</h1>
            <p>This is where the user can preview their portfolio.</p>
            <div className={`fixed top-40 left-4 z-50`}>
                <ModeSwitch
                    initialPreview={true} //on the preview page
                    onToggle={(isPreview) => {
                        if (!isPreview) {
                            navigate('/'); //go home
                        }
                    }}
                />
            </div>
        </div>
    );
}
