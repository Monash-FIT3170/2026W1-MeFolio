const ThemeSection = () => {
    return (
        <>
        <div className="bg-background rounded-xl border border-primary p-6">
            <h2 className="m-0 text-xl font-bold text-primary">Current Theme</h2>
        </div>
        <div>
            <h2 className="text-lg font-semibold text-primary mb-4">Choose Your Theme</h2>
            <p className="text-primary mb-6">Select a template that matches your style. Preview before applying changes.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
            <div className="relative rounded-xl border-2 transition-all border-primary shadow-lg">

            </div>
        </div>
        </>
    )
}

export default ThemeSection;