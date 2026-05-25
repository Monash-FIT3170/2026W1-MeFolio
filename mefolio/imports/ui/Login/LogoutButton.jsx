const LogoutButton = () => {
    const handleLogout = () => {
        Meteor.logout((err) => {
            if (err) {
                console.error("Error logging out:", err);
            }
        });
    };

    return (
        <button onClick={handleLogout} className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition">
            Logout
        </button>
    );
};

export default LogoutButton;